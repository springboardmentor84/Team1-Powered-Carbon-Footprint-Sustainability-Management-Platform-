package com.ecotrack.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ecotrack.entity.ChallengeParticipantEntity;

public interface ChallengeParticipantRepository
        extends JpaRepository<ChallengeParticipantEntity, Long> {

    Optional<ChallengeParticipantEntity>
    findByChallengeIdAndUserId(
            Long challengeId,
            Long userId
    );

    boolean existsByChallengeIdAndUserId(
            Long challengeId,
            Long userId
    );

    List<ChallengeParticipantEntity>
    findByUserId(Long userId);

    long countByChallengeIdAndStatusNot(
            Long challengeId,
            ChallengeParticipantEntity.Status status
    );
}