package com.example.appointment_service.dto.request;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssignMechanicRequest {

    @NotNull(message = "Mechanic ID is required")
    private Long mechanicId;
}