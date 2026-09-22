package com.example.appointment_service.dto.response;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MechanicSummary {
    private Long id;
    private String name;
    private String specialization;
    private Integer experienceYears;
    private String availability;
}