package com.ecotrack.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.ecotrack.dto.LoginRequest;
import com.ecotrack.dto.LoginResponse;
import com.ecotrack.dto.RegisterRequest;
import com.ecotrack.dto.RegisterResponse;
import com.ecotrack.entity.User;
import com.ecotrack.jwt.JwtUtil;
import com.ecotrack.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private NotificationService notificationService;


    @Transactional
    public RegisterResponse register(RegisterRequest request) {

        if (request == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Registration data is required");
        }

        String name = request.getName();
        String email = request.getEmail();
        String password = request.getPassword();

        if (name == null || name.isBlank()
                || email == null || email.isBlank()
                || password == null || password.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Name, email and password are required");
        }

        email = email.trim().toLowerCase();

        Optional<User> existingUser = userRepository.findByEmail(email);

        if (existingUser.isPresent()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email already exists");
        }

        User user = new User();
        user.setName(name.trim());
        user.setEmail(email.trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole("USER");
        user.setAuthProvider("LOCAL");
        user.setIsActive(true);

        userRepository.save(user);

        notificationService.createNotification(
                user,
                "Welcome to EcoTrack",
                "Your account is ready. Start tracking activities, goals, and challenges.");

        return new RegisterResponse("User registered successfully");
    }


    public LoginResponse login(LoginRequest request) {

        if (request == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Login data is required");
        }

        if (request.getEmail() == null || request.getPassword() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Email and password are required");
        }

        String email = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Invalid email or password"));

        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Account is inactive");
        }

        boolean passwordMatches;
        try {
            passwordMatches = user.getPasswordHash() != null
                    && passwordEncoder.matches(request.getPassword(), user.getPasswordHash());
        } catch (IllegalArgumentException ex) {
            // Existing legacy/plaintext rows must never authenticate as if
            // they were valid bcrypt credentials.
            passwordMatches = false;
        }

        if (!passwordMatches) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid email or password");
        }

        String role = user.getRole();
        if (role == null || role.isBlank()) {
            role = "USER";
        }
        role = role.toUpperCase();

        String token = jwtUtil.generateToken(user.getEmail(), role);

        return new LoginResponse(token, role);
    }


    public String s() {
        return null;
    }

}
