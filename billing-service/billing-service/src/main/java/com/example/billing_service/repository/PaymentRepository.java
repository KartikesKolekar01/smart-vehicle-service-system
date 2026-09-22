package com.example.billing_service.repository;

import com.example.billing_service.entity.Payment;
import com.example.billing_service.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByCustomerEmailAndActiveTrueOrderByCreatedAtDesc(String customerEmail);

    Optional<Payment> findByIdAndActiveTrue(Long id);

    Optional<Payment> findByAppointmentIdAndActiveTrue(Long appointmentId);

    List<Payment> findByStatusAndActiveTrueOrderByCreatedAtDesc(PaymentStatus status);

    List<Payment> findAllByActiveTrueOrderByCreatedAtDesc();

    boolean existsByPaymentReference(String paymentReference);

    boolean existsByAppointmentIdAndActiveTrue(Long appointmentId);
}