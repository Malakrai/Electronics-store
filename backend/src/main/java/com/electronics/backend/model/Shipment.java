package com.electronics.backend.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "shipments")
public class Shipment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(unique = true, nullable = false)
    private String trackingNumber;

    @Column(nullable = false)
    private String shippingCarrier;

    private String shippingMethod;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String shippingAddress;

    private LocalDate shipDate;
    private LocalDate estimatedDelivery;
    private LocalDate actualDelivery;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShipmentStatus status = ShipmentStatus.PENDING;

    @Column(precision = 10, scale = 2)
    private BigDecimal shippingCost;

    @OneToMany(mappedBy = "shipment", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<ShipmentItem> shipmentItems = new HashSet<>();

    // Constructeurs, Getters, Setters
    public Shipment() {}

public String getTrackingNumber() {
    return trackingNumber;
}

public String getShippingCarrier() {
    return shippingCarrier;
}

public String getShippingAddress() {
    return shippingAddress;
}

public LocalDate getShipDate() {
    return shipDate;
}

public LocalDate getEstimatedDelivery() {
    return estimatedDelivery;
}

public LocalDate getActualDelivery() {
    return actualDelivery;
}

public ShipmentStatus getStatus() {
    return status;
}



}
