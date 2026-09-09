package com.ecotrack.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.ecotrack.entity.ChallengeEntity;
import com.ecotrack.entity.ChallengeParticipantEntity;
import com.ecotrack.entity.User;
import com.ecotrack.repository.ChallengeParticipantRepository;
import com.ecotrack.repository.ChallengeRepository;

@Service
public class ChallengeService {

    private final ChallengeRepository challengeRepository;
    private final ChallengeParticipantRepository participantRepository;
    private final NotificationService notificationService;

    public ChallengeService(
            ChallengeRepository challengeRepository,
            ChallengeParticipantRepository participantRepository,
            NotificationService notificationService) {

        this.challengeRepository = challengeRepository;
        this.participantRepository = participantRepository;
        this.notificationService = notificationService;
    }

    public List<ChallengeEntity> getAllChallenges() {

        List<ChallengeEntity> challenges = challengeRepository.findAll();

        for (ChallengeEntity challenge : challenges) {
            long count = participantRepository.countByChallengeIdAndStatusNot(
                    challenge.getId(),
                    ChallengeParticipantEntity.Status.QUIT);
            challenge.setParticipants((int) count);
        }

        return challenges;
    }

    public ChallengeEntity getChallengeById(Long id) {

        ChallengeEntity challenge = challengeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Challenge not found"));

        long count = participantRepository.countByChallengeIdAndStatusNot(
                challenge.getId(),
                ChallengeParticipantEntity.Status.QUIT);
        challenge.setParticipants((int) count);
        return challenge;
    }

    public ChallengeEntity createChallenge(ChallengeEntity challenge) {

        if (challenge.getTitle() == null || challenge.getTitle().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Challenge title is required");
        }

        if (challenge.getCreatedAt() == null) {
            challenge.setCreatedAt(LocalDateTime.now());
        }

        if (challenge.getReward() == null) {
            challenge.setReward(0);
        }

        return challengeRepository.save(challenge);
    }

    public ChallengeEntity updateChallenge(Long id, ChallengeEntity updatedChallenge) {

        ChallengeEntity existing = getChallengeById(id);

        if (updatedChallenge.getTitle() != null) {
            existing.setTitle(updatedChallenge.getTitle());
        }
        if (updatedChallenge.getDescription() != null) {
            existing.setDescription(updatedChallenge.getDescription());
        }
        if (updatedChallenge.getStartDate() != null) {
            existing.setStartDate(updatedChallenge.getStartDate());
        }
        if (updatedChallenge.getEndDate() != null) {
            existing.setEndDate(updatedChallenge.getEndDate());
        }
        if (updatedChallenge.getReward() != null) {
            existing.setReward(updatedChallenge.getReward());
        }

        return challengeRepository.save(existing);
    }

    @Transactional
    public ChallengeParticipantEntity joinChallenge(Long challengeId, User user) {

        ChallengeEntity challenge = getChallengeById(challengeId);
        Long userId = user.getUserId();

        Optional<ChallengeParticipantEntity> existing =
                participantRepository.findByChallengeIdAndUserId(challengeId, userId);

        if (existing.isPresent()) {
            ChallengeParticipantEntity participant = existing.get();

            if (participant.getStatus() == ChallengeParticipantEntity.Status.JOINED
                    || participant.getStatus() == ChallengeParticipantEntity.Status.COMPLETED) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "You have already joined this challenge");
            }

            participant.setStatus(ChallengeParticipantEntity.Status.JOINED);
            participant.setJoinedAt(LocalDateTime.now());
            ChallengeParticipantEntity saved = participantRepository.save(participant);

            notificationService.createNotification(
                    user,
                    "Challenge joined",
                    "You joined: " + challenge.getTitle());

            return saved;
        }

        ChallengeParticipantEntity participant = new ChallengeParticipantEntity();
        participant.setChallengeId(challengeId);
        participant.setUserId(userId);
        participant.setJoinedAt(LocalDateTime.now());
        participant.setStatus(ChallengeParticipantEntity.Status.JOINED);

        ChallengeParticipantEntity saved = participantRepository.save(participant);

        notificationService.createNotification(
                user,
                "Challenge joined",
                "You joined: " + challenge.getTitle());

        return saved;
    }

    public boolean isJoined(Long challengeId, User user) {

        return participantRepository
                .findByChallengeIdAndUserId(challengeId, user.getUserId())
                .map(participant -> participant.getStatus()
                        != ChallengeParticipantEntity.Status.QUIT)
                .orElse(false);
    }

    @Transactional
    public ChallengeParticipantEntity leaveChallenge(Long challengeId, User user) {

        ChallengeParticipantEntity participant = participantRepository
                .findByChallengeIdAndUserId(challengeId, user.getUserId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "You have not joined this challenge"));

        participant.setStatus(ChallengeParticipantEntity.Status.QUIT);
        return participantRepository.save(participant);
    }

    @Transactional
    public ChallengeParticipantEntity completeChallenge(Long challengeId, User user) {

        ChallengeEntity challenge = getChallengeById(challengeId);

        ChallengeParticipantEntity participant = participantRepository
                .findByChallengeIdAndUserId(challengeId, user.getUserId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "You have not joined this challenge"));

        if (participant.getStatus() == ChallengeParticipantEntity.Status.QUIT) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Rejoin the challenge before completing it");
        }

        if (participant.getStatus() != ChallengeParticipantEntity.Status.COMPLETED) {
            participant.setStatus(ChallengeParticipantEntity.Status.COMPLETED);
            participantRepository.save(participant);

            notificationService.createNotification(
                    user,
                    "Challenge completed",
                    "You completed: " + challenge.getTitle()
                            + ". Reward points were added to your eco score.");
        }

        return participant;
    }

    public ChallengeParticipantEntity.Status getChallengeStatus(
            Long challengeId,
            User user) {

        return participantRepository
                .findByChallengeIdAndUserId(challengeId, user.getUserId())
                .map(ChallengeParticipantEntity::getStatus)
                .orElse(ChallengeParticipantEntity.Status.QUIT);
    }

    public void deleteChallenge(Long id) {

        if (!challengeRepository.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Challenge not found");
        }

        challengeRepository.deleteById(id);
    }

}
