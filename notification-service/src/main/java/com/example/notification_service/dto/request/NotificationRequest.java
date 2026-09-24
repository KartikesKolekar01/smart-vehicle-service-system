package com.example.notification_service.dto.request;

import com.example.notification_service.entity.NotificationChannel;
import com.example.notification_service.entity.NotificationType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class NotificationRequest {

    @NotBlank(message = "Recipient email is required")
    @Email(message = "Invalid email format")
    private String recipientEmail;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Message is required")
    private String message;

    @NotNull(message = "Type is required")
    private NotificationType type;

    private NotificationChannel channel = NotificationChannel.IN_APP;

    private Long referenceId;

    private String referenceType;
}