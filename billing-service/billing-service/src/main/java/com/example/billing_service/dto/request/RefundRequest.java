package com.example.billing_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RefundRequest {

    @NotBlank(message = "Refund reason is required")
    private String reason;
}