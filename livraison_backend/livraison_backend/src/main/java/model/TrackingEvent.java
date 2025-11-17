package com.example.livraison_backend.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
public class TrackingEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private Delivery delivery;

    @Enumerated(EnumType.STRING)
    private DeliveryStatus status;

    private String message;
    private Instant createdAt = Instant.now();
    private Double lat;
    private Double lng;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Delivery getDelivery() { return delivery; }
    public void setDelivery(Delivery delivery) { this.delivery = delivery; }

    public DeliveryStatus getStatus() { return status; }
    public void setStatus(DeliveryStatus status) { this.status = status; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Double getLat() { return lat; }
    public void setLat(Double lat) { this.lat = lat; }

    public Double getLng() { return lng; }
    public void setLng(Double lng) { this.lng = lng; }
}
