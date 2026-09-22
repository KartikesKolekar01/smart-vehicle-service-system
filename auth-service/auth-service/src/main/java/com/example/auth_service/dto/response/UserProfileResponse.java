package com.example.auth_service.dto.response;

import com.example.auth_service.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class UserProfileResponse {
    private Long id;
    private String email;
    private Role role;
    private LocalDateTime createdAt;
}