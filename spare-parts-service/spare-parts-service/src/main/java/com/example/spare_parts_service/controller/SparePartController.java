package com.example.spare_parts_service.controller;

import com.example.spare_parts_service.dto.request.SparePartRequest;
import com.example.spare_parts_service.dto.request.StockUpdateRequest;
import com.example.spare_parts_service.dto.response.ApiResponse;
import com.example.spare_parts_service.dto.response.SparePartResponse;
import com.example.spare_parts_service.dto.response.SparePartSummaryResponse;
import com.example.spare_parts_service.entity.PartCategory;
import com.example.spare_parts_service.service.SparePartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/parts")
@RequiredArgsConstructor
public class SparePartController {

    private final SparePartService sparePartService;

    // 1. Add part (Admin)
    @PostMapping
    public ResponseEntity<ApiResponse<SparePartResponse>> addPart(
            @Valid @RequestBody SparePartRequest request) {
        SparePartResponse response = sparePartService.addPart(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Spare part added successfully", response));
    }

    // 2. Get all parts
    @GetMapping
    public ResponseEntity<ApiResponse<List<SparePartSummaryResponse>>> getAllParts() {
        return ResponseEntity.ok(ApiResponse.success("Spare parts fetched",
                sparePartService.getAllParts()));
    }

    // 3. Get by ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SparePartResponse>> getPartById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Spare part fetched",
                sparePartService.getPartById(id)));
    }

    // 4. Filter by category
    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<List<SparePartSummaryResponse>>> getByCategory(
            @PathVariable PartCategory category) {
        return ResponseEntity.ok(ApiResponse.success("Parts by category",
                sparePartService.getByCategory(category)));
    }

    // 5. Low-stock parts (Admin)
    @GetMapping("/low-stock")
    public ResponseEntity<ApiResponse<List<SparePartSummaryResponse>>> getLowStockParts() {
        return ResponseEntity.ok(ApiResponse.success("Low stock parts fetched",
                sparePartService.getLowStockParts()));
    }

    // 6. Update part (Admin)
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SparePartResponse>> updatePart(
            @PathVariable Long id,
            @Valid @RequestBody SparePartRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Spare part updated",
                sparePartService.updatePart(id, request)));
    }

    // 7. Update stock only (Admin)
    @PatchMapping("/{id}/stock")
    public ResponseEntity<ApiResponse<SparePartResponse>> updateStock(
            @PathVariable Long id,
            @Valid @RequestBody StockUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Stock updated",
                sparePartService.updateStock(id, request)));
    }

    // 8. Delete part (Admin)
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deletePart(@PathVariable Long id) {
        sparePartService.deletePart(id);
        return ResponseEntity.ok(ApiResponse.success("Spare part deleted"));
    }
}
