package com.electronics.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "payment_methods")
public class PaymentMethod {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    private String cardType;
    private String encryptedCardNumber;
    private LocalDate expirationDate;

    @Column(columnDefinition = "TEXT")
    private String billingAddress;

    private Boolean isDefault = false;

    // Constructeurs, Getters, Setters
    public PaymentMethod() {}


}
