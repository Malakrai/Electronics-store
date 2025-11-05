package com.electronics.backend.model;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "manufacturers")
public class Manufacturer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String contactEmail;
    private String phone;

    @Column(columnDefinition = "TEXT")
    private String address;

    public Manufacturer() {}
}
