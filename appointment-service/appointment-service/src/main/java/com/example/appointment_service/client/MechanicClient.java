package com.example.appointment_service.client;

import com.example.appointment_service.dto.response.MechanicSummary;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "MECHANIC-SERVICE")
public interface MechanicClient {

    @GetMapping("/mechanics/internal/{id}")
    MechanicSummary getMechanicById(@PathVariable("id") Long id);
}