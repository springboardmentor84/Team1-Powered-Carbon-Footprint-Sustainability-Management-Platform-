package com.ecotrack.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecotrack.dto.GamificationDTO;
import com.ecotrack.entity.User;
import com.ecotrack.security.AuthUserResolver;
import com.ecotrack.service.GamificationService;

@RestController
@RequestMapping("/gamification")
public class GamificationController {

    @Autowired
    private GamificationService gamificationService;

    @Autowired
    private AuthUserResolver authUserResolver;


    @GetMapping
    public GamificationDTO getGamification(
            Authentication authentication) {

        User user = authUserResolver.requireUser(authentication);

        return gamificationService
                .getGamification(user);
    }
}
