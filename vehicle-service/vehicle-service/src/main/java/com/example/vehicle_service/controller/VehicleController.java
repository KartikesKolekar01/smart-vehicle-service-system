package com.example.vehicle_service.controller;

import com.example.vehicle_service.dto.request.KmUpdateRequest;
import com.example.vehicle_service.dto.request.VehicleRequest;
import com.example.vehicle_service.dto.response.ApiResponse;
import com.example.vehicle_service.dto.response.VehicleResponse;
import com.example.vehicle_service.dto.response.VehicleSummaryResponse;
import com.example.vehicle_service.service.VehicleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;

    // 1. ADD VEHICLE
    @PostMapping
    public ResponseEntity<ApiResponse<VehicleResponse>> addVehicle(
            @Valid @RequestBody VehicleRequest request) {
        VehicleResponse response = vehicleService.addVehicle(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Vehicle added successfully", response));
    }

    // 2. GET MY VEHICLES
    @GetMapping
    public ResponseEntity<ApiResponse<List<VehicleSummaryResponse>>> getMyVehicles() {
        List<VehicleSummaryResponse> vehicles = vehicleService.getMyVehicles();
        return ResponseEntity.ok(ApiResponse.success("Vehicles fetched successfully", vehicles));
    }

    // 3. GET VEHICLE BY ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VehicleResponse>> getVehicleById(@PathVariable Long id) {
        VehicleResponse response = vehicleService.getVehicleById(id);
        return ResponseEntity.ok(ApiResponse.success("Vehicle fetched successfully", response));
    }

    // 4. UPDATE VEHICLE
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<VehicleResponse>> updateVehicle(
            @PathVariable Long id,
            @Valid @RequestBody VehicleRequest request) {
        VehicleResponse response = vehicleService.updateVehicle(id, request);
        return ResponseEntity.ok(ApiResponse.success("Vehicle updated successfully", response));
    }

    // 5. UPDATE ONLY KM
    @PatchMapping("/{id}/km")
    public ResponseEntity<ApiResponse<VehicleResponse>> updateKm(
            @PathVariable Long id,
            @Valid @RequestBody KmUpdateRequest request) {
        VehicleResponse response = vehicleService.updateKm(id, request);
        return ResponseEntity.ok(ApiResponse.success("KM updated successfully", response));
    }

    // 6. SOFT DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteVehicle(@PathVariable Long id) {
        vehicleService.deleteVehicle(id);
        return ResponseEntity.ok(ApiResponse.success("Vehicle deleted successfully"));
    }

    // 7. GET VEHICLES DUE FOR SERVICE
    @GetMapping("/service-due")
    public ResponseEntity<ApiResponse<List<VehicleSummaryResponse>>> getVehiclesDueForService() {
        List<VehicleSummaryResponse> vehicles = vehicleService.getVehiclesDueForService();
        return ResponseEntity.ok(ApiResponse.success("Service-due vehicles fetched", vehicles));
    }

    // 8. INTERNAL LOOKUP (Called by other microservices via Feign)
    @GetMapping("/internal/{id}")
    public ResponseEntity<VehicleSummaryResponse> getVehicleInternal(@PathVariable Long id) {
        VehicleSummaryResponse response = vehicleService.getVehicleByIdInternal(id);
        return ResponseEntity.ok(response);
    }
}