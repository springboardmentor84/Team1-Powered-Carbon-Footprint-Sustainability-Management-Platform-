package com.ecotrack.service;
import java.util.Optional;
import com.ecotrack.jwt.JwtUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ecotrack.dto.LoginRequest;
import com.ecotrack.dto.LoginResponse;
import com.ecotrack.dto.RegisterRequest;
import com.ecotrack.dto.RegisterResponse;
import com.ecotrack.entity.User;
import com.ecotrack.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    public RegisterResponse register(RegisterRequest request) {

    	String name=request.getName();
    	String email = request.getEmail();
    	String password = request.getPassword();
    	
       Optional<User> existingUser= userRepository.findByEmail(email);

       if (existingUser.isPresent()) {
           return new RegisterResponse("Email already exists");
       }
       
       String encodedPassword = passwordEncoder.encode(password);
       
       User user = new User();
       
       user.setName(name);
       user.setEmail(email);
       user.setPasswordHash(encodedPassword);
       if (request.getRole() == null || request.getRole().isBlank()) {
    	    user.setRole("USER");
    	} else {
    	    user.setRole(request.getRole().toUpperCase());
    	}
       user.setAuthProvider("LOCAL");
       user.setIsActive(true);
       
       
       userRepository.save(user);
       
    	
        return new RegisterResponse("user register succussfully");

    }
    
    public LoginResponse login(LoginRequest request) {

        Optional<User> optionalUser =
                userRepository.findByEmail(request.getEmail());

        if (optionalUser.isEmpty()) {
            return new LoginResponse("Email Not Found");
        }

        User user = optionalUser.get();

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return new LoginResponse("Invalid Password");
        }
        
        String token = jwtUtil.generateToken(user.getEmail());

        return new LoginResponse(token);

        
        
        
    }

	public String s() {
		// TODO Auto-generated method stub
		return null;
	}

    
}