package com.example.notification_service.service;

import com.example.notification_service.dto.request.NotificationRequest;
import com.example.notification_service.dto.response.NotificationResponse;
import com.example.notification_service.entity.Notification;
import com.example.notification_service.entity.NotificationChannel;
import com.example.notification_service.entity.NotificationType;
import com.example.notification_service.exception.ResourceNotFoundException;
import com.example.notification_service.repository.NotificationRepository;
import com.example.notification_service.security.UserContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserContext userContext;

    @Transactional
    public NotificationResponse createNotification(NotificationRequest request) {
        Notification notification = new Notification();
        notification.setRecipientEmail(request.getRecipientEmail());
        notification.setTitle(request.getTitle());
        notification.setMessage(request.getMessage());
        notification.setType(request.getType());
        notification.setChannel(request.getChannel() != null
                ? request.getChannel()
                : NotificationChannel.IN_APP);
        notification.setReferenceId(request.getReferenceId());
        notification.setReferenceType(request.getReferenceType());
        notification.setIsRead(false);

        Notification saved = notificationRepository.save(notification);

        log.info("Notification [{}] sent to {}: {}",
                saved.getType(), saved.getRecipientEmail(), saved.getTitle());
        log.info("   Message: {}", saved.getMessage());

        return toResponse(saved);
    }

    public List<NotificationResponse> getMyNotifications() {
        String email = userContext.getCurrentUserEmail();
        return notificationRepository.findByRecipientEmailOrderByCreatedAtDesc(email)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<NotificationResponse> getUnread() {
        String email = userContext.getCurrentUserEmail();
        return notificationRepository.findByRecipientEmailAndIsReadOrderByCreatedAtDesc(email, false)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public Long getUnreadCount() {
        String email = userContext.getCurrentUserEmail();
        return notificationRepository.countByRecipientEmailAndIsRead(email, false);
    }

    public NotificationResponse getById(Long id) {
        String email = userContext.getCurrentUserEmail();
        Notification notification = notificationRepository.findByIdAndRecipientEmail(id, email)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + id));
        return toResponse(notification);
    }

    @Transactional
    public NotificationResponse markAsRead(Long id) {
        String email = userContext.getCurrentUserEmail();
        Notification notification = notificationRepository.findByIdAndRecipientEmail(id, email)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + id));

        if (!notification.getIsRead()) {
            notification.setIsRead(true);
            notification.setReadAt(LocalDateTime.now());
            notificationRepository.save(notification);
        }
        return toResponse(notification);
    }

    @Transactional
    public int markAllAsRead() {
        String email = userContext.getCurrentUserEmail();
        List<Notification> unread = notificationRepository
                .findByRecipientEmailAndIsReadOrderByCreatedAtDesc(email, false);

        LocalDateTime now = LocalDateTime.now();
        unread.forEach(n -> {
            n.setIsRead(true);
            n.setReadAt(now);
        });
        notificationRepository.saveAll(unread);

        log.info("Marked {} notifications as read for {}", unread.size(), email);
        return unread.size();
    }

    @Transactional
    public void delete(Long id) {
        String email = userContext.getCurrentUserEmail();
        Notification notification = notificationRepository.findByIdAndRecipientEmail(id, email)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + id));
        notificationRepository.delete(notification);
    }

    public List<NotificationResponse> getByType(NotificationType type) {
        String email = userContext.getCurrentUserEmail();
        return notificationRepository.findByRecipientEmailAndTypeOrderByCreatedAtDesc(email, type)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    private NotificationResponse toResponse(Notification n) {
        return new NotificationResponse(
                n.getId(),
                n.getRecipientEmail(),
                n.getTitle(),
                n.getMessage(),
                n.getType(),
                n.getChannel(),
                n.getIsRead(),
                n.getReferenceId(),
                n.getReferenceType(),
                n.getReadAt(),
                n.getCreatedAt()
        );
    }
}