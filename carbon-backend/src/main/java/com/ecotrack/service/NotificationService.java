package com.ecotrack.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.ecotrack.dto.NotificationDTO;
import com.ecotrack.entity.NotificationEntity;
import com.ecotrack.entity.User;
import com.ecotrack.repository.NotificationRepository;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;


    // ==========================================
    // GET ALL NOTIFICATIONS FOR USER
    // ==========================================

    public List<NotificationDTO> getUserNotifications(User user) {

        return notificationRepository
                .findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }


    // ==========================================
    // GET UNREAD COUNT
    // ==========================================

    public long getUnreadCount(User user) {

        return notificationRepository
                .countByUserAndIsRead(user, false);
    }


    // ==========================================
    // MARK AS READ
    // ==========================================

    @Transactional
    public NotificationDTO markAsRead(
            Long notificationId,
            User user) {

        NotificationEntity notification =
                notificationRepository
                        .findById(notificationId)
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Notification not found"
                        ));

        // Only owner can mark it read
        if (!notification.getUser()
                .getUserId()
                .equals(user.getUserId())) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You cannot update another user's notification"
            );
        }

        notification.setIsRead(true);

        notificationRepository.save(notification);

        return toDTO(notification);
    }


    // ==========================================
    // CREATE NOTIFICATION
    // Called internally by other services
    // ==========================================

    @Transactional
    public void createNotification(
            User user,
            String title,
            String message) {

        NotificationEntity notification =
                new NotificationEntity();

        notification.setUser(user);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        notificationRepository.save(notification);
    }


    // ==========================================
    // ENTITY → DTO
    // ==========================================

    private NotificationDTO toDTO(
            NotificationEntity entity) {

        return new NotificationDTO(
                entity.getNotificationId(),
                entity.getTitle(),
                entity.getMessage(),
                entity.getIsRead(),
                entity.getCreatedAt()
        );
    }
}
