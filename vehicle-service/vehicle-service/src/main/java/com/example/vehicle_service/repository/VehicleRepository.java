package com.example.vehicle_service.repository;


import com.example.vehicle_service.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    // All active vehicles owned by a specific user
    List<Vehicle> findByOwnerEmailAndActiveTrueOrderByCreatedAtDesc(String ownerEmail);

    // Find a specific active vehicle by ID and owner
    Optional<Vehicle> findByIdAndOwnerEmailAndActiveTrue(Long id, String ownerEmail);

    // Find by ID (active only)
    Optional<Vehicle> findByIdAndActiveTrue(Long id);

    // Check if registration number already exists (globally, regardless of owner)
    boolean existsByRegistrationNumberAndActiveTrue(String registrationNumber);

    // Check for duplicate excluding current vehicle (for updates)
    @Query("SELECT COUNT(v) > 0 FROM Vehicle v WHERE v.registrationNumber = :regNo " +
            "AND v.id <> :excludeId AND v.active = true")
    boolean existsByRegistrationNumberExcluding(
            @Param("regNo") String registrationNumber,
            @Param("excludeId") Long excludeId
    );

    // Find vehicles due for service (current_km >= next_service_km)
    @Query("SELECT v FROM Vehicle v WHERE v.ownerEmail = :email " +
            "AND v.active = true AND v.nextServiceKm IS NOT NULL " +
            "AND v.currentKm >= v.nextServiceKm")
    List<Vehicle> findVehiclesDueForService(@Param("email") String ownerEmail);
}