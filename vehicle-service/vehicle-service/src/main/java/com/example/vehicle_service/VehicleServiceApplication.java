package com.example.vehicle_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients  // Enables Feign clients for future service-to-service calls
public class VehicleServiceApplication {
	public static void main(String[] args) {
		SpringApplication.run(VehicleServiceApplication.class, args);
	}
}