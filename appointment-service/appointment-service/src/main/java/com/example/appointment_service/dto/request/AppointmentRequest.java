package com.example.appointment_service.dto.request;

import com.example.appointment_service.entity.ServiceType;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AppointmentRequest {

    @NotNull(message = "Vehicle ID is required")
    private Long vehicleId;

    @NotNull(message = "Service type is required")
    private ServiceType serviceType;

    @NotNull(message = "Appointment date is required")
    @FutureOrPresent(message = "Appointment date cannot be in the past")
    private LocalDate appointmentDate;

    @NotBlank(message = "Time slot is required")
    private String timeSlot;

    @Size(max = 500, message = "Problem description cannot exceed 500 characters")
    private String problemDescription;
}