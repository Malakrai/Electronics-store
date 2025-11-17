package com.electronics.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory")
public class Inventory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id", nullable = false)
    private Location location;

    @Column(nullable = false)
    private Integer quantity = 0;

    private Integer minStockLevel = 5;
    private Integer maxStockLevel;
    private LocalDateTime lastUpdated = LocalDateTime.now();

    // Constructeurs, Getters, Setters
    public Inventory() {}

    public Boolean needsRestock() {
        return quantity <= minStockLevel;
    }

    public Boolean isOutOfStock() {
        return quantity <= 0;
    }
}
