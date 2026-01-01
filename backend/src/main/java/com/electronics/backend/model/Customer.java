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

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<PaymentMethod> paymentMethods = new HashSet<>();

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Order> orders = new HashSet<>();

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<MonthlyBill> monthlyBills = new HashSet<>();

    // Constructeurs
    public Customer() {
        super();
    }

    // Getters et Setters spécifiques à Customer
    public CustomerType getType() { return type; }
    public void setType(CustomerType type) { this.type = type; }

    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }

    public String getBillingAddress() { return billingAddress; }
    public void setBillingAddress(String billingAddress) { this.billingAddress = billingAddress; }

    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }

    public BigDecimal getCreditLimit() { return creditLimit; }
    public void setCreditLimit(BigDecimal creditLimit) { this.creditLimit = creditLimit; }

    public BigDecimal getCurrentBalance() { return currentBalance; }
    public void setCurrentBalance(BigDecimal currentBalance) { this.currentBalance = currentBalance; }

    public Set<PaymentMethod> getPaymentMethods() { return paymentMethods; }
    public void setPaymentMethods(Set<PaymentMethod> paymentMethods) { this.paymentMethods = paymentMethods; }

    public Set<Order> getOrders() { return orders; }
    public void setOrders(Set<Order> orders) { this.orders = orders; }

    public Set<MonthlyBill> getMonthlyBills() { return monthlyBills; }
    public void setMonthlyBills(Set<MonthlyBill> monthlyBills) { this.monthlyBills = monthlyBills; }

    public BigDecimal calculateBalance() {
        return currentBalance;
    }
}
