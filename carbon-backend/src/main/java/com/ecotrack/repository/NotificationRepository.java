package com.ecotrack.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ecotrack.entity.NotificationEntity;
import com.ecotrack.entity.User;

@Repository
public interface NotificationRepository
        extends JpaRepository<NotificationEntity, Long> {

    List<NotificationEntity> findByUserOrderByCreatedAtDesc(User user);

    long countByUserAndIsRead(User user, Boolean isRead);
}
