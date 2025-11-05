package com.electronics.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "bundle_items")
public class BundleItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bundle_id")
    private ProductBundle bundle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(nullable = false)
    private Integer quantity = 1;

    // Constructeurs, Getters, Setters
    public BundleItem() {}

    public BundleItem(ProductBundle bundle, Product product, Integer quantity) {
        this.bundle = bundle;
        this.product = product;
        this.quantity = quantity;
    }
}
