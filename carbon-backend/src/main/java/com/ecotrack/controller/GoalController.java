package com.ecotrack.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecotrack.entity.GoalEntity;
import com.ecotrack.entity.User;
import com.ecotrack.repository.UserRepository;
import com.ecotrack.service.GoalService;

@RestController
@RequestMapping("/goals")
public class GoalController {

    @Autowired
    private GoalService goalService;

    @Autowired
    private UserRepository userRepository;

    // CREATE GOAL
    @PostMapping
    public GoalEntity createGoal(
            @RequestBody GoalEntity goal,
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return goalService.createGoal(goal, user);
    }

    // GET ALL USER GOALS
    @GetMapping
    public List<GoalEntity> getGoals(
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return goalService.getUserGoals(user);
    }

    // GET ONE GOAL
    @GetMapping("/{id}")
    public GoalEntity getGoal(@PathVariable Long id) {

        return goalService.getGoal(id);
    }

    // UPDATE GOAL
    
    @PutMapping("/{id}")
    public GoalEntity updateGoal(
            @PathVariable Long id,
            @RequestBody GoalEntity goal,
            Authentication authentication) {

        System.out.println("PUT GOAL USER = " + authentication.getName());

        return goalService.updateGoal(id, goal);
    }

    // DELETE GOAL
    @DeleteMapping("/{id}")
    public String deleteGoal(@PathVariable Long id) {

        goalService.deleteGoal(id);

        return "Goal deleted successfully";
    }
}