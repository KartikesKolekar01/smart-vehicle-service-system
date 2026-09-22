package com.example.mechanic_service.dto.response;


import com.example.mechanic_service.entity.AvailabilityStatus;
import com.example.mechanic_service.entity.Specialization;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MechanicResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private Specialization specialization;
    private Integer experienceYears;
    private AvailabilityStatus availability;
    private Long currentAppointmentId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}