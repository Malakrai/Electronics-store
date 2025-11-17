package com.example.livraison_backend.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
public class Delivery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    private Order order;

    private String codePin;    // optionnel
    private Instant eta;       // optionnel

    @Enumerated(EnumType.STRING)
    private DeliveryStatus status = DeliveryStatus.CREATED;

    // GETTERS & SETTERS
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    public Order getOrder() {
        return order;
    }
    public void setOrder(Order order) {
        this.order = order;
    }

    public String getCodePin() {
        return codePin;
    }
    public void setCodePin(String codePin) {
        this.codePin = codePin;
    }

    public Instant getEta() {
        return eta;
    }
    public void setEta(Instant eta) {
        this.eta = eta;
    }

    public DeliveryStatus getStatus() {
        return status;
    }
    public void setStatus(DeliveryStatus status) {
        this.status = status;
    }
}
