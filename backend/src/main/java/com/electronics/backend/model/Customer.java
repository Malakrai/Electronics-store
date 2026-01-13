package com.electronics.backend.model;

import com.fasterxml.jackson.annotation.*;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

@Entity
@DiscriminatorValue("CUSTOMER")
@Table(name = "users")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@JsonTypeName("customer")
public class Customer extends User {

    public enum CustomerType {
        INDIVIDUAL("Particulier"),
        BUSINESS("Entreprise"),
        WHOLESALER("Grossiste");

        private final String label;
        CustomerType(String label) { this.label = label; }
        public String getLabel() { return label; }
    }

    @Enumerated(EnumType.STRING)
    @Column(name = "customer_type")
    private CustomerType type = CustomerType.INDIVIDUAL;

    @Column(name = "company_name")
    private String companyName;

    @Column(name = "tax_id")
    private String taxId;

    @Column(name = "account_number", unique = true)
    private String accountNumber;

    @Column(name = "billing_address", columnDefinition = "TEXT")
    private String billingAddress;

    @Column(name = "shipping_address", columnDefinition = "TEXT")
    private String shippingAddress;

    @Column(name = "city")
    private String city;

    @Column(name = "country")
    private String country = "France";

    @Column(name = "postal_code")
    private String postalCode;

    @Column(name = "credit_limit", precision = 10, scale = 2)
    private BigDecimal creditLimit;

    @Column(name = "current_balance", precision = 10, scale = 2)
    private BigDecimal currentBalance = BigDecimal.ZERO;

    @Column(name = "is_guest")
    private Boolean isGuest = false;

    @ElementCollection(targetClass = PaymentMethod.class)
    @Enumerated(EnumType.STRING)
    @CollectionTable(
            name = "customer_payment_methods",
            joinColumns = @JoinColumn(name = "customer_id")
    )
    @Column(name = "payment_method")
    private Set<PaymentMethod> paymentMethods = new HashSet<>();

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore // Ignorer complètement les relations pour éviter les cycles
    private Set<Order> orders = new HashSet<>();

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore // Ignorer complètement les relations pour éviter les cycles
    private Set<MonthlyBill> monthlyBills = new HashSet<>();

    public Customer() {
        super();
    }

    public Customer(String email, String password, String firstName, String lastName) {
        this();
        this.setEmail(email);
        this.setPassword(password);
        this.setFirstName(firstName);
        this.setLastName(lastName);
    }

    // Getters et Setters
    public CustomerType getType() { return type; }
    public void setType(CustomerType type) { this.type = type; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getTaxId() { return taxId; }
    public void setTaxId(String taxId) { this.taxId = taxId; }

    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }

    public String getBillingAddress() { return billingAddress; }
    public void setBillingAddress(String billingAddress) { this.billingAddress = billingAddress; }

    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getPostalCode() { return postalCode; }
    public void setPostalCode(String postalCode) { this.postalCode = postalCode; }

    public BigDecimal getCreditLimit() { return creditLimit; }
    public void setCreditLimit(BigDecimal creditLimit) { this.creditLimit = creditLimit; }

    public BigDecimal getCurrentBalance() { return currentBalance; }
    public void setCurrentBalance(BigDecimal currentBalance) { this.currentBalance = currentBalance; }

    public Boolean getIsGuest() { return isGuest; }
    public void setIsGuest(Boolean isGuest) { this.isGuest = isGuest; }

    public Set<PaymentMethod> getPaymentMethods() { return paymentMethods; }
    public void setPaymentMethods(Set<PaymentMethod> paymentMethods) { this.paymentMethods = paymentMethods; }

    @JsonIgnore
    public Set<Order> getOrders() { return orders; }
    public void setOrders(Set<Order> orders) { this.orders = orders; }

    @JsonIgnore
    public Set<MonthlyBill> getMonthlyBills() { return monthlyBills; }
    public void setMonthlyBills(Set<MonthlyBill> monthlyBills) { this.monthlyBills = monthlyBills; }

    // Méthodes utilitaires
    @JsonIgnore
    public String getFullAddress() {
        StringBuilder sb = new StringBuilder();
        if (shippingAddress != null && !shippingAddress.trim().isEmpty()) {
            sb.append(shippingAddress);
        }
        if (city != null && !city.trim().isEmpty()) {
            if (sb.length() > 0) sb.append("\n");
            sb.append(city);
        }
        if (postalCode != null && !postalCode.trim().isEmpty()) {
            if (sb.length() > 0) sb.append(" ");
            sb.append(postalCode);
        }
        if (country != null && !country.trim().isEmpty()) {
            if (sb.length() > 0) sb.append("\n");
            sb.append(country);
        }
        return sb.toString();
    }

    @JsonGetter("displayName")
    public String getDisplayName() {
        if (type == CustomerType.BUSINESS && companyName != null && !companyName.trim().isEmpty()) {
            return companyName;
        }
        return getFullName();
    }


    @JsonGetter("fullName")
    public String getFullName() {
        return (getFirstName() != null ? getFirstName() + " " : "") +
                (getLastName() != null ? getLastName() : "");
    }

    // Méthode pour obtenir un résumé simple
    @JsonGetter("summary")
    public String getSummary() {
        return String.format("%s (%s) - %s",
                getDisplayName(),
                getEmail(),
                type != null ? type.getLabel() : "Non défini"
        );
    }

    // Méthode pour vérifier si le client a dépassé sa limite de crédit
    @JsonIgnore
    public boolean isOverCreditLimit() {
        if (creditLimit == null || currentBalance == null) {
            return false;
        }
        return currentBalance.compareTo(creditLimit) > 0;
    }

    // Méthode pour calculer le crédit restant
    @JsonGetter("availableCredit")
    public BigDecimal getAvailableCredit() {
        if (creditLimit == null) {
            return BigDecimal.ZERO;
        }
        if (currentBalance == null) {
            return creditLimit;
        }
        return creditLimit.subtract(currentBalance);
    }

    // Ajouter un paiement
    public void addPaymentMethod(PaymentMethod method) {
        if (paymentMethods == null) {
            paymentMethods = new HashSet<>();
        }
        paymentMethods.add(method);
    }

    // Supprimer un paiement
    public void removePaymentMethod(PaymentMethod method) {
        if (paymentMethods != null) {
            paymentMethods.remove(method);
        }
    }

    // Méthode pour mettre à jour le solde
    public void updateBalance(BigDecimal amount) {
        if (currentBalance == null) {
            currentBalance = BigDecimal.ZERO;
        }
        currentBalance = currentBalance.add(amount);
    }

    @Override
    public String toString() {
        return "Customer{" +
                "id=" + getId() +
                ", email='" + getEmail() + '\'' +
                ", fullName='" + getFullName() + '\'' +
                ", type=" + type +
                ", companyName='" + companyName + '\'' +
                ", currentBalance=" + currentBalance +
                '}';
    }
}
