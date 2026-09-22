package com.example.spare_parts_service.dto.request;

import com.example.spare_parts_service.entity.PartCategory;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class SparePartRequest {

    @NotBlank(message = "Part name is required")
    @Size(max = 100, message = "Part name cannot exceed 100 characters")
    private String partName;

    @NotBlank(message = "Part number is required")
    @Size(max = 50, message = "Part number cannot exceed 50 characters")
    private String partNumber;

    @NotNull(message = "Category is required")
    private PartCategory category;

    @NotNull(message = "Price is required")
    @Min(value = 0, message = "Price cannot be negative")
    private Double price;

    @NotNull(message = "Quantity is required")
    @Min(value = 0, message = "Quantity cannot be negative")
    private Integer quantity;

    @NotNull(message = "Minimum stock is required")
    @Min(value = 0, message = "Minimum stock cannot be negative")
    private Integer minimumStock;

    @Size(max = 100, message = "Supplier name cannot exceed 100 characters")
    private String supplier;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;
}