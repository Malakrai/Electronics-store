package com.electronics.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "qr_codes")
public class Qr {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idQr;

    @Column(unique = true, nullable = false)
    private String email;

    private String status;

    private String secretKey;

    private LocalDateTime createdAt;

    private LocalDateTime associatedAt;

    // Getters
    public Long getIdQr() {
        return idQr;
    }

    public String getEmail() {
        return email;
    }

    public String getStatus() {
        return status;
    }

    public String getSecretKey() {
        return secretKey;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getAssociatedAt() {
        return associatedAt;
    }

    // Setters
    public void setIdQr(Long idQr) {
        this.idQr = idQr;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setSecretKey(String secretKey) {
        this.secretKey = secretKey;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setAssociatedAt(LocalDateTime associatedAt) {
        this.associatedAt = associatedAt;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = "NON_ASSOCIÉ";
        }
    }

    public void associate() {
        this.status = "ASSOCIÉ";
        this.associatedAt = LocalDateTime.now();
    }

    public boolean isAssociated() {
        return "ASSOCIÉ".equals(status);
    }
}
