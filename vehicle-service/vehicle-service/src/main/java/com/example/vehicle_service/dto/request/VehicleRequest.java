package com.example.vehicle_service.dto.request;

import com.example.vehicle_service.entity.FuelType;
import com.example.vehicle_service.entity.VehicleType;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class VehicleRequest {

    @NotBlank(message = "Registration number is required")
    @Pattern(
            regexp = "^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{1,4}$",
            message = "Invalid registration number format (e.g., MH09AB1234)"
    )
    private String registrationNumber;

    @NotBlank(message = "Brand is required")
    @Size(max = 50, message = "Brand cannot exceed 50 characters")
    private String brand;

    @NotBlank(message = "Model is required")
    @Size(max = 50, message = "Model cannot exceed 50 characters")
    private String model;

    @NotNull(message = "Vehicle type is required")
    private VehicleType vehicleType;

    @NotNull(message = "Manufacturing year is required")
    @Min(value = 1980, message = "Manufacturing year must be after 1980")
    @Max(value = 2100, message = "Invalid manufacturing year")
    private Integer manufacturingYear;

    @NotNull(message = "Fuel type is required")
    private FuelType fuelType;

    @NotNull(message = "Current KM is required")
    @Min(value = 0, message = "Current KM cannot be negative")
    private Long currentKm;

    @Min(value = 0, message = "Next service KM cannot be negative")
    private Long nextServiceKm;
}