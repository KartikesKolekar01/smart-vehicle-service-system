package com.example.billing_service.service;

import com.example.billing_service.client.AppointmentClient;
import com.example.billing_service.client.NotificationClient;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final UserContext userContext;
    private final AppointmentClient appointmentClient;
    private final NotificationClient notificationClient;

    // ══════════════════════════════════════════════════════════
    // 1. MAKE PAYMENT (Legacy direct payment)
    // ══════════════════════════════════════════════════════════
    @Transactional
    public PaymentResponse makePayment(PaymentRequest request) {
        String customerEmail = userContext.getCurrentUserEmail();
        log.info("Payment attempt for appointment {} by {}", request.getAppointmentId(), customerEmail);

        if (paymentRepository.existsByAppointmentIdAndActiveTrue(request.getAppointmentId())) {
            throw new DuplicateResourceException(
                    "Payment already exists for appointment " + request.getAppointmentId()
            );
        }

        AppointmentSummary appointment = fetchAndValidateAppointment(
                request.getAppointmentId(), customerEmail
        );

        double totalAmount = calculateTotal(request);

        Payment payment = new Payment();
        payment.setPaymentReference(generateReference());
        payment.setAppointmentId(request.getAppointmentId());
        payment.setCustomerEmail(customerEmail);
        payment.setAmount(request.getAmount());
        payment.setTax(request.getTax() != null ? request.getTax() : 0.0);
        payment.setDiscount(request.getDiscount() != null ? request.getDiscount() : 0.0);
        payment.setTotalAmount(totalAmount);
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setPaymentGateway("MOCK");
        payment.setTransactionId("TXN-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase());
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setPaidAt(LocalDateTime.now());
        payment.setNotes(request.getNotes());
        payment.setActive(true);

        Payment saved = paymentRepository.save(payment);
        log.info("Payment successful: {} for Rs {}", saved.getPaymentReference(), totalAmount);

        // ✅ Send notification
        sendNotification(
                saved.getCustomerEmail(),
                "Payment Successful",
                "Your payment of Rs " + saved.getTotalAmount() +
                        " has been received successfully. Reference: " + saved.getPaymentReference(),
                "PAYMENT_RECEIVED",
                saved.getId()
        );

        return toResponse(saved);
    }

    // ══════════════════════════════════════════════════════════
    // 2. CREATE BILL (Admin) — status = PENDING
    // ══════════════════════════════════════════════════════════
    @Transactional
    public PaymentResponse createBill(PaymentRequest request) {
        if (!userContext.isAdmin()) {
            throw new UnauthorizedActionException("Only Admin can create bills");
        }

        if (paymentRepository.existsByAppointmentIdAndActiveTrue(request.getAppointmentId())) {
            throw new DuplicateResourceException(
                    "Bill already exists for appointment " + request.getAppointmentId()
            );
        }

        AppointmentSummary appointment;
        try {
            appointment = appointmentClient.getAppointmentById(request.getAppointmentId());
        } catch (Exception e) {
            throw new ResourceNotFoundException("Appointment not found: " + request.getAppointmentId());
        }

        if (!"COMPLETED".equals(appointment.getStatus())) {
            throw new InvalidOperationException(
                    "Cannot create bill — appointment is not completed yet"
            );
        }

        double totalAmount = calculateTotal(request);

        Payment payment = new Payment();
        payment.setPaymentReference(generateReference());
        payment.setAppointmentId(request.getAppointmentId());
        payment.setCustomerEmail(appointment.getCustomerEmail());
        payment.setAmount(request.getAmount());
        payment.setTax(request.getTax() != null ? request.getTax() : 0.0);
        payment.setDiscount(request.getDiscount() != null ? request.getDiscount() : 0.0);
        payment.setTotalAmount(totalAmount);
        payment.setStatus(PaymentStatus.PENDING);
        payment.setPaymentGateway("MOCK");
        payment.setNotes(request.getNotes());
        payment.setActive(true);

        Payment saved = paymentRepository.save(payment);
        log.info("Bill {} created for {}", saved.getPaymentReference(), appointment.getCustomerEmail());

        // ✅ Send notification
        sendNotification(
                saved.getCustomerEmail(),
                "New Bill Received",
                "You have a new bill of Rs " + saved.getTotalAmount() +
                        " for appointment #" + saved.getAppointmentId() +
                        ". Please pay at your convenience.",
                "PAYMENT_PENDING",
                saved.getId()
        );

        return toResponse(saved);
    }

    // ══════════════════════════════════════════════════════════
    // 3. PAY BILL (Customer) — WITH VALIDATION
    // ══════════════════════════════════════════════════════════
    @Transactional
    public PaymentResponse payBill(Long id, PaymentRequest request) {
        String email = userContext.getCurrentUserEmail();
        log.info("Bill payment attempt for ID {} by {}", id, email);

        Payment payment = paymentRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found: " + id));

        if (!payment.getCustomerEmail().equals(email)) {
            throw new UnauthorizedActionException("This bill does not belong to you");
        }

        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new InvalidOperationException(
                    "Bill is not payable. Current status: " + payment.getStatus()
            );
        }

        if (request.getAmount() != null &&
                !request.getAmount().equals(payment.getTotalAmount())) {
            throw new InvalidOperationException(
                    "Amount mismatch. Expected: Rs " + payment.getTotalAmount()
            );
        }

        if (request.getPaymentReference() == null ||
                !request.getPaymentReference().equals(payment.getPaymentReference())) {
            throw new InvalidOperationException("Invalid payment reference");
        }

        if (request.getTransactionId() != null && !request.getTransactionId().isBlank()) {
            if (paymentRepository.existsByTransactionId(request.getTransactionId())) {
                throw new DuplicateResourceException(
                        "Transaction ID already used: " + request.getTransactionId()
                );
            }
        }

        AppointmentSummary appointment = fetchAndValidateAppointment(
                payment.getAppointmentId(), email
        );

        if (!"COMPLETED".equals(appointment.getStatus())) {
            throw new InvalidOperationException("Cannot pay — service not completed yet");
        }

        // All validations passed
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setStatus(PaymentStatus.SUCCESS);

        String txnId = request.getTransactionId();
        if (txnId == null || txnId.isBlank()) {
            txnId = "TXN-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();
        }
        payment.setTransactionId(txnId);
        payment.setPaymentGateway(
                request.getPaymentGateway() != null ? request.getPaymentGateway() : "MOCK"
        );
        payment.setPaidAt(LocalDateTime.now());

        if (request.getNotes() != null) {
            payment.setNotes(
                    (payment.getNotes() != null ? payment.getNotes() + " | " : "")
                            + request.getNotes()
            );
        }

        Payment updated = paymentRepository.save(payment);
        log.info("Bill {} paid by {} — TXN: {}", payment.getPaymentReference(), email, txnId);

        // ✅ Send notification
        sendNotification(
                updated.getCustomerEmail(),
                "Payment Successful",
                "Your payment of Rs " + updated.getTotalAmount() +
                        " has been received successfully. Reference: " + updated.getPaymentReference(),
                "PAYMENT_RECEIVED",
                updated.getId()
        );

        return toResponse(updated);
    }

    // ══════════════════════════════════════════════════════════
    // 4. GET BY ID
    // ══════════════════════════════════════════════════════════
    public PaymentResponse getPaymentById(Long id) {
        Payment payment = paymentRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found: " + id));

        String email = userContext.getCurrentUserEmail();
        if (!userContext.isAdmin() && !payment.getCustomerEmail().equals(email)) {
            throw new UnauthorizedActionException("You cannot view this payment");
        }
        return toResponse(payment);
    }

    // ══════════════════════════════════════════════════════════
    // 5. GET MY PAYMENTS
    // ══════════════════════════════════════════════════════════
    public List<PaymentSummaryResponse> getMyPayments() {
        if (userContext.isAdmin()) {
            return paymentRepository.findAllByActiveTrueOrderByCreatedAtDesc()
                    .stream().map(this::toSummary).collect(Collectors.toList());
        }
        String email = userContext.getCurrentUserEmail();
        return paymentRepository.findByCustomerEmailAndActiveTrueOrderByCreatedAtDesc(email)
                .stream().map(this::toSummary).collect(Collectors.toList());
    }

    // ══════════════════════════════════════════════════════════
    // 6. GET BY APPOINTMENT
    // ══════════════════════════════════════════════════════════
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

    // ══════════════════════════════════════════════════════════
    // 7. FILTER BY STATUS (Admin)
    // ══════════════════════════════════════════════════════════
    public List<PaymentSummaryResponse> getByStatus(PaymentStatus status) {
        if (!userContext.isAdmin()) {
            throw new UnauthorizedActionException("Only Admin can filter by status");
        }
        return paymentRepository.findByStatusAndActiveTrueOrderByCreatedAtDesc(status)
                .stream().map(this::toSummary).collect(Collectors.toList());
    }

    // ══════════════════════════════════════════════════════════
    // 8. REFUND (Admin)
    // ══════════════════════════════════════════════════════════
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

        // ✅ Send notification
        sendNotification(
                updated.getCustomerEmail(),
                "Refund Processed",
                "Your refund of Rs " + updated.getTotalAmount() +
                        " has been processed. Reference: " + updated.getPaymentReference(),
                "REFUND_ISSUED",
                updated.getId()
        );

        return toResponse(updated);
    }

    // ══════════════════════════════════════════════════════════
    // 9. INTERNAL
    // ══════════════════════════════════════════════════════════
    public PaymentResponse getInternal(Long id) {
        Payment payment = paymentRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found: " + id));
        return toResponse(payment);
    }

    // ══════════════════════════════════════════════════════════
    // NOTIFICATION HELPER
    // ══════════════════════════════════════════════════════════
    private void sendNotification(String email, String title, String message,
                                  String type, Long referenceId) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("recipientEmail", email);
            payload.put("title", title);
            payload.put("message", message);
            payload.put("type", type);
            payload.put("referenceId", referenceId);
            payload.put("referenceType", "PAYMENT");
            payload.put("channel", "IN_APP");

            notificationClient.sendNotification(payload);
            log.info("Notification sent: {} to {}", title, email);
        } catch (Exception e) {
            log.error("Failed to send notification: {}", e.getMessage());
        }
    }

    // ══════════════════════════════════════════════════════════
    // HELPERS
    // ══════════════════════════════════════════════════════════
    private AppointmentSummary fetchAndValidateAppointment(Long appointmentId, String expectedEmail) {
        AppointmentSummary appointment;
        try {
            appointment = appointmentClient.getAppointmentById(appointmentId);
        } catch (Exception e) {
            log.error("Failed to fetch appointment {}: {}", appointmentId, e.getMessage());
            throw new ResourceNotFoundException("Appointment not found: " + appointmentId);
        }

        if (!appointment.getCustomerEmail().equals(expectedEmail)) {
            throw new UnauthorizedActionException("Appointment does not belong to you");
        }

        return appointment;
    }

    private double calculateTotal(PaymentRequest request) {
        double tax = request.getTax() != null ? request.getTax() : 0.0;
        double discount = request.getDiscount() != null ? request.getDiscount() : 0.0;
        return request.getAmount() + tax - discount;
    }

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