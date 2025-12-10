package com.electronics.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "user_type")
@Table(name = "users")
public abstract class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    private String firstName;
    private String lastName;
    private String phone;
    private Boolean enabled = true;

    @Column(name = "google_auth_enabled")
    private Boolean googleAuthEnabled = false;

    @Column(name = "google_auth_secret")
    private String googleAuthSecret;

    private LocalDateTime createdAt;

    public User() {
        this.createdAt = LocalDateTime.now();
    }

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public Boolean getEnabled() { return enabled; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }
    public Boolean getGoogleAuthEnabled() { return googleAuthEnabled; }
    public void setGoogleAuthEnabled(Boolean googleAuthEnabled) { this.googleAuthEnabled = googleAuthEnabled; }
    public String getGoogleAuthSecret() { return googleAuthSecret; }
    public void setGoogleAuthSecret(String googleAuthSecret) { this.googleAuthSecret = googleAuthSecret; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public boolean isEnabled() { return enabled != null ? enabled : true; }
    public boolean isGoogleAuthEnabled() { return googleAuthEnabled != null ? googleAuthEnabled : false; }

    public String getUserType() {
        return this.getClass().getSimpleName().toUpperCase();
    }
}
