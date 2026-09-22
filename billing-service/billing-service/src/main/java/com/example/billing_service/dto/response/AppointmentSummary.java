package com.example.billing_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentSummary {
    private Long id;
    private String customerEmail;
    private String vehicleRegistrationNumber;
    private String serviceType;
    private String status;
    private Double actualCost;
}