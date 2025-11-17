package com.electronics.backend.model;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "locations")
public class Location {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LocationType type;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String address;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String state;

    @Column(nullable = false)
    private String zipCode;

    private String phone;
    private Boolean active = true;

    @OneToMany(mappedBy = "location", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Inventory> inventories = new HashSet<>();

    @OneToMany(mappedBy = "storeLocation", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Order> orders = new HashSet<>();

    @OneToMany(mappedBy = "location", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<InventoryReceipt> inventoryReceipts = new HashSet<>();

    // Constructeurs, Getters, Setters
    public Location() {}

    public String getFullAddress() {
        return String.format("%s, %s, %s %s", address, city, state, zipCode);
    }
}
