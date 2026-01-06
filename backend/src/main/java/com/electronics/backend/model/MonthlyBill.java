package com.electronics.backend.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
public class MonthlyBill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate billDate;

    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    private BillStatus status;

    @ManyToOne
    private Customer customer;

    @OneToMany(mappedBy = "monthlyBill", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BillItem> items = new ArrayList<>();

    public MonthlyBill() {}

    // Getters / Setters

    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public LocalDate getBillDate() { return billDate; }

    public void setBillDate(LocalDate billDate) { this.billDate = billDate; }

    public BigDecimal getTotalAmount() { return totalAmount; }

    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public BillStatus getStatus() { return status; }

    public void setStatus(BillStatus status) { this.status = status; }

    public Customer getCustomer() { return customer; }

    public void setCustomer(Customer customer) { this.customer = customer; }

    public List<BillItem> getItems() { return items; }

    public void setItems(List<BillItem> items) { this.items = items; }

    public void addItem(BillItem item) {
        items.add(item);
        item.setMonthlyBill(this);
    }
    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    @Column(name = "order_id")
private Long orderId;

}
