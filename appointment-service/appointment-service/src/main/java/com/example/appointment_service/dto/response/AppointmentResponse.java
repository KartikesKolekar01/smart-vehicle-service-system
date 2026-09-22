package com.example.appointment_service.dto.response;
import com.example.appointment_service.entity.AppointmentStatus;
import com.example.appointment_service.entity.ServiceType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentResponse {
    private Long id;
    private String customerEmail;
    private Long vehicleId;
    private String vehicleRegistrationNumber;
    private ServiceType serviceType;
    private LocalDate appointmentDate;
    private String timeSlot;
    private String problemDescription;
    private AppointmentStatus status;
    private Long mechanicId;
    private String mechanicName;
    private Double estimatedCost;
    private Double actualCost;
    private String adminNotes;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}