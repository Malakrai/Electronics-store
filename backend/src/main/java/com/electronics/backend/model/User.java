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
    private String address;

    private Boolean enabled = true;

    @Column(name = "profile_image")
    private String profileImage;

    @Column(name = "google_auth_enabled")
    private Boolean googleAuthEnabled = false;

    @Column(name = "google_auth_secret")
    private String googleAuthSecret;

    private LocalDateTime createdAt = LocalDateTime.now();

    // Getters & Setters
    public Long getId() { return id; }
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

    public String getAddress() { return address; } // ajouté
    public void setAddress(String address) { this.address = address; } // ajouté

    public void setEnabled(Boolean enabled) { this.enabled = enabled; }

    public String getProfileImage() { return profileImage; }
    public void setProfileImage(String profileImage) { this.profileImage = profileImage; }

    public void setGoogleAuthEnabled(Boolean googleAuthEnabled) { this.googleAuthEnabled = googleAuthEnabled; }

    public String getGoogleAuthSecret() { return googleAuthSecret; }
    public void setGoogleAuthSecret(String googleAuthSecret) { this.googleAuthSecret = googleAuthSecret; }

    public boolean isEnabled() { return enabled != null ? enabled : true; }
    public boolean isGoogleAuthEnabled() { return googleAuthEnabled != null ? googleAuthEnabled : false; }

    public String getUserType() {
        return this.getClass().getSimpleName().toUpperCase();
    }
}
