package com.ecotrack.dto;

public class LeaderboardDTO {

    private Long userId;
    private String name;
    private int rewardPoints;
    private int ecoScore;
    private String achievementLevel;
    private int rank;

    public LeaderboardDTO() {
    }

    public LeaderboardDTO(
            Long userId,
            String name,
            int rewardPoints,
            int ecoScore,
            String achievementLevel,
            int rank) {

        this.userId = userId;
        this.name = name;
        this.rewardPoints = rewardPoints;
        this.ecoScore = ecoScore;
        this.achievementLevel = achievementLevel;
        this.rank = rank;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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

    public int getRank() {
        return rank;
    }

    public void setRank(int rank) {
        this.rank = rank;
    }
}
