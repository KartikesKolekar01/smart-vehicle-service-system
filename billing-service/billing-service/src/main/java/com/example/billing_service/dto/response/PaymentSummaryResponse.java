package com.example.billing_service.dto.response;

import com.example.billing_service.entity.PaymentMethod;
import com.example.billing_service.entity.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentSummaryResponse {
    private Long id;
    private String paymentReference;
    private Long appointmentId;
    private Double totalAmount;
    private PaymentStatus status;
    private PaymentMethod paymentMethod;
    private LocalDateTime createdAt;
}