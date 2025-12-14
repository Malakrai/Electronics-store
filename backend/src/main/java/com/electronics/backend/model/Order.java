package com.electronics.backend.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="order_number", unique = true, nullable = false)
    private String orderNumber;

    // Garde le mapping pour compatibilité avec le code du groupe,
    // mais on n’oblige PAS à fournir un customer
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id") // doit être nullable côté DB si panier sans login
    private Customer customer;

    // Pareil
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_location_id")
    private Location storeLocation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderType type = OrderType.ONLINE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status = OrderStatus.CONFIRMED; // ⚠️ adapte à ton enum DB

    @Column(name="total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name="tax_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name="shipping_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal shippingAmount = BigDecimal.ZERO;

    // ✅ IMPORTANT: colonne NOT NULL sans default → on la gère
    @Column(name="total_cents", nullable = false)
    private Long totalCents = 0L;

    @Column(name="customer_email")
    private String customerEmail;

    @Column(name="customer_name")
    private String customerName;

    @Column(name="created_at")
    private LocalDateTime createdAt;

    @Column(name="order_date")
    private LocalDateTime orderDate;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<OrderItem> orderItems = new HashSet<>();

    public Order() {}

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (orderDate == null) orderDate = LocalDateTime.now();

        // sécurise totalAmount / totalCents
        if (totalAmount == null) totalAmount = BigDecimal.ZERO;
        if (taxAmount == null) taxAmount = BigDecimal.ZERO;
        if (shippingAmount == null) shippingAmount = BigDecimal.ZERO;
        if (totalCents == null) totalCents = 0L;
    }

    public void addOrderItem(OrderItem item) {
        item.setOrder(this);
        this.orderItems.add(item);
    }

    // ✅ calcule totalCents depuis totalAmount
    public void computeTotalCentsFromTotalAmount() {
        if (this.totalAmount == null) {
            this.totalCents = 0L;
            return;
        }
        this.totalCents = this.totalAmount
                .movePointRight(2)
                .setScale(0, RoundingMode.HALF_UP)
                .longValue();
    }

    // GETTERS / SETTERS
    public Long getId() { return id; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }

    public Location getStoreLocation() { return storeLocation; }
    public void setStoreLocation(Location storeLocation) { this.storeLocation = storeLocation; }

    public OrderType getType() { return type; }
    public void setType(OrderType type) { this.type = type; }

    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public BigDecimal getTaxAmount() { return taxAmount; }
    public void setTaxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; }

    public BigDecimal getShippingAmount() { return shippingAmount; }
    public void setShippingAmount(BigDecimal shippingAmount) { this.shippingAmount = shippingAmount; }

    public Long getTotalCents() { return totalCents; }
    public void setTotalCents(Long totalCents) { this.totalCents = totalCents; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getOrderDate() { return orderDate; }
    public void setOrderDate(LocalDateTime orderDate) { this.orderDate = orderDate; }

    public Set<OrderItem> getOrderItems() { return orderItems; }
    public void setOrderItems(Set<OrderItem> orderItems) { this.orderItems = orderItems; }
}
