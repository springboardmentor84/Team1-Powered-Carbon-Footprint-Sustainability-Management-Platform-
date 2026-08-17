
package com.ecotrack.service;
import com.ecotrack.entity.User;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ecotrack.entity.GoalEntity;
import com.ecotrack.entity.User;
import com.ecotrack.repository.GoalRepository;

@Service
public class GoalService {

    @Autowired
    private GoalRepository goalRepository;

    // Create goal
    public GoalEntity createGoal(GoalEntity goal, User user) {

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

        return goalRepository.save(goal);
    }

    // Get all goals of logged-in user
    public List<GoalEntity> getUserGoals(User user) {

        return goalRepository.findByUser(user);
    }

    // Get one goal
    public GoalEntity getGoal(Long id) {

        return goalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Goal not found"));
    }

    // Update goal
    public GoalEntity updateGoal(Long id, GoalEntity updatedGoal) {

        GoalEntity existingGoal = getGoal(id);

        // Only update fields that are actually provided
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

        return goalRepository.save(existingGoal);
    }

    // Delete goal
    public void deleteGoal(Long id) {

        if (!goalRepository.existsById(id)) {
            throw new RuntimeException("Goal not found");
        }

        goalRepository.deleteById(id);
    }
}