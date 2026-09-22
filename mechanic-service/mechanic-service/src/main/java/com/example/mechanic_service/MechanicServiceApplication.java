package com.example.mechanic_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
public class MechanicServiceApplication {
	public static void main(String[] args) {
		SpringApplication.run(MechanicServiceApplication.class, args);
	}
}
