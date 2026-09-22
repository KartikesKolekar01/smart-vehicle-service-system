package com.example.appointment_service.client;


import com.example.appointment_service.dto.response.VehicleSummary;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "VEHICLE-SERVICE")
public interface VehicleClient {

    @GetMapping("/vehicles/internal/{id}")
    VehicleSummary getVehicleById(@PathVariable("id") Long id);
}