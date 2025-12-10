package com.electronics.backend.dto;

import java.util.List;

public class LoginResponse {
    private String email;
    private List<String> roles;
    private String jwtToken;
    private String userType;
    private Long userId;
    private String firstName;
    private String lastName;
    private boolean requires2fa;

    // Constructeur complet
    public LoginResponse(String email, List<String> roles, String jwtToken, String userType,
                         Long userId, String firstName, String lastName, boolean requires2fa) {
        this.email = email;
        this.roles = roles;
        this.jwtToken = jwtToken;
        this.userType = userType;
        this.userId = userId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.requires2fa = requires2fa;
    }

    // Constructeur par défaut
    public LoginResponse(Object o, String userType, Long id, String email, String firstName, String lastName, boolean b) {}

    // Getters et Setters
    public String getEmail(String username, List<String> roles, String jwtToken, String userType, Long id, String firstName, String lastName, boolean requires2fa) { return email; }
    public void setEmail(String email) { this.email = email; }

    public List<String> getRoles() { return roles; }
    public void setRoles(List<String> roles) { this.roles = roles; }

    public String getJwtToken() { return jwtToken; }
    public void setJwtToken(String jwtToken) { this.jwtToken = jwtToken; }

    public String getUserType() { return userType; }
    public void setUserType(String userType) { this.userType = userType; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public boolean isRequires2fa() { return requires2fa; }
    public void setRequires2fa(boolean requires2fa) { this.requires2fa = requires2fa; }
}
