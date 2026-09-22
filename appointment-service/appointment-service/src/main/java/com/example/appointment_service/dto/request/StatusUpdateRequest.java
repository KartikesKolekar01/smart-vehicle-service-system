package com.example.appointment_service.dto.request;

import com.example.appointment_service.entity.AppointmentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StatusUpdateRequest {

    @NotNull(message = "Status is required")
    private AppointmentStatus status;

    private String adminNotes;

    private Double actualCost;
}