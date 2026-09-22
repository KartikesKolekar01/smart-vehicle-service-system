package com.example.mechanic_service.dto.request;

import com.example.mechanic_service.entity.AvailabilityStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AvailabilityUpdateRequest {

    @NotNull(message = "Availability status is required")
    private AvailabilityStatus availability;
}