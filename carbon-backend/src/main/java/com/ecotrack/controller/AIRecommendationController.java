package com.ecotrack.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecotrack.ai.AIRecommendationService;
import com.ecotrack.dto.CarbonSummaryDTO;
import com.ecotrack.entity.GoalEntity;
import com.ecotrack.entity.User;
import com.ecotrack.security.AuthUserResolver;
import com.ecotrack.service.CarbonEntryService;
import com.ecotrack.service.GoalService;

@RestController
@RequestMapping("/ai")
public class AIRecommendationController {

    @Autowired
    private CarbonEntryService carbonEntryService;

    @Autowired
    private GoalService goalService;

    @Autowired
    private AuthUserResolver authUserResolver;

    @Autowired
    private AIRecommendationService aiRecommendationService;

    @GetMapping("/recommendations")
    public String getRecommendations(
            Authentication authentication) {

        User user = authUserResolver.requireUser(authentication);

        CarbonSummaryDTO summary =
                carbonEntryService.getCarbonSummary(user);

        List<GoalEntity> goals =
                goalService.getUserGoals(user);

        return aiRecommendationService
                .generateRecommendation(summary, goals);
    }
}
