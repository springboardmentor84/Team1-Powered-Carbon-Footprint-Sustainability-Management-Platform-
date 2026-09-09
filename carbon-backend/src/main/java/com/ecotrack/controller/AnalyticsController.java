package com.ecotrack.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecotrack.dto.AnalyticsDTO;
import com.ecotrack.entity.User;
import com.ecotrack.security.AuthUserResolver;
import com.ecotrack.service.AnalyticsService;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final AuthUserResolver authUserResolver;

    public AnalyticsController(AnalyticsService analyticsService, AuthUserResolver authUserResolver) {
        this.analyticsService = analyticsService;
        this.authUserResolver = authUserResolver;
    }

    @GetMapping
    public ResponseEntity<AnalyticsDTO> getAnalytics(Authentication authentication) {
        User user = authUserResolver.requireUser(authentication);
        AnalyticsDTO analytics = analyticsService.getAnalyticsForUser(user);
        return ResponseEntity.ok(analytics);
    }
}
