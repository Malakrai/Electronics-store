package com.electronics.backend.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "product_bundles")
public class ProductBundle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal bundlePrice;

    @OneToMany(mappedBy = "bundle", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<BundleItem> bundleItems = new HashSet<>();

    @OneToMany(mappedBy = "bundle", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<OrderItem> orderItems = new HashSet<>();

    // Constructeurs, Getters, Setters
    public ProductBundle() {}

}
