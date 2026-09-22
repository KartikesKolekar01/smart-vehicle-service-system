package com.example.billing_service.client;

import com.example.billing_service.dto.response.AppointmentSummary;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "APPOINTMENT-SERVICE")
public interface AppointmentClient {

    @GetMapping("/appointments/internal/{id}")
    AppointmentSummary getAppointmentById(@PathVariable("id") Long id);
}