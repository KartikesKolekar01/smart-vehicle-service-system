package com.example.spare_parts_service.dto.response;

import com.example.spare_parts_service.entity.PartCategory;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SparePartResponse {
    private Long id;
    private String partName;
    private String partNumber;
    private PartCategory category;
    private Double price;
    private Integer quantity;
    private Integer minimumStock;
    private String supplier;
    private String description;
    private Boolean lowStock;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}