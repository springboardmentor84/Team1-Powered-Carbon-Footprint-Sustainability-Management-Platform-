package com.ecotrack.dto;

import java.math.BigDecimal;
import java.util.Map;

public class AnalyticsDTO {

    private BigDecimal totalCarbonEmissions;
    private long totalActivities;
    
    private Map<String, BigDecimal> emissionsByCategory;
    private String highestEmissionCategory;
    
    private Map<String, BigDecimal> monthlyEmissions;
    private Map<String, BigDecimal> emissionTrends;
    
    private long completedGoals;
    private long activeGoals;
    
    private long challengeParticipationStats;
    private GamificationDTO gamificationStats;

    public AnalyticsDTO() {
    }

    public BigDecimal getTotalCarbonEmissions() {
        return totalCarbonEmissions;
    }

    public void setTotalCarbonEmissions(BigDecimal totalCarbonEmissions) {
        this.totalCarbonEmissions = totalCarbonEmissions;
    }

    public long getTotalActivities() {
        return totalActivities;
    }

    public void setTotalActivities(long totalActivities) {
        this.totalActivities = totalActivities;
    }

    public Map<String, BigDecimal> getEmissionsByCategory() {
        return emissionsByCategory;
    }

    public void setEmissionsByCategory(Map<String, BigDecimal> emissionsByCategory) {
        this.emissionsByCategory = emissionsByCategory;
    }

    public String getHighestEmissionCategory() {
        return highestEmissionCategory;
    }

    public void setHighestEmissionCategory(String highestEmissionCategory) {
        this.highestEmissionCategory = highestEmissionCategory;
    }

    public Map<String, BigDecimal> getMonthlyEmissions() {
        return monthlyEmissions;
    }

    public void setMonthlyEmissions(Map<String, BigDecimal> monthlyEmissions) {
        this.monthlyEmissions = monthlyEmissions;
    }

    public Map<String, BigDecimal> getEmissionTrends() {
        return emissionTrends;
    }

    public void setEmissionTrends(Map<String, BigDecimal> emissionTrends) {
        this.emissionTrends = emissionTrends;
    }

    public long getCompletedGoals() {
        return completedGoals;
    }

    public void setCompletedGoals(long completedGoals) {
        this.completedGoals = completedGoals;
    }

    public long getActiveGoals() {
        return activeGoals;
    }

    public void setActiveGoals(long activeGoals) {
        this.activeGoals = activeGoals;
    }

    public long getChallengeParticipationStats() {
        return challengeParticipationStats;
    }

    public void setChallengeParticipationStats(long challengeParticipationStats) {
        this.challengeParticipationStats = challengeParticipationStats;
    }

    public GamificationDTO getGamificationStats() {
        return gamificationStats;
    }

    public void setGamificationStats(GamificationDTO gamificationStats) {
        this.gamificationStats = gamificationStats;
    }
}
