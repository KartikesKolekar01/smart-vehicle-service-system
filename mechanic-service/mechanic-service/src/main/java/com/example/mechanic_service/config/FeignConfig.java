package com.example.mechanic_service.config;

import feign.RequestInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;

@Configuration
public class FeignConfig {

    @Bean
    public RequestInterceptor requestInterceptor() {
        return template -> {
            ServletRequestAttributes attributes =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                String userEmail = request.getHeader("X-User-Email");
                String userRole = request.getHeader("X-User-Role");
                String authHeader = request.getHeader("Authorization");

                if (userEmail != null) template.header("X-User-Email", userEmail);
                if (userRole != null) template.header("X-User-Role", userRole);
                if (authHeader != null) template.header("Authorization", authHeader);
            }
        };
    }
}