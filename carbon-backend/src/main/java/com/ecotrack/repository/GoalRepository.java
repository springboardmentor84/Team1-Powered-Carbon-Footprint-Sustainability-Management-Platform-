package com.ecotrack.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ecotrack.entity.GoalEntity;
import com.ecotrack.entity.User;

public interface GoalRepository extends JpaRepository<GoalEntity, Long> {

    List<GoalEntity> findByUser(User user);

}