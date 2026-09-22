package com.example.spare_parts_service.dto.response;

import com.example.spare_parts_service.entity.PartCategory;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SparePartSummaryResponse {
    private Long id;
    private String partName;
    private String partNumber;
    private PartCategory category;
    private Double price;
    private Integer quantity;
    private Boolean lowStock;
}