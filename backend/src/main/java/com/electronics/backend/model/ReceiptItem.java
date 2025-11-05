package com.electronics.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "receipt_items")
public class ReceiptItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receipt_id", nullable = false)
    private InventoryReceipt receipt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "po_item_id", nullable = false)
    private POItem poItem;

    @Column(nullable = false)
    private Integer quantityReceived;

    // Constructeurs, Getters, Setters
    public ReceiptItem() {}
}
