package com.ecotrack.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ecotrack.entity.ChallengeEntity;

public interface ChallengeRepository
        extends JpaRepository<ChallengeEntity, Long> {
}