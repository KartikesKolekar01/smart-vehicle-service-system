package com.example.appointment_service.service;

import com.example.appointment_service.client.MechanicClient;
import com.example.appointment_service.client.NotificationClient;
import com.example.appointment_service.client.VehicleClient;
import com.example.appointment_service.dto.request.AppointmentRequest;
import com.example.appointment_service.dto.request.AssignMechanicRequest;
import com.example.appointment_service.dto.request.StatusUpdateRequest;
import com.example.appointment_service.dto.response.*;
import com.example.appointment_service.entity.Appointment;
import com.example.appointment_service.entity.AppointmentStatus;
import com.example.appointment_service.exception.InvalidOperationException;
import com.example.appointment_service.exception.ResourceNotFoundException;
import com.example.appointment_service.exception.UnauthorizedActionException;
import com.example.appointment_service.repository.AppointmentRepository;
import com.example.appointment_service.security.UserContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final UserContext userContext;
    private final VehicleClient vehicleClient;
    private final MechanicClient mechanicClient;
    private final NotificationClient notificationClient;

    // ══════════════════════════════════════════════════════════
    // 1. BOOK APPOINTMENT (Customer)
    // ══════════════════════════════════════════════════════════
    @Transactional
    public AppointmentResponse bookAppointment(AppointmentRequest request) {
        String customerEmail = userContext.getCurrentUserEmail();
        log.info("Booking appointment for customer: {}", customerEmail);

        VehicleSummary vehicle;
        try {
            vehicle = vehicleClient.getVehicleById(request.getVehicleId());
        } catch (Exception e) {
            log.error("Failed to fetch vehicle: {}", e.getMessage());
            throw new ResourceNotFoundException("Vehicle not found with id: " + request.getVehicleId());
        }

        Appointment appointment = new Appointment();
        appointment.setCustomerEmail(customerEmail);
        appointment.setVehicleId(request.getVehicleId());
        appointment.setVehicleRegistrationNumber(vehicle.getRegistrationNumber());
        appointment.setServiceType(request.getServiceType());
        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setTimeSlot(request.getTimeSlot());
        appointment.setProblemDescription(request.getProblemDescription());
        appointment.setStatus(AppointmentStatus.REQUESTED);
        appointment.setActive(true);

        Appointment saved = appointmentRepository.save(appointment);
        log.info("Appointment booked: {}", saved.getId());

        // ✅ Send notification
        sendNotification(
                customerEmail,
                "Appointment Booked",
                "Your service appointment for " + saved.getVehicleRegistrationNumber() +
                        " has been booked on " + saved.getAppointmentDate() +
                        " at " + saved.getTimeSlot(),
                "APPOINTMENT_BOOKED",
                saved.getId()
        );

        return toResponse(saved);
    }

    // ══════════════════════════════════════════════════════════
    // 2. GET MY APPOINTMENTS
    // ══════════════════════════════════════════════════════════
    public List<AppointmentSummaryResponse> getMyAppointments() {
        String customerEmail = userContext.getCurrentUserEmail();

        if (userContext.isAdmin()) {
            return appointmentRepository.findAllByActiveTrueOrderByAppointmentDateAsc()
                    .stream().map(this::toSummary).collect(Collectors.toList());
        }

        return appointmentRepository
                .findByCustomerEmailAndActiveTrueOrderByCreatedAtDesc(customerEmail)
                .stream().map(this::toSummary).collect(Collectors.toList());
    }

    // ══════════════════════════════════════════════════════════
    // 3. GET APPOINTMENT BY ID
    // ══════════════════════════════════════════════════════════
    public AppointmentResponse getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found: " + id));

        String currentEmail = userContext.getCurrentUserEmail();
        if (!userContext.isAdmin() && !appointment.getCustomerEmail().equals(currentEmail)) {
            throw new UnauthorizedActionException("You are not authorized to view this appointment");
        }
        return toResponse(appointment);
    }

    // ══════════════════════════════════════════════════════════
    // 4. GET APPOINTMENTS BY STATUS (Admin only)
    // ══════════════════════════════════════════════════════════
    public List<AppointmentSummaryResponse> getByStatus(AppointmentStatus status) {
        if (!userContext.isAdmin()) {
            throw new UnauthorizedActionException("Only Admin can filter by status");
        }
        return appointmentRepository.findByStatusAndActiveTrueOrderByAppointmentDateAsc(status)
                .stream().map(this::toSummary).collect(Collectors.toList());
    }

    // ══════════════════════════════════════════════════════════
    // 5. UPDATE STATUS (Admin only)
    // ══════════════════════════════════════════════════════════
    @Transactional
    public AppointmentResponse updateStatus(Long id, StatusUpdateRequest request) {
        if (!userContext.isAdmin()) {
            throw new UnauthorizedActionException("Only Admin can update status");
        }

        Appointment appointment = appointmentRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found: " + id));

        if (appointment.getStatus() == AppointmentStatus.CANCELLED
                || appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new InvalidOperationException("Cannot update a " + appointment.getStatus() + " appointment");
        }

        AppointmentStatus oldStatus = appointment.getStatus();
        appointment.setStatus(request.getStatus());
        if (request.getAdminNotes() != null) appointment.setAdminNotes(request.getAdminNotes());
        if (request.getActualCost() != null) appointment.setActualCost(request.getActualCost());

        if (request.getStatus() == AppointmentStatus.COMPLETED) {
            appointment.setCompletedAt(LocalDateTime.now());
        }

        Appointment updated = appointmentRepository.save(appointment);
        log.info("Appointment {} status updated from {} to {}", id, oldStatus, request.getStatus());

        // ✅ Send notifications based on new status
        if (request.getStatus() == AppointmentStatus.IN_PROGRESS) {
            sendNotification(
                    updated.getCustomerEmail(),
                    "Service Started",
                    "Work has started on your vehicle " + updated.getVehicleRegistrationNumber() +
                            ". We'll notify you when it's done.",
                    "SERVICE_STARTED",
                    updated.getId()
            );
        }

        if (request.getStatus() == AppointmentStatus.COMPLETED) {
            sendNotification(
                    updated.getCustomerEmail(),
                    "Service Completed",
                    "Your vehicle " + updated.getVehicleRegistrationNumber() +
                            " service has been completed. Please check your bill.",
                    "SERVICE_COMPLETED",
                    updated.getId()
            );
        }

        return toResponse(updated);
    }

    // ══════════════════════════════════════════════════════════
    // 6. ASSIGN MECHANIC (Admin only)
    // ══════════════════════════════════════════════════════════
    @Transactional
    public AppointmentResponse assignMechanic(Long id, AssignMechanicRequest request) {
        if (!userContext.isAdmin()) {
            throw new UnauthorizedActionException("Only Admin can assign mechanics");
        }

        Appointment appointment = appointmentRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found: " + id));

        if (appointment.getStatus() == AppointmentStatus.CANCELLED
                || appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new InvalidOperationException("Cannot assign mechanic to a " + appointment.getStatus() + " appointment");
        }

        MechanicSummary mechanic;
        try {
            mechanic = mechanicClient.getMechanicById(request.getMechanicId());
        } catch (Exception e) {
            log.error("Failed to fetch mechanic: {}", e.getMessage());
            throw new ResourceNotFoundException("Mechanic not found with id: " + request.getMechanicId());
        }

        appointment.setMechanicId(mechanic.getId());
        appointment.setMechanicName(mechanic.getName());
        appointment.setStatus(AppointmentStatus.ASSIGNED);

        Appointment updated = appointmentRepository.save(appointment);
        log.info("Mechanic {} assigned to appointment {}", mechanic.getId(), id);

        // ✅ Send notification
        sendNotification(
                updated.getCustomerEmail(),
                "Mechanic Assigned",
                "Mechanic " + mechanic.getName() + " has been assigned to your appointment #" +
                        updated.getId() + " for vehicle " + updated.getVehicleRegistrationNumber(),
                "MECHANIC_ASSIGNED",
                updated.getId()
        );

        return toResponse(updated);
    }

    // ══════════════════════════════════════════════════════════
    // 7. CANCEL APPOINTMENT (Owner or Admin)
    // ══════════════════════════════════════════════════════════
    @Transactional
    public AppointmentResponse cancelAppointment(Long id) {
        Appointment appointment = appointmentRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found: " + id));

        String currentEmail = userContext.getCurrentUserEmail();
        if (!userContext.isAdmin() && !appointment.getCustomerEmail().equals(currentEmail)) {
            throw new UnauthorizedActionException("You cannot cancel this appointment");
        }

        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new InvalidOperationException("Cannot cancel a completed appointment");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setActive(false);

        Appointment updated = appointmentRepository.save(appointment);
        log.info("Appointment {} cancelled", id);
        return toResponse(updated);
    }

    // ══════════════════════════════════════════════════════════
    // 8. INTERNAL LOOKUP (for other services)
    // ══════════════════════════════════════════════════════════
    public AppointmentResponse getAppointmentInternal(Long id) {
        Appointment appointment = appointmentRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found: " + id));
        return toResponse(appointment);
    }

    // ══════════════════════════════════════════════════════════
    // NOTIFICATION HELPER
    // ══════════════════════════════════════════════════════════
    private void sendNotification(String email, String title, String message,
                                  String type, Long referenceId) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("recipientEmail", email);
            payload.put("title", title);
            payload.put("message", message);
            payload.put("type", type);
            payload.put("referenceId", referenceId);
            payload.put("referenceType", "APPOINTMENT");
            payload.put("channel", "IN_APP");

            notificationClient.sendNotification(payload);
            log.info("Notification sent: {} to {}", title, email);
        } catch (Exception e) {
            log.error("Failed to send notification: {}", e.getMessage());
            // Don't throw — notification failure shouldn't break main flow
        }
    }

    // ══════════════════════════════════════════════════════════
    // HELPERS
    // ══════════════════════════════════════════════════════════
    private AppointmentResponse toResponse(Appointment a) {
        return new AppointmentResponse(
                a.getId(),
                a.getCustomerEmail(),
                a.getVehicleId(),
                a.getVehicleRegistrationNumber(),
                a.getServiceType(),
                a.getAppointmentDate(),
                a.getTimeSlot(),
                a.getProblemDescription(),
                a.getStatus(),
                a.getMechanicId(),
                a.getMechanicName(),
                a.getEstimatedCost(),
                a.getActualCost(),
                a.getAdminNotes(),
                a.getCompletedAt(),
                a.getCreatedAt(),
                a.getUpdatedAt()
        );
    }

    private AppointmentSummaryResponse toSummary(Appointment a) {
        return new AppointmentSummaryResponse(
                a.getId(),
                a.getVehicleRegistrationNumber(),
                a.getServiceType(),
                a.getAppointmentDate(),
                a.getTimeSlot(),
                a.getStatus(),
                a.getMechanicName()
        );
    }
}