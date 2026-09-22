package com.example.vehicle_service.service;

import com.example.vehicle_service.dto.request.KmUpdateRequest;
import com.example.vehicle_service.dto.request.VehicleRequest;
import com.example.vehicle_service.dto.response.VehicleResponse;
import com.example.vehicle_service.dto.response.VehicleSummaryResponse;
import com.example.vehicle_service.entity.Vehicle;
import com.example.vehicle_service.exception.DuplicateResourceException;
import com.example.vehicle_service.exception.ResourceNotFoundException;
import com.example.vehicle_service.exception.UnauthorizedActionException;
import com.example.vehicle_service.repository.VehicleRepository;
import com.example.vehicle_service.security.UserContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final UserContext userContext;

    // ──────────────────────────────────────────────────────────
    // 1. ADD VEHICLE
    // ──────────────────────────────────────────────────────────
    @Transactional
    public VehicleResponse addVehicle(VehicleRequest request) {
        String email = userContext.getCurrentUserEmail();
        log.info("Adding vehicle for user: {}", email);

        // Duplicate registration check
        if (vehicleRepository.existsByRegistrationNumberAndActiveTrue(request.getRegistrationNumber())) {
            throw new DuplicateResourceException(
                    "Vehicle with registration number " + request.getRegistrationNumber() + " already exists"
            );
        }

        Vehicle vehicle = new Vehicle();
        vehicle.setOwnerEmail(email);
        vehicle.setRegistrationNumber(request.getRegistrationNumber().toUpperCase());
        vehicle.setBrand(request.getBrand());
        vehicle.setModel(request.getModel());
        vehicle.setVehicleType(request.getVehicleType());
        vehicle.setManufacturingYear(request.getManufacturingYear());
        vehicle.setFuelType(request.getFuelType());
        vehicle.setCurrentKm(request.getCurrentKm());
        vehicle.setNextServiceKm(request.getNextServiceKm());
        vehicle.setActive(true);

        Vehicle saved = vehicleRepository.save(vehicle);
        log.info("Vehicle added with id: {} for user: {}", saved.getId(), email);

        return toResponse(saved);
    }

    // ──────────────────────────────────────────────────────────
    // 2. GET MY VEHICLES
    // ──────────────────────────────────────────────────────────
    public List<VehicleSummaryResponse> getMyVehicles() {
        String email = userContext.getCurrentUserEmail();
        log.info("Fetching vehicles for user: {}", email);

        List<Vehicle> vehicles = vehicleRepository.findByOwnerEmailAndActiveTrueOrderByCreatedAtDesc(email);
        return vehicles.stream().map(this::toSummary).collect(Collectors.toList());
    }

    // ──────────────────────────────────────────────────────────
    // 3. GET VEHICLE BY ID (owner or admin only)
    // ──────────────────────────────────────────────────────────
    public VehicleResponse getVehicleById(Long id) {
        String email = userContext.getCurrentUserEmail();
        boolean isAdmin = userContext.isAdmin();

        Vehicle vehicle = vehicleRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));

        if (!isAdmin && !vehicle.getOwnerEmail().equals(email)) {
            throw new UnauthorizedActionException("You are not authorized to view this vehicle");
        }

        return toResponse(vehicle);
    }

    // ──────────────────────────────────────────────────────────
    // 4. UPDATE VEHICLE
    // ──────────────────────────────────────────────────────────
    @Transactional
    public VehicleResponse updateVehicle(Long id, VehicleRequest request) {
        String email = userContext.getCurrentUserEmail();
        log.info("Updating vehicle {} for user: {}", id, email);

        Vehicle vehicle = vehicleRepository.findByIdAndOwnerEmailAndActiveTrue(id, email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Vehicle not found or you don't have permission: " + id
                ));

        // Duplicate registration check (excluding current vehicle)
        if (vehicleRepository.existsByRegistrationNumberExcluding(
                request.getRegistrationNumber().toUpperCase(), id)) {
            throw new DuplicateResourceException(
                    "Another vehicle with registration number " + request.getRegistrationNumber() + " already exists"
            );
        }

        vehicle.setRegistrationNumber(request.getRegistrationNumber().toUpperCase());
        vehicle.setBrand(request.getBrand());
        vehicle.setModel(request.getModel());
        vehicle.setVehicleType(request.getVehicleType());
        vehicle.setManufacturingYear(request.getManufacturingYear());
        vehicle.setFuelType(request.getFuelType());
        vehicle.setCurrentKm(request.getCurrentKm());
        vehicle.setNextServiceKm(request.getNextServiceKm());

        Vehicle updated = vehicleRepository.save(vehicle);
        log.info("Vehicle {} updated successfully", id);

        return toResponse(updated);
    }

    // ──────────────────────────────────────────────────────────
    // 5. UPDATE ONLY KM
    // ──────────────────────────────────────────────────────────
    @Transactional
    public VehicleResponse updateKm(Long id, KmUpdateRequest request) {
        String email = userContext.getCurrentUserEmail();
        log.info("Updating KM for vehicle {} by user: {}", id, email);

        Vehicle vehicle = vehicleRepository.findByIdAndOwnerEmailAndActiveTrue(id, email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Vehicle not found or you don't have permission: " + id
                ));

        if (request.getCurrentKm() < vehicle.getCurrentKm()) {
            throw new RuntimeException("Current KM cannot be less than the existing KM (" + vehicle.getCurrentKm() + ")");
        }

        vehicle.setCurrentKm(request.getCurrentKm());
        if (request.getNextServiceKm() != null) {
            vehicle.setNextServiceKm(request.getNextServiceKm());
        }

        Vehicle updated = vehicleRepository.save(vehicle);
        return toResponse(updated);
    }

    // ──────────────────────────────────────────────────────────
    // 6. SOFT DELETE VEHICLE
    // ──────────────────────────────────────────────────────────
    @Transactional
    public void deleteVehicle(Long id) {
        String email = userContext.getCurrentUserEmail();
        log.info("Deleting vehicle {} for user: {}", id, email);

        Vehicle vehicle = vehicleRepository.findByIdAndOwnerEmailAndActiveTrue(id, email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Vehicle not found or you don't have permission: " + id
                ));

        vehicle.setActive(false);
        vehicleRepository.save(vehicle);
        log.info("Vehicle {} soft-deleted", id);
    }

    // ──────────────────────────────────────────────────────────
    // 7. GET VEHICLES DUE FOR SERVICE
    // ──────────────────────────────────────────────────────────
    public List<VehicleSummaryResponse> getVehiclesDueForService() {
        String email = userContext.getCurrentUserEmail();
        log.info("Fetching service-due vehicles for user: {}", email);

        List<Vehicle> vehicles = vehicleRepository.findVehiclesDueForService(email);
        return vehicles.stream().map(this::toSummary).collect(Collectors.toList());
    }

    // ──────────────────────────────────────────────────────────
    // 8. INTERNAL LOOKUP (used by other microservices)
    // ──────────────────────────────────────────────────────────
    public VehicleSummaryResponse getVehicleByIdInternal(Long id) {
        Vehicle vehicle = vehicleRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));
        return toSummary(vehicle);
    }

    // ──────────────────────────────────────────────────────────
    // HELPERS
    // ──────────────────────────────────────────────────────────
    private VehicleResponse toResponse(Vehicle v) {
        boolean serviceDue = v.getNextServiceKm() != null && v.getCurrentKm() >= v.getNextServiceKm();
        return new VehicleResponse(
                v.getId(),
                v.getRegistrationNumber(),
                v.getBrand(),
                v.getModel(),
                v.getVehicleType(),
                v.getManufacturingYear(),
                v.getFuelType(),
                v.getCurrentKm(),
                v.getNextServiceKm(),
                serviceDue,
                v.getCreatedAt(),
                v.getUpdatedAt()
        );
    }

    private VehicleSummaryResponse toSummary(Vehicle v) {
        boolean serviceDue = v.getNextServiceKm() != null && v.getCurrentKm() >= v.getNextServiceKm();
        return new VehicleSummaryResponse(
                v.getId(),
                v.getRegistrationNumber(),
                v.getBrand(),
                v.getModel(),
                v.getCurrentKm(),
                serviceDue
        );
    }
}