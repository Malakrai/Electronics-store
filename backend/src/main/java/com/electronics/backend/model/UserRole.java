package com.electronics.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "user_roles")
public class UserRole {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id")
    private Role role;

    // Constructeurs, Getters, Setters
    public UserRole() {}

    public UserRole(User user, Role role) {
        this.user = user;
        this.role = role;
    }
}
