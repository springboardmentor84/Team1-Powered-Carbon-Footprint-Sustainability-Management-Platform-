package com.ecotrack.controller;


import org.springframework.beans.factory.annotation.Autowired;
import com.ecotrack.repository.UserRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.RestController;

import com.ecotrack.dto.ProfileResponse;
import com.ecotrack.entity.User;
import com.ecotrack.service.UserService;





@RestController
public class UserController {

    @Autowired
    private UserService us;
    
    @Autowired
    private UserRepository userRepository;

    @GetMapping("/hii")
    public String se() {
        return us.s();
    }

    @GetMapping("/admin")
    public String admin() {
        return "Admin Page";
    }

    @GetMapping("/profile")
    public ProfileResponse profile(Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email).get();

        return new ProfileResponse(
                user.getUserId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getIsActive(),
                user.getAuthProvider()
        );
    }

}