package com.ecotrack.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.ecotrack.dto.LoginRequest;
import com.ecotrack.dto.LoginResponse;
import com.ecotrack.dto.RegisterRequest;
import com.ecotrack.dto.RegisterResponse;
import com.ecotrack.service.UserService;

@RestController
public class AuthController {

    private final UserService userService;

    AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public RegisterResponse register(@jakarta.validation.Valid @RequestBody RegisterRequest request) {

        return userService.register(request);

    }
    
    
    @PostMapping("/login")
    public LoginResponse login(@jakarta.validation.Valid @RequestBody LoginRequest request) {
        return userService.login(request);
    }
}