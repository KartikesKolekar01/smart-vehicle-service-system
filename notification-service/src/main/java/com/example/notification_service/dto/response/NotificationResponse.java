package com.example.notification_service.dto.response;

import com.example.notification_service.entity.NotificationChannel;
import com.example.notification_service.entity.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private String recipientEmail;
    private String title;
    private String message;
    private NotificationType type;
    private NotificationChannel channel;
    private Boolean isRead;
    private Long referenceId;
    private String referenceType;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;
}