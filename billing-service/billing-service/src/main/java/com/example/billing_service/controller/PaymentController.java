package com.example.billing_service.controller;

import com.example.billing_service.dto.request.PaymentRequest;
import com.example.billing_service.dto.request.RefundRequest;
import com.example.billing_service.dto.response.ApiResponse;
import com.example.billing_service.dto.response.PaymentResponse;
import com.example.billing_service.dto.response.PaymentSummaryResponse;
import com.example.billing_service.entity.PaymentStatus;
import com.example.billing_service.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    // 1. Make payment
    @PostMapping
    public ResponseEntity<ApiResponse<PaymentResponse>> makePayment(
            @Valid @RequestBody PaymentRequest request) {
        PaymentResponse response = paymentService.makePayment(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Payment successful", response));
    }

    // 2. Get by ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Payment fetched",
                paymentService.getPaymentById(id)));
    }

    // 3. Get my payments
    @GetMapping
    public ResponseEntity<ApiResponse<List<PaymentSummaryResponse>>> getMyPayments() {
        return ResponseEntity.ok(ApiResponse.success("Payments fetched",
                paymentService.getMyPayments()));
    }

    // 4. Get by appointment
    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getByAppointment(
            @PathVariable Long appointmentId) {
        return ResponseEntity.ok(ApiResponse.success("Payment fetched",
                paymentService.getPaymentByAppointment(appointmentId)));
    }

    // 5. Filter by status (Admin)
    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<PaymentSummaryResponse>>> getByStatus(
            @PathVariable PaymentStatus status) {
        return ResponseEntity.ok(ApiResponse.success("Payments by status",
                paymentService.getByStatus(status)));
    }

    // 6. Refund (Admin)
    @PostMapping("/{id}/refund")
    public ResponseEntity<ApiResponse<PaymentResponse>> refund(
            @PathVariable Long id,
            @Valid @RequestBody RefundRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Refund processed",
                paymentService.refund(id, request)));
    }

    // 7. Internal lookup
    @GetMapping("/internal/{id}")
    public ResponseEntity<PaymentResponse> getInternal(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getInternal(id));
    }
}