package com.example.appointment_service.security;

import com.example.appointment_service.exception.UnauthorizedActionException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Component
@Slf4j
public class UserContext {

    public String getCurrentUserEmail() {
        String email = getHeader("X-User-Email");
        if (email == null || email.isBlank()) {
            throw new UnauthorizedActionException("User context not found. Please login again.");
        }
        return email;
    }

    public String getCurrentUserRole() {
        String role = getHeader("X-User-Role");
        return role != null ? role : "ROLE_CUSTOMER";
    }

    public boolean isAdmin() {
        return "ROLE_ADMIN".equals(getCurrentUserRole());
    }

    private String getHeader(String headerName) {
        ServletRequestAttributes attributes =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes == null) return null;
        HttpServletRequest request = attributes.getRequest();
        return request.getHeader(headerName);
    }
}