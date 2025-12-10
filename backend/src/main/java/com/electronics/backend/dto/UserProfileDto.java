package com.electronics.backend.dto;

public class UserProfileDto {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String userType;
    private boolean googleAuthEnabled;

    // Getters
    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getPhone() { return phone; }
    public String getUserType() { return userType; }
    public boolean isGoogleAuthEnabled() { return googleAuthEnabled; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setEmail(String email) { this.email = email; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public void setPhone(String phone) { this.phone = phone; }
    public void setUserType(String userType) { this.userType = userType; }
    public void setGoogleAuthEnabled(boolean googleAuthEnabled) { this.googleAuthEnabled = googleAuthEnabled; }
}
