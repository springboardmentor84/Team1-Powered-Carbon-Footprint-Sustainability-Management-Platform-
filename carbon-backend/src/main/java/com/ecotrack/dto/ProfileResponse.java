package com.ecotrack.dto;

public class ProfileResponse {

    private Long userId;
    private String name;
    private String email;
    private String role;
    private boolean isActive;
    private String authProvider;

    public ProfileResponse() {
    }

    public ProfileResponse(Long userId, String name, String email,
                           String role, boolean isActive,
                           String authProvider) {
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.role = role;
        this.isActive = isActive;
        this.authProvider = authProvider;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public String getAuthProvider() {
        return authProvider;
    }

    public void setAuthProvider(String authProvider) {
        this.authProvider = authProvider;
    }
}