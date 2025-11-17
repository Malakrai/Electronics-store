package com.electronics.backend.model;

import com.electronics.backend.model.Location;
import com.electronics.backend.model.PurchaseOrder;
import com.electronics.backend.model.ReceiptItem;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "inventory_receipts")
public class InventoryReceipt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "po_id")
    private PurchaseOrder purchaseOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id", nullable = false)
    private Location location;

    private LocalDateTime receiptDate = LocalDateTime.now();
    private String receivedBy;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @OneToMany(mappedBy = "receipt", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<ReceiptItem> receiptItems = new HashSet<>();

    // Constructeurs, Getters, Setters
    public InventoryReceipt() {}
}
