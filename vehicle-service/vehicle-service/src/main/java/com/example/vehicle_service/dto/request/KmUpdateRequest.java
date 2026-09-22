package com.example.vehicle_service.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class KmUpdateRequest {

    @NotNull(message = "Current KM is required")
    @Min(value = 0, message = "Current KM cannot be negative")
    private Long currentKm;

    @Min(value = 0, message = "Next service KM cannot be negative")
    private Long nextServiceKm;
}