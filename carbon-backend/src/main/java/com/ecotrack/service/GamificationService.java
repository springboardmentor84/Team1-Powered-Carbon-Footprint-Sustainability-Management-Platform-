package com.ecotrack.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ecotrack.dto.GamificationDTO;
import com.ecotrack.entity.ChallengeParticipantEntity;
import com.ecotrack.entity.GoalEntity;
import com.ecotrack.entity.User;
import com.ecotrack.repository.CarbonEntryRepository;
import com.ecotrack.repository.ChallengeParticipantRepository;
import com.ecotrack.repository.GoalRepository;

@Service
public class GamificationService {

    @Autowired
    private CarbonEntryRepository carbonEntryRepository;

    @Autowired
    private ChallengeParticipantRepository challengeParticipantRepository;

    @Autowired
    private GoalRepository goalRepository;


    public GamificationDTO getGamification(User user) {

        // ==========================================
        // EXISTING USER DATA
        // ==========================================

        int carbonEntries =
                carbonEntryRepository
                        .findByUser(user)
                        .size();

        List<ChallengeParticipantEntity> challenges =
                challengeParticipantRepository
                        .findByUserId(user.getUserId());

        List<GoalEntity> goals =
                goalRepository
                        .findByUser(user);


        // ==========================================
        // REWARD POINTS
        // ==========================================

        int challengePoints = 0;
        int completedChallenges = 0;

        for (ChallengeParticipantEntity participant : challenges) {

            if (
                    participant.getStatus()
                            == ChallengeParticipantEntity.Status.COMPLETED
            ) {

                challengePoints += 250;
                completedChallenges++;

            } else if (
                    participant.getStatus()
                            == ChallengeParticipantEntity.Status.JOINED
            ) {

                challengePoints += 100;

            }

        }


        int carbonPoints =
                carbonEntries * 10;

        int goalPoints =
                goals.size() * 50;


        int rewardPoints =
                carbonPoints
                + challengePoints
                + goalPoints;


        // ==========================================
        // ECO SCORE
        // ==========================================

        int ecoScore =
                Math.min(
                        500 + rewardPoints,
                        1000
                );


        // ==========================================
        // ACHIEVEMENT LEVEL
        // ==========================================

        String achievementLevel;

        if (rewardPoints >= 1000) {

            achievementLevel =
                    "Planet Protector";

        } else if (rewardPoints >= 750) {

            achievementLevel =
                    "Climate Hero";

        } else if (rewardPoints >= 500) {

            achievementLevel =
                    "Sustainability Champion";

        } else if (rewardPoints >= 250) {

            achievementLevel =
                    "Eco Warrior";

        } else {

            achievementLevel =
                    "Green Beginner";
        }


        // ==========================================
        // POINTS TO NEXT LEVEL
        // ==========================================

        int pointsToNextLevel;

        if (rewardPoints >= 1000) {

            pointsToNextLevel = 0;

        } else if (rewardPoints >= 750) {

            pointsToNextLevel =
                    1000 - rewardPoints;

        } else if (rewardPoints >= 500) {

            pointsToNextLevel =
                    750 - rewardPoints;

        } else if (rewardPoints >= 250) {

            pointsToNextLevel =
                    500 - rewardPoints;

        } else {

            pointsToNextLevel =
                    250 - rewardPoints;
        }


        // ==========================================
        // BADGES
        // ==========================================

        List<String> badges =
                new ArrayList<>();

        badges.add("Green Beginner");

        if (rewardPoints >= 250) {

            badges.add("Eco Warrior");

        }

        if (rewardPoints >= 500) {

            badges.add(
                    "Sustainability Champion"
            );

        }

        if (rewardPoints >= 750) {

            badges.add(
                    "Climate Hero"
            );

        }

        if (rewardPoints >= 1000) {

            badges.add(
                    "Planet Protector"
            );

        }


        return new GamificationDTO(
                rewardPoints,
                ecoScore,
                achievementLevel,
                pointsToNextLevel,
                badges
        );
    }
}