package com.ecotrack.dto;

import java.util.List;

public class GamificationDTO {

    private int rewardPoints;
    private int ecoScore;
    private String achievementLevel;
    private int pointsToNextLevel;

    private List<String> badges;

    public GamificationDTO() {
    }

    public GamificationDTO(
            int rewardPoints,
            int ecoScore,
            String achievementLevel,
            int pointsToNextLevel,
            List<String> badges) {

        this.rewardPoints = rewardPoints;
        this.ecoScore = ecoScore;
        this.achievementLevel = achievementLevel;
        this.pointsToNextLevel = pointsToNextLevel;
        this.badges = badges;
    }

    public int getRewardPoints() {
        return rewardPoints;
    }

    public void setRewardPoints(int rewardPoints) {
        this.rewardPoints = rewardPoints;
    }

    public int getEcoScore() {
        return ecoScore;
    }

    public void setEcoScore(int ecoScore) {
        this.ecoScore = ecoScore;
    }

    public String getAchievementLevel() {
        return achievementLevel;
    }

    public void setAchievementLevel(String achievementLevel) {
        this.achievementLevel = achievementLevel;
    }

    public int getPointsToNextLevel() {
        return pointsToNextLevel;
    }

    public void setPointsToNextLevel(int pointsToNextLevel) {
        this.pointsToNextLevel = pointsToNextLevel;
    }

    public List<String> getBadges() {
        return badges;
    }

    public void setBadges(List<String> badges) {
        this.badges = badges;
    }
}