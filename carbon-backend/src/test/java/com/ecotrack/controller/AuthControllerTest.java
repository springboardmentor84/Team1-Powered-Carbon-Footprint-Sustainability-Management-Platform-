package com.ecotrack.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ecotrack.dto.LoginRequest;
import com.ecotrack.dto.LoginResponse;
import com.ecotrack.dto.RegisterRequest;
import com.ecotrack.dto.RegisterResponse;
import com.ecotrack.service.UserService;

@ExtendWith(MockitoExtension.class)
public class AuthControllerTest {

    @Mock
    private UserService userService;

    @InjectMocks
    private AuthController authController;

    @Test
    public void testSuccessfulRegistration() {
        RegisterRequest request = new RegisterRequest();
        request.setName("Test User");
        request.setEmail("test@example.com");

        RegisterResponse response = new RegisterResponse();
        response.setMessage("User registered successfully");

        when(userService.register(any(RegisterRequest.class))).thenReturn(response);

        RegisterResponse actual = authController.register(request);
        assertEquals("User registered successfully", actual.getMessage());
    }

    @Test
    public void testSuccessfulLogin() {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@example.com");
        request.setPassword("Password123!");

        LoginResponse response = new LoginResponse();
        response.setToken("mock-jwt-token");
        response.setRole("USER");

        when(userService.login(any(LoginRequest.class))).thenReturn(response);

        LoginResponse actual = authController.login(request);
        assertEquals("mock-jwt-token", actual.getToken());
        assertEquals("USER", actual.getRole());
    }
}
