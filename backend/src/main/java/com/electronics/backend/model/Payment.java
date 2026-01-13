package com.electronics.backend.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private LocalDateTime paymentDate = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod paymentMethod;

    @Column(name = "transaction_reference")
    private String transactionReference;

    @Column(name = "transaction_status")
    private String transactionStatus; // AJOUTER CE CHAMP

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "monthly_bill_id", nullable = false)
    private MonthlyBill monthlyBill;

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public LocalDateTime getPaymentDate() { return paymentDate; }
    public void setPaymentDate(LocalDateTime paymentDate) { this.paymentDate = paymentDate; }

    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getTransactionReference() { return transactionReference; }
    public void setTransactionReference(String transactionReference) { this.transactionReference = transactionReference; }

    public String getTransactionStatus() { return transactionStatus; } // AJOUTER
    public void setTransactionStatus(String transactionStatus) { this.transactionStatus = transactionStatus; } // AJOUTER

    public MonthlyBill getMonthlyBill() { return monthlyBill; }
    public void setMonthlyBill(MonthlyBill monthlyBill) { this.monthlyBill = monthlyBill; }
}
