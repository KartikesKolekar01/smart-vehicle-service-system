package com.example.mechanic_service.repository;

import com.example.mechanic_service.entity.AvailabilityStatus;
import com.example.mechanic_service.entity.Mechanic;
import com.example.mechanic_service.entity.Specialization;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MechanicRepository extends JpaRepository<Mechanic, Long> {

    List<Mechanic> findByActiveTrueOrderByCreatedAtDesc();

    List<Mechanic> findByAvailabilityAndActiveTrueOrderByExperienceYearsDesc(AvailabilityStatus availability);

    List<Mechanic> findBySpecializationAndActiveTrueOrderByExperienceYearsDesc(Specialization specialization);

    Optional<Mechanic> findByIdAndActiveTrue(Long id);

    Optional<Mechanic> findByEmailAndActiveTrue(String email);

    boolean existsByEmailAndActiveTrue(String email);
}