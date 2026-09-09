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
import com.ecotrack.security.AuthUserResolver;
import com.ecotrack.service.GoalService;

@RestController
@RequestMapping("/goals")
public class GoalController {

    @Autowired
    private GoalService goalService;

    @Autowired
    private AuthUserResolver authUserResolver;

    @PostMapping
    public GoalEntity createGoal(
            @jakarta.validation.Valid @RequestBody GoalEntity goal,
            Authentication authentication) {

        User user = authUserResolver.requireUser(authentication);
        return goalService.createGoal(goal, user);
    }

    @GetMapping
    public List<GoalEntity> getGoals(Authentication authentication) {

        User user = authUserResolver.requireUser(authentication);
        return goalService.getUserGoals(user);
    }

    @GetMapping("/{id}")
    public GoalEntity getGoal(
            @PathVariable Long id,
            Authentication authentication) {

        User user = authUserResolver.requireUser(authentication);
        return goalService.getGoal(id, user);
    }

    @PutMapping("/{id}")
    public GoalEntity updateGoal(
            @PathVariable Long id,
            @jakarta.validation.Valid @RequestBody GoalEntity goal,
            Authentication authentication) {

        User user = authUserResolver.requireUser(authentication);
        return goalService.updateGoal(id, goal, user);
    }

    @DeleteMapping("/{id}")
    public String deleteGoal(
            @PathVariable Long id,
            Authentication authentication) {

        User user = authUserResolver.requireUser(authentication);
        goalService.deleteGoal(id, user);
        return "Goal deleted successfully";
    }
}
