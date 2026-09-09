package com.ecotrack.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecotrack.dto.NotificationDTO;
import com.ecotrack.entity.User;
import com.ecotrack.security.AuthUserResolver;
import com.ecotrack.service.NotificationService;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuthUserResolver authUserResolver;


    // ==========================================
    // GET ALL NOTIFICATIONS
    // ==========================================

    @GetMapping
    public ResponseEntity<List<NotificationDTO>>
    getNotifications(Authentication authentication) {

        User user = authUserResolver.requireUser(authentication);

        return ResponseEntity.ok(
                notificationService.getUserNotifications(user)
        );
    }


    // ==========================================
    // GET UNREAD COUNT
    // ==========================================

    @GetMapping("/unread-count")
    public ResponseEntity<Long>
    getUnreadCount(Authentication authentication) {

        User user = authUserResolver.requireUser(authentication);

        return ResponseEntity.ok(
                notificationService.getUnreadCount(user)
        );
    }


    // ==========================================
    // MARK AS READ
    // ==========================================

    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationDTO>
    markAsRead(
            @PathVariable Long id,
            Authentication authentication) {

        User user = authUserResolver.requireUser(authentication);

        return ResponseEntity.ok(
                notificationService.markAsRead(id, user)
        );
    }


}
