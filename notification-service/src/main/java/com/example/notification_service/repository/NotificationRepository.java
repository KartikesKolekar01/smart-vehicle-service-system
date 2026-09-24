package com.example.notification_service.repository;

import com.example.notification_service.entity.Notification;
import com.example.notification_service.entity.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipientEmailOrderByCreatedAtDesc(String recipientEmail);

    List<Notification> findByRecipientEmailAndIsReadOrderByCreatedAtDesc(String email, Boolean isRead);

    Optional<Notification> findByIdAndRecipientEmail(Long id, String email);

    Long countByRecipientEmailAndIsRead(String email, Boolean isRead);

    List<Notification> findByRecipientEmailAndTypeOrderByCreatedAtDesc(String email, NotificationType type);

    void deleteByRecipientEmail(String email);
}