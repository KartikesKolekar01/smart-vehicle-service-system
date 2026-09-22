package com.example.appointment_service.dto.response;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleSummary {
    private Long id;
    private String registrationNumber;
    private String brand;
    private String model;
    private Long currentKm;
    private Boolean serviceDue;
}