package com.example.auth_service.service;

import com.example.auth_service.dto.request.ForgotPasswordRequest;
import com.example.auth_service.dto.request.ResetPasswordRequest;
import com.example.auth_service.entity.PasswordResetToken;
import com.example.auth_service.repository.PasswordResetTokenRepository;
import java.time.LocalDateTime;
import com.example.auth_service.dto.request.LoginRequest;
import com.example.auth_service.dto.request.RegisterRequest;
import com.example.auth_service.dto.response.AuthResponse;
import com.example.auth_service.dto.response.UserProfileResponse;
import com.example.auth_service.entity.Role;
import com.example.auth_service.entity.User;
import com.example.auth_service.exception.InvalidCredentialsException;
import com.example.auth_service.exception.ResourceNotFoundException;
import com.example.auth_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Transactional
    public void register(RegisterRequest request) {
        log.info("Registering new user with email: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists!");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.ROLE_CUSTOMER);

        userRepository.save(user);
        log.info("User registered successfully: {}", request.getEmail());
    }
    // ══════════════════════════════════════════════════════════
// FORGOT PASSWORD — Generate reset token
// ══════════════════════════════════════════════════════════
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        log.info("Forgot password request for: {}", request.getEmail());

        // Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No account found with email: " + request.getEmail()
                ));

        // Delete any existing tokens for this user
        passwordResetTokenRepository.deleteByUserId(user.getId());

        // Generate token
        String token = UUID.randomUUID().toString().replace("-", "");
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUserId(user.getId());
        resetToken.setExpiryDate(LocalDateTime.now().plusMinutes(15));  // 15 min expiry
        resetToken.setUsed(false);
        passwordResetTokenRepository.save(resetToken);

        // ⚠️ MOCK EMAIL — In production, send an actual email
        log.info("═══════════════════════════════════════════════════════════");
        log.info("📧 PASSWORD RESET EMAIL (MOCK)");
        log.info("To: {}", user.getEmail());
        log.info("Subject: Reset Your Password");
        log.info("Reset Token: {}", token);
        log.info("Valid for: 15 minutes");
        log.info("Reset URL: http://localhost:3001/reset-password?token={}", token);
        log.info("═══════════════════════════════════════════════════════════");
    }

    // ══════════════════════════════════════════════════════════
// RESET PASSWORD — Verify token and update password
// ══════════════════════════════════════════════════════════
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        log.info("Reset password attempt");

        // Find token
        PasswordResetToken resetToken = passwordResetTokenRepository
                .findByToken(request.getToken())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid or expired reset token"));

        // Check if already used
        if (Boolean.TRUE.equals(resetToken.getUsed())) {
            throw new InvalidCredentialsException("Reset token has already been used");
        }

        // Check expiry
        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new InvalidCredentialsException("Reset token has expired. Please request a new one.");
        }

        // Find user
        User user = userRepository.findById(resetToken.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setRefreshToken(null);  // Force re-login
        userRepository.save(user);

        // Mark token as used
        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        log.info("Password reset successful for: {}", user.getEmail());
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        log.info("Login attempt for email: {}", request.getEmail());

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        String accessToken = jwtService.generateAccessToken(user.getEmail(), user.getRole());
        String refreshToken = jwtService.generateRefreshToken(user.getEmail(), user.getRole());

        user.setRefreshToken(refreshToken);
        userRepository.save(user);

        log.info("Login successful for user: {}", user.getEmail());
        return new AuthResponse(accessToken, refreshToken, user.getEmail(), user.getRole());
    }

    @Transactional
    public AuthResponse refreshAccessToken(String refreshToken) {
        log.info("Refreshing access token");

        if (!jwtService.validateRefreshToken(refreshToken)) {
            throw new InvalidCredentialsException("Invalid or expired refresh token");
        }

        User user = userRepository.findByRefreshToken(refreshToken)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid refresh token"));

        Role role = jwtService.extractRole(refreshToken);
        String newAccessToken = jwtService.generateAccessToken(user.getEmail(), role);

        log.info("Access token refreshed for user: {}", user.getEmail());
        return new AuthResponse(newAccessToken, refreshToken, user.getEmail(), role);
    }

    @Transactional
    public void logout(String refreshToken) {
        log.info("Logout request");

        User user = userRepository.findByRefreshToken(refreshToken)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setRefreshToken(null);
        userRepository.save(user);

        log.info("User logged out successfully: {}", user.getEmail());
    }

    public UserProfileResponse getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return new UserProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getRole(),
                user.getCreatedAt()
        );
    }
}