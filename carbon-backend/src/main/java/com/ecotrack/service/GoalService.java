package com.ecotrack.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.ecotrack.entity.GoalEntity;
import com.ecotrack.entity.User;
import com.ecotrack.repository.GoalRepository;

@Service
public class GoalService {

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private NotificationService notificationService;

    public GoalEntity createGoal(GoalEntity goal, User user) {

        validateGoal(goal);

        goal.setUser(user);

        if (goal.getCurrentValue() == null) {
            goal.setCurrentValue(BigDecimal.ZERO);
        }

        if (goal.getStatus() == null || goal.getStatus().isEmpty()) {
            goal.setStatus("ACTIVE");
        }

        if (goal.getCreatedAt() == null) {
            goal.setCreatedAt(LocalDateTime.now());
        }

        GoalEntity saved = goalRepository.save(goal);

        notificationService.createNotification(
                user,
                "Goal created",
                "You created a new sustainability goal: " + saved.getGoalName());

        return saved;
    }

    public List<GoalEntity> getUserGoals(User user) {
        return goalRepository.findByUser(user);
    }

    public GoalEntity getGoal(Long id, User user) {

        GoalEntity goal = goalRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Goal not found"));

        assertOwner(goal, user);
        return goal;
    }

    public GoalEntity updateGoal(Long id, GoalEntity updatedGoal, User user) {

        if (updatedGoal == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Goal data is required");
        }

        GoalEntity existingGoal = getGoal(id, user);
        boolean wasCompleted = "COMPLETED".equalsIgnoreCase(existingGoal.getStatus());

        if (updatedGoal.getGoalName() != null) {
            existingGoal.setGoalName(updatedGoal.getGoalName());
        }

        if (updatedGoal.getTargetValue() != null) {
            existingGoal.setTargetValue(updatedGoal.getTargetValue());
        }

        if (updatedGoal.getCurrentValue() != null) {
            existingGoal.setCurrentValue(updatedGoal.getCurrentValue());
        }

        if (updatedGoal.getStartDate() != null) {
            existingGoal.setStartDate(updatedGoal.getStartDate());
        }

        if (updatedGoal.getEndDate() != null) {
            existingGoal.setEndDate(updatedGoal.getEndDate());
        }

        if (updatedGoal.getStatus() != null) {
            existingGoal.setStatus(updatedGoal.getStatus());
        }

        GoalEntity saved = goalRepository.save(existingGoal);

        if (!wasCompleted && "COMPLETED".equalsIgnoreCase(saved.getStatus())) {
            notificationService.createNotification(
                    user,
                    "Goal completed",
                    "You completed your goal: " + saved.getGoalName());
        }

        return saved;
    }

    private void validateGoal(GoalEntity goal) {
        if (goal == null || goal.getGoalName() == null
                || goal.getGoalName().isBlank()
                || goal.getTargetValue() == null
                || goal.getTargetValue().signum() <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Goal name and a positive target value are required");
        }
    }

    public void deleteGoal(Long id, User user) {

        GoalEntity goal = getGoal(id, user);
        goalRepository.delete(goal);
    }

    private void assertOwner(GoalEntity goal, User user) {
        if (goal.getUser() == null
                || !goal.getUser().getUserId().equals(user.getUserId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You cannot access another user's goal");
        }
    }
}
