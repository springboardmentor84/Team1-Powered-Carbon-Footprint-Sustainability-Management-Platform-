package com.ecotrack.service;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.ecotrack.dto.AnalyticsDTO;
import com.ecotrack.dto.GamificationDTO;
import com.ecotrack.entity.CarbonEntry;
import com.ecotrack.entity.ChallengeParticipantEntity;
import com.ecotrack.entity.GoalEntity;
import com.ecotrack.entity.User;
import com.ecotrack.repository.CarbonEntryRepository;
import com.ecotrack.repository.ChallengeParticipantRepository;
import com.ecotrack.repository.GoalRepository;

@Service
public class AnalyticsService {

    private final CarbonEntryRepository carbonEntryRepository;
    private final GoalRepository goalRepository;
    private final ChallengeParticipantRepository challengeParticipantRepository;
    private final GamificationService gamificationService;

    public AnalyticsService(CarbonEntryRepository carbonEntryRepository,
                            GoalRepository goalRepository,
                            ChallengeParticipantRepository challengeParticipantRepository,
                            GamificationService gamificationService) {
        this.carbonEntryRepository = carbonEntryRepository;
        this.goalRepository = goalRepository;
        this.challengeParticipantRepository = challengeParticipantRepository;
        this.gamificationService = gamificationService;
    }

    public AnalyticsDTO getAnalyticsForUser(User user) {
        AnalyticsDTO dto = new AnalyticsDTO();
        
        List<CarbonEntry> entries = carbonEntryRepository.findByUser(user);
        
        // 1. Total Carbon Emissions & Activities
        BigDecimal totalCarbon = BigDecimal.ZERO;
        for (CarbonEntry entry : entries) {
            if (entry.getCarbonEmissionKg() != null) {
                totalCarbon = totalCarbon.add(entry.getCarbonEmissionKg());
            }
        }
        dto.setTotalCarbonEmissions(totalCarbon);
        dto.setTotalActivities(entries.size());
        
        // 2. Emissions By Category (Normalized)
        Map<String, BigDecimal> byCategory = new HashMap<>();
        for (CarbonEntry entry : entries) {
            if (entry.getCategory() != null && entry.getCarbonEmissionKg() != null) {
                String category = normalizeCategory(entry.getCategory());
                byCategory.put(category, byCategory.getOrDefault(category, BigDecimal.ZERO).add(entry.getCarbonEmissionKg()));
            }
        }
        dto.setEmissionsByCategory(byCategory);
        
        // Highest Emission Category
        String highestCategory = "None";
        BigDecimal maxEmission = BigDecimal.ZERO;
        for (Map.Entry<String, BigDecimal> cat : byCategory.entrySet()) {
            if (cat.getValue().compareTo(maxEmission) > 0) {
                maxEmission = cat.getValue();
                highestCategory = cat.getKey();
            }
        }
        dto.setHighestEmissionCategory(highestCategory);
        
        // 3. Monthly Emissions & Trends
        Map<String, BigDecimal> monthly = new TreeMap<>(); // YYYY-MM
        Map<String, BigDecimal> daily = new TreeMap<>(); // YYYY-MM-DD
        for (CarbonEntry entry : entries) {
            if (entry.getEntryDate() != null && entry.getCarbonEmissionKg() != null) {
                String monthKey = entry.getEntryDate().format(DateTimeFormatter.ofPattern("yyyy-MM"));
                String dayKey = entry.getEntryDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
                monthly.put(monthKey, monthly.getOrDefault(monthKey, BigDecimal.ZERO).add(entry.getCarbonEmissionKg()));
                daily.put(dayKey, daily.getOrDefault(dayKey, BigDecimal.ZERO).add(entry.getCarbonEmissionKg()));
            }
        }
        dto.setMonthlyEmissions(monthly);
        dto.setEmissionTrends(daily);

        // 4. Goal Stats
        List<GoalEntity> goals = goalRepository.findByUser(user);
        long activeGoals = goals.stream().filter(g -> !"COMPLETED".equalsIgnoreCase(g.getStatus())).count();
        long completedGoals = goals.stream().filter(g -> "COMPLETED".equalsIgnoreCase(g.getStatus())).count();
        dto.setActiveGoals(activeGoals);
        dto.setCompletedGoals(completedGoals);
        
        // 5. Challenge Stats
        List<ChallengeParticipantEntity> challenges = challengeParticipantRepository.findByUserId(user.getUserId());
        dto.setChallengeParticipationStats(challenges.size());
        
        // 6. Gamification
        GamificationDTO gamification = gamificationService.getGamification(user);
        dto.setGamificationStats(gamification);

        return dto;
    }

    private String normalizeCategory(String category) {
        if (category == null || category.trim().isEmpty()) {
            return "Other";
        }
        String trimmed = category.trim();
        return trimmed.substring(0, 1).toUpperCase() + trimmed.substring(1).toLowerCase();
    }
}
