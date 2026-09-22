package com.example.billing_service.service;

import com.example.billing_service.client.AppointmentClient;
import com.example.billing_service.dto.request.PaymentRequest;
import com.example.billing_service.dto.request.RefundRequest;
import com.example.billing_service.dto.response.*;
import com.example.billing_service.entity.Payment;
import com.example.billing_service.entity.PaymentStatus;
import com.example.billing_service.exception.DuplicateResourceException;
import com.example.billing_service.exception.InvalidOperationException;
import com.example.billing_service.exception.ResourceNotFoundException;
import com.example.billing_service.exception.UnauthorizedActionException;
import com.example.billing_service.repository.PaymentRepository;
import com.example.billing_service.security.UserContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final UserContext userContext;
    private final AppointmentClient appointmentClient;

    // 1. MAKE PAYMENT (Customer)
    @Transactional
    public PaymentResponse makePayment(PaymentRequest request) {
        String customerEmail = userContext.getCurrentUserEmail();
        log.info("Billing payment for appointment {} by {}", request.getAppointmentId(), customerEmail);

        // Prevent duplicate payments
        if (paymentRepository.existsByAppointmentIdAndActiveTrue(request.getAppointmentId())) {
            throw new DuplicateResourceException(
                    "Payment already exists for appointment " + request.getAppointmentId()
            );
        }

        // Verify appointment via Feign
        AppointmentSummary appointment;
        try {
            appointment = appointmentClient.getAppointmentById(request.getAppointmentId());
        } catch (Exception e) {
            log.error("Failed to fetch appointment: {}", e.getMessage());
            throw new ResourceNotFoundException("Appointment not found: " + request.getAppointmentId());
        }

        // Ownership check
        if (!userContext.isAdmin() && !appointment.getCustomerEmail().equals(customerEmail)) {
            throw new UnauthorizedActionException("You can only pay for your own appointments");
        }

        // Calculate total
        double tax = request.getTax() != null ? request.getTax() : 0.0;
        double discount = request.getDiscount() != null ? request.getDiscount() : 0.0;
        double totalAmount = request.getAmount() + tax - discount;

        Payment payment = new Payment();
        payment.setPaymentReference(generateReference());
        payment.setAppointmentId(request.getAppointmentId());
        payment.setCustomerEmail(customerEmail);
        payment.setAmount(request.getAmount());
        payment.setTax(tax);
        payment.setDiscount(discount);
        payment.setTotalAmount(totalAmount);
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setNotes(request.getNotes());
        payment.setActive(true);

        // MOCK payment processing — always succeed
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setTransactionId("TXN-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase());
        payment.setPaidAt(LocalDateTime.now());

        Payment saved = paymentRepository.save(payment);
        log.info("Payment successful: {} for ₹{}", saved.getPaymentReference(), totalAmount);

        return toResponse(saved);
    }

    // 2. GET BY ID
    public PaymentResponse getPaymentById(Long id) {
        Payment payment = paymentRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found: " + id));

        String email = userContext.getCurrentUserEmail();
        if (!userContext.isAdmin() && !payment.getCustomerEmail().equals(email)) {
            throw new UnauthorizedActionException("You cannot view this payment");
        }
        return toResponse(payment);
    }

    // 3. GET MY PAYMENTS
    public List<PaymentSummaryResponse> getMyPayments() {
        if (userContext.isAdmin()) {
            return paymentRepository.findAllByActiveTrueOrderByCreatedAtDesc()
                    .stream().map(this::toSummary).collect(Collectors.toList());
        }
        String email = userContext.getCurrentUserEmail();
        return paymentRepository.findByCustomerEmailAndActiveTrueOrderByCreatedAtDesc(email)
                .stream().map(this::toSummary).collect(Collectors.toList());
    }

    // 4. GET BY APPOINTMENT
    public PaymentResponse getPaymentByAppointment(Long appointmentId) {
        Payment payment = paymentRepository.findByAppointmentIdAndActiveTrue(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No payment found for appointment: " + appointmentId));

        String email = userContext.getCurrentUserEmail();
        if (!userContext.isAdmin() && !payment.getCustomerEmail().equals(email)) {
            throw new UnauthorizedActionException("You cannot view this payment");
        }
        return toResponse(payment);
    }

    // 5. FILTER BY STATUS (Admin)
    public List<PaymentSummaryResponse> getByStatus(PaymentStatus status) {
        if (!userContext.isAdmin()) {
            throw new UnauthorizedActionException("Only Admin can filter by status");
        }
        return paymentRepository.findByStatusAndActiveTrueOrderByCreatedAtDesc(status)
                .stream().map(this::toSummary).collect(Collectors.toList());
    }

    // 6. REFUND (Admin)
    @Transactional
    public PaymentResponse refund(Long id, RefundRequest request) {
        if (!userContext.isAdmin()) {
            throw new UnauthorizedActionException("Only Admin can refund payments");
        }

        Payment payment = paymentRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found: " + id));

        if (payment.getStatus() != PaymentStatus.SUCCESS) {
            throw new InvalidOperationException("Only SUCCESS payments can be refunded");
        }

        payment.setStatus(PaymentStatus.REFUNDED);
        payment.setRefundedAt(LocalDateTime.now());
        payment.setNotes((payment.getNotes() != null ? payment.getNotes() + " | " : "")
                + "REFUND: " + request.getReason());

        Payment updated = paymentRepository.save(payment);
        log.info("Payment {} refunded. Reason: {}", payment.getPaymentReference(), request.getReason());
        return toResponse(updated);
    }

    // 7. INTERNAL
    public PaymentResponse getInternal(Long id) {
        Payment payment = paymentRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found: " + id));
        return toResponse(payment);
    }

    // HELPERS
    private String generateReference() {
        return "PAY-" + System.currentTimeMillis() + "-"
                + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    }

    private PaymentResponse toResponse(Payment p) {
        return new PaymentResponse(
                p.getId(), p.getPaymentReference(), p.getAppointmentId(), p.getCustomerEmail(),
                p.getAmount(), p.getTax(), p.getDiscount(), p.getTotalAmount(),
                p.getStatus(), p.getPaymentMethod(), p.getTransactionId(),
                p.getPaidAt(), p.getRefundedAt(), p.getNotes(),
                p.getCreatedAt(), p.getUpdatedAt()
        );
    }

    private PaymentSummaryResponse toSummary(Payment p) {
        return new PaymentSummaryResponse(
                p.getId(), p.getPaymentReference(), p.getAppointmentId(),
                p.getTotalAmount(), p.getStatus(), p.getPaymentMethod(), p.getCreatedAt()
        );
    }
}