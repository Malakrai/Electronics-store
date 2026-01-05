package com.electronics.backend.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@DiscriminatorValue("CUSTOMER")
@Table(name = "users") // Même table que User
public class Customer extends User {

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CustomerType type = CustomerType.INDIVIDUAL;

    @Column(unique = true)
    private String accountNumber;

    @Column(columnDefinition = "TEXT")
    private String billingAddress;

    @Column(columnDefinition = "TEXT")
    private String shippingAddress;

    private BigDecimal creditLimit;
    private BigDecimal currentBalance = BigDecimal.ZERO;

    @ElementCollection(targetClass = PaymentMethod.class)
    @Enumerated(EnumType.STRING) // stocke les valeurs comme "CASH", "CARD", "TRANSFER"
    @CollectionTable(
            name = "customer_payment_methods",
            joinColumns = @JoinColumn(name = "customer_id")
    )
    @Column(name = "payment_method")
    private Set<PaymentMethod> paymentMethods = new HashSet<>();

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Order> orders = new HashSet<>();

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<MonthlyBill> monthlyBills = new HashSet<>();

    // Constructeurs
    public Customer() {
        super();
    }

}
