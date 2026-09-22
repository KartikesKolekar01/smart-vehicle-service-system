package com.example.appointment_service.dto.response;
import com.example.appointment_service.entity.AppointmentStatus;
import com.example.appointment_service.entity.ServiceType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentSummaryResponse {
    private Long id;
    private String vehicleRegistrationNumber;
    private ServiceType serviceType;
    private LocalDate appointmentDate;
    private String timeSlot;
    private AppointmentStatus status;
    private String mechanicName;
}