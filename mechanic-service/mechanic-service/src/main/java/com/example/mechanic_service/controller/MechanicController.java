package com.example.mechanic_service.controller;
import com.example.mechanic_service.dto.request.AvailabilityUpdateRequest;
import com.example.mechanic_service.dto.request.MechanicRequest;
import com.example.mechanic_service.dto.response.ApiResponse;
import com.example.mechanic_service.dto.response.MechanicResponse;
import com.example.mechanic_service.entity.Specialization;
import com.example.mechanic_service.service.MechanicService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/mechanics")
@RequiredArgsConstructor
public class MechanicController {

    private final MechanicService mechanicService;

    // 1. ADD MECHANIC
    @PostMapping
    public ResponseEntity<ApiResponse<MechanicResponse>> addMechanic(
            @Valid @RequestBody MechanicRequest request) {
        MechanicResponse response = mechanicService.addMechanic(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Mechanic added successfully", response));
    }

    // 2. GET ALL
    @GetMapping
    public ResponseEntity<ApiResponse<List<MechanicResponse>>> getAllMechanics() {
        List<MechanicResponse> list = mechanicService.getAllMechanics();
        return ResponseEntity.ok(ApiResponse.success("Mechanics fetched", list));
    }

    // 3. GET BY ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MechanicResponse>> getMechanic(@PathVariable Long id) {
        MechanicResponse response = mechanicService.getMechanicById(id);
        return ResponseEntity.ok(ApiResponse.success("Mechanic fetched", response));
    }

    // 4. GET AVAILABLE
    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<MechanicResponse>>> getAvailable() {
        List<MechanicResponse> list = mechanicService.getAvailableMechanics();
        return ResponseEntity.ok(ApiResponse.success("Available mechanics", list));
    }

    // 5. GET BY SPECIALIZATION
    @GetMapping("/specialization/{spec}")
    public ResponseEntity<ApiResponse<List<MechanicResponse>>> getBySpecialization(
            @PathVariable Specialization spec) {
        List<MechanicResponse> list = mechanicService.getBySpecialization(spec);
        return ResponseEntity.ok(ApiResponse.success("Mechanics by specialization", list));
    }

    // 6. UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MechanicResponse>> updateMechanic(
            @PathVariable Long id,
            @Valid @RequestBody MechanicRequest request) {
        MechanicResponse response = mechanicService.updateMechanic(id, request);
        return ResponseEntity.ok(ApiResponse.success("Mechanic updated", response));
    }

    // 7. UPDATE AVAILABILITY
    @PatchMapping("/{id}/availability")
    public ResponseEntity<ApiResponse<MechanicResponse>> updateAvailability(
            @PathVariable Long id,
            @Valid @RequestBody AvailabilityUpdateRequest request) {
        MechanicResponse response = mechanicService.updateAvailability(id, request);
        return ResponseEntity.ok(ApiResponse.success("Availability updated", response));
    }

    // 8. DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteMechanic(@PathVariable Long id) {
        mechanicService.deleteMechanic(id);
        return ResponseEntity.ok(ApiResponse.success("Mechanic deleted"));
    }

    // 9. INTERNAL LOOKUP
    @GetMapping("/internal/{id}")
    public ResponseEntity<MechanicResponse> getMechanicInternal(@PathVariable Long id) {
        return ResponseEntity.ok(mechanicService.getMechanicInternal(id));
    }
}
