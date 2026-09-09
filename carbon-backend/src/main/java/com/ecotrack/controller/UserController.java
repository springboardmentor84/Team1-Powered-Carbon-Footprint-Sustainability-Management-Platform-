package com.ecotrack.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.RestController;

import com.ecotrack.dto.ProfileResponse;
import com.ecotrack.entity.User;
import com.ecotrack.security.AuthUserResolver;
import com.ecotrack.service.UserService;





@RestController
public class UserController {

    @Autowired
    private UserService us;
    
    @Autowired
    private AuthUserResolver authUserResolver;

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

        User user = authUserResolver.requireUser(authentication);

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
