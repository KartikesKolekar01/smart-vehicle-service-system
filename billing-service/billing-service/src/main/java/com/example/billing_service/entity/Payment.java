package com.example.billing_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "payments",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_payment_reference",
                        columnNames = "payment_reference"
                ),
                @UniqueConstraint(
                        name = "uk_transaction_id",
                        columnNames = "transaction_id"
                )
        },
        indexes = {
                @Index(name = "idx_customer_email", columnList = "customer_email"),
                @Index(name = "idx_appointment_id", columnList = "appointment_id")
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "payment_reference", nullable = false, unique = true, length = 50)
    private String paymentReference;

    @Column(name = "appointment_id", nullable = false)
    private Long appointmentId;

    @Column(name = "customer_email", nullable = false, length = 255)
    private String customerEmail;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private Double tax = 0.0;

    @Column(nullable = false)
    private Double discount = 0.0;

    @Column(name = "total_amount", nullable = false)
    private Double totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentStatus status = PaymentStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", length = 20)
    private PaymentMethod paymentMethod;

    @Column(name = "transaction_id", length = 100, unique = true)
    private String transactionId;

    @Column(name = "payment_gateway", length = 30)
    private String paymentGateway;   // ✅ NEW: "RAZORPAY", "MOCK", etc.

    @Column(name = "gateway_order_id", length = 100)
    private String gatewayOrderId;   // ✅ NEW: Razorpay order ID

    @Column(name = "gateway_signature", length = 255)
    private String gatewaySignature; // ✅ NEW: Signature for audit

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "refunded_at")
    private LocalDateTime refundedAt;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(nullable = false)
    private Boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}