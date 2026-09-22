package com.example.appointment_service.repository;
import com.example.appointment_service.entity.Appointment;
import com.example.appointment_service.entity.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByCustomerEmailAndActiveTrueOrderByCreatedAtDesc(String customerEmail);

    Optional<Appointment> findByIdAndActiveTrue(Long id);

    List<Appointment> findByStatusAndActiveTrueOrderByAppointmentDateAsc(AppointmentStatus status);

    List<Appointment> findByMechanicIdAndActiveTrueOrderByAppointmentDateAsc(Long mechanicId);

    List<Appointment> findAllByActiveTrueOrderByAppointmentDateAsc();
}