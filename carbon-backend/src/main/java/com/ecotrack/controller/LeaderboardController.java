package com.ecotrack.controller;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecotrack.dto.LeaderboardDTO;
import com.ecotrack.entity.User;
import com.ecotrack.repository.UserRepository;
import com.ecotrack.service.GamificationService;
import com.ecotrack.dto.GamificationDTO;

@RestController
@RequestMapping("/leaderboard")
public class LeaderboardController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GamificationService gamificationService;


    // ==========================================
    // GET LEADERBOARD
    // All users sorted by reward points desc
    // ==========================================

    @GetMapping
    public List<LeaderboardDTO> getLeaderboard() {

        List<User> allUsers =
                userRepository.findAll();

        List<LeaderboardDTO> entries =
                new ArrayList<>();

        for (User user : allUsers) {

            // Skip inactive users
            if (user.getIsActive() != null
                    && !user.getIsActive()) {
                continue;
            }

            GamificationDTO gamification =
                    gamificationService.getGamification(user);

            LeaderboardDTO entry =
                    new LeaderboardDTO(
                            user.getUserId(),
                            user.getName(),
                            gamification.getRewardPoints(),
                            gamification.getEcoScore(),
                            gamification.getAchievementLevel(),
                            0 // rank set below
                    );

            entries.add(entry);
        }

        // Sort by reward points descending
        entries.sort(
                Comparator.comparingInt(
                        LeaderboardDTO::getRewardPoints
                ).reversed()
        );

        // Assign ranks
        for (int i = 0; i < entries.size(); i++) {
            entries.get(i).setRank(i + 1);
        }

        return entries;
    }
}
