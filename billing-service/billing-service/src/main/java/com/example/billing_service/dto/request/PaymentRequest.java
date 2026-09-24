package com.example.billing_service.dto.request;

import com.example.billing_service.entity.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class PaymentRequest {

    @NotNull(message = "Appointment ID is required")
    private Long appointmentId;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private Double amount;

    private Double tax = 0.0;

    private Double discount = 0.0;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    private String notes;

    // ══════════════════════════════════════════════════════════
    // ✅ VALIDATION FIELDS — Customer must send these
    // ══════════════════════════════════════════════════════════

    /**
     * Payment reference — Admin ने दिलेला (bill सोबत)
     * Customer हा exact reference पाठवतो
     */
    private String paymentReference;

    /**
     * Transaction ID — Razorpay/UPI चा transaction ID
     * Optional for mock payments
     */
    private String transactionId;

    /**
     * Payment gateway name — "RAZORPAY", "MOCK", "UPI", etc.
     */
    private String paymentGateway;
}