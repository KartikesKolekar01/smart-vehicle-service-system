package com.example.mechanic_service.service;
import com.example.mechanic_service.dto.request.AvailabilityUpdateRequest;
import com.example.mechanic_service.dto.request.MechanicRequest;
import com.example.mechanic_service.dto.response.MechanicResponse;
import com.example.mechanic_service.entity.AvailabilityStatus;
import com.example.mechanic_service.entity.Mechanic;
import com.example.mechanic_service.entity.Specialization;
import com.example.mechanic_service.exception.DuplicateResourceException;
import com.example.mechanic_service.exception.ResourceNotFoundException;
import com.example.mechanic_service.exception.UnauthorizedActionException;
import com.example.mechanic_service.repository.MechanicRepository;
import com.example.mechanic_service.security.UserContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MechanicService {

    private final MechanicRepository mechanicRepository;
    private final UserContext userContext;

    // 1. ADD MECHANIC (Admin only)
    @Transactional
    public MechanicResponse addMechanic(MechanicRequest request) {
        if (!userContext.isAdmin()) {
            throw new UnauthorizedActionException("Only Admin can add mechanics");
        }

        if (mechanicRepository.existsByEmailAndActiveTrue(request.getEmail())) {
            throw new DuplicateResourceException(
                    "Mechanic with email " + request.getEmail() + " already exists"
            );
        }

        Mechanic mechanic = new Mechanic();
        mechanic.setName(request.getName());
        mechanic.setEmail(request.getEmail());
        mechanic.setPhone(request.getPhone());
        mechanic.setSpecialization(request.getSpecialization());
        mechanic.setExperienceYears(request.getExperienceYears());
        mechanic.setAvailability(AvailabilityStatus.AVAILABLE);
        mechanic.setActive(true);

        Mechanic saved = mechanicRepository.save(mechanic);
        log.info("Mechanic added: {}", saved.getEmail());
        return toResponse(saved);
    }

    // 2. GET ALL MECHANICS
    public List<MechanicResponse> getAllMechanics() {
        return mechanicRepository.findByActiveTrueOrderByCreatedAtDesc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // 3. GET BY ID
    public MechanicResponse getMechanicById(Long id) {
        Mechanic mechanic = mechanicRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mechanic not found: " + id));
        return toResponse(mechanic);
    }

    // 4. GET AVAILABLE MECHANICS
    public List<MechanicResponse> getAvailableMechanics() {
        return mechanicRepository
                .findByAvailabilityAndActiveTrueOrderByExperienceYearsDesc(AvailabilityStatus.AVAILABLE)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // 5. GET BY SPECIALIZATION
    public List<MechanicResponse> getBySpecialization(Specialization specialization) {
        return mechanicRepository
                .findBySpecializationAndActiveTrueOrderByExperienceYearsDesc(specialization)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // 6. UPDATE MECHANIC (Admin only)
    @Transactional
    public MechanicResponse updateMechanic(Long id, MechanicRequest request) {
        if (!userContext.isAdmin()) {
            throw new UnauthorizedActionException("Only Admin can update mechanics");
        }

        Mechanic mechanic = mechanicRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mechanic not found: " + id));

        mechanic.setName(request.getName());
        mechanic.setEmail(request.getEmail());
        mechanic.setPhone(request.getPhone());
        mechanic.setSpecialization(request.getSpecialization());
        mechanic.setExperienceYears(request.getExperienceYears());

        Mechanic updated = mechanicRepository.save(mechanic);
        log.info("Mechanic updated: {}", id);
        return toResponse(updated);
    }

    // 7. UPDATE AVAILABILITY (Admin or self)
    @Transactional
    public MechanicResponse updateAvailability(Long id, AvailabilityUpdateRequest request) {
        Mechanic mechanic = mechanicRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mechanic not found: " + id));

        // Admin or the mechanic themselves can update
        String currentEmail = userContext.getCurrentUserEmail();
        if (!userContext.isAdmin() && !mechanic.getEmail().equals(currentEmail)) {
            throw new UnauthorizedActionException("You cannot update this mechanic's availability");
        }

        mechanic.setAvailability(request.getAvailability());

        // If becoming available, clear appointment
        if (request.getAvailability() == AvailabilityStatus.AVAILABLE) {
            mechanic.setCurrentAppointmentId(null);
        }

        Mechanic updated = mechanicRepository.save(mechanic);
        log.info("Mechanic {} availability → {}", id, request.getAvailability());
        return toResponse(updated);
    }

    // 8. SOFT DELETE (Admin only)
    @Transactional
    public void deleteMechanic(Long id) {
        if (!userContext.isAdmin()) {
            throw new UnauthorizedActionException("Only Admin can delete mechanics");
        }

        Mechanic mechanic = mechanicRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mechanic not found: " + id));

        mechanic.setActive(false);
        mechanicRepository.save(mechanic);
        log.info("Mechanic soft-deleted: {}", id);
    }

    // 9. INTERNAL LOOKUP (for other services via Feign)
    public MechanicResponse getMechanicInternal(Long id) {
        Mechanic mechanic = mechanicRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mechanic not found: " + id));
        return toResponse(mechanic);
    }

    // Helper: Entity → DTO
    private MechanicResponse toResponse(Mechanic m) {
        return new MechanicResponse(
                m.getId(),
                m.getName(),
                m.getEmail(),
                m.getPhone(),
                m.getSpecialization(),
                m.getExperienceYears(),
                m.getAvailability(),
                m.getCurrentAppointmentId(),
                m.getCreatedAt(),
                m.getUpdatedAt()
        );
    }
}