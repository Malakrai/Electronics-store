package com.electronics.backend.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "po_items")
public class POItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "po_id", nullable = false)
    private PurchaseOrder purchaseOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal unitCost;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal lineTotal;

    private Integer receivedQuantity = 0;

    @OneToMany(mappedBy = "poItem", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<ReceiptItem> receiptItems = new HashSet<>();


    public POItem() {}

    public Integer getPendingQuantity() {
        return quantity - receivedQuantity;
    }
}
