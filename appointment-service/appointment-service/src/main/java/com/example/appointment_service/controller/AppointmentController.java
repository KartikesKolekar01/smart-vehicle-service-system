package com.example.appointment_service.controller;

import com.example.appointment_service.dto.request.AppointmentRequest;
import com.example.appointment_service.dto.request.AssignMechanicRequest;
import com.example.appointment_service.dto.request.StatusUpdateRequest;
import com.example.appointment_service.dto.response.ApiResponse;
import com.example.appointment_service.dto.response.AppointmentResponse;
import com.example.appointment_service.dto.response.AppointmentSummaryResponse;
import com.example.appointment_service.entity.AppointmentStatus;
import com.example.appointment_service.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    // 1. Book appointment (Customer)
    @PostMapping
    public ResponseEntity<ApiResponse<AppointmentResponse>> bookAppointment(
            @Valid @RequestBody AppointmentRequest request) {
        AppointmentResponse response = appointmentService.bookAppointment(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Appointment booked successfully", response));
    }

    // 2. Get my appointments
    @GetMapping
    public ResponseEntity<ApiResponse<List<AppointmentSummaryResponse>>> getMyAppointments() {
        return ResponseEntity.ok(ApiResponse.success("Appointments fetched",
                appointmentService.getMyAppointments()));
    }

    // 3. Get by ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AppointmentResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Appointment fetched",
                appointmentService.getAppointmentById(id)));
    }

    // 4. Filter by status (Admin)
    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<AppointmentSummaryResponse>>> getByStatus(
            @PathVariable AppointmentStatus status) {
        return ResponseEntity.ok(ApiResponse.success("Appointments by status",
                appointmentService.getByStatus(status)));
    }

    // 5. Update status (Admin)
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<AppointmentResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Status updated",
                appointmentService.updateStatus(id, request)));
    }

    // 6. Assign mechanic (Admin)
    @PatchMapping("/{id}/assign")
    public ResponseEntity<ApiResponse<AppointmentResponse>> assignMechanic(
            @PathVariable Long id,
            @Valid @RequestBody AssignMechanicRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Mechanic assigned",
                appointmentService.assignMechanic(id, request)));
    }

    // 7. Cancel appointment
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<AppointmentResponse>> cancelAppointment(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Appointment cancelled",
                appointmentService.cancelAppointment(id)));
    }

    // 8. Internal lookup
    @GetMapping("/internal/{id}")
    public ResponseEntity<AppointmentResponse> getInternal(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.getAppointmentInternal(id));
    }
}