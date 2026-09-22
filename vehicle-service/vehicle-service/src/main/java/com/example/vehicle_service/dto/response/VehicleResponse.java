package com.example.vehicle_service.dto.response;


import com.example.vehicle_service.entity.FuelType;
import com.example.vehicle_service.entity.VehicleType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleResponse {
    private Long id;
    private String registrationNumber;
    private String brand;
    private String model;
    private VehicleType vehicleType;
    private Integer manufacturingYear;
    private FuelType fuelType;
    private Long currentKm;
    private Long nextServiceKm;
    private Boolean serviceDue;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}