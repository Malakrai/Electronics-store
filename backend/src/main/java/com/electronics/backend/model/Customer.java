package com.electronics.backend.model;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String firstName;
    private String lastName;
    private String email;

    @ElementCollection(targetClass = PaymentMethod.class)
    @CollectionTable(
            name = "customer_payment_methods",
            joinColumns = @JoinColumn(name = "customer_id")
    )
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method")
    private Set<PaymentMethod> paymentMethods = new HashSet<>();

    public Customer() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Set<PaymentMethod> getPaymentMethods() { return paymentMethods; }
    public void setPaymentMethods(Set<PaymentMethod> paymentMethods) { this.paymentMethods = paymentMethods; }
}
