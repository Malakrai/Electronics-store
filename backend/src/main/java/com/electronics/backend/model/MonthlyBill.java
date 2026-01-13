package com.electronics.backend.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "monthly_bills")
public class MonthlyBill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "bill_date")
    private LocalDate billDate;

    @Column(name = "total_amount", precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BillStatus status = BillStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    @OneToMany(mappedBy = "monthlyBill", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BillItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "monthlyBill", cascade = CascadeType.ALL)
    private List<Payment> payments = new ArrayList<>();

    @Column(name = "amount_paid", precision = 10, scale = 2)
    private BigDecimal amountPaid = BigDecimal.ZERO;

    @Column(name = "tax_amount", precision = 10, scale = 2)
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "shipping_amount", precision = 10, scale = 2)
    private BigDecimal shippingAmount = BigDecimal.ZERO;

    @Column(name = "reference_number", unique = true)
    private String referenceNumber;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    public MonthlyBill() {}

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDate getBillDate() { return billDate; }
    public void setBillDate(LocalDate billDate) {
        this.billDate = billDate;
        this.updatedAt = LocalDateTime.now();
    }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
        this.updatedAt = LocalDateTime.now();
    }

    public BillStatus getStatus() { return status; }
    public void setStatus(BillStatus status) {
        this.status = status;
        this.updatedAt = LocalDateTime.now();
    }

    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }

    public List<BillItem> getItems() { return items; }
    public void setItems(List<BillItem> items) { this.items = items; }

    public List<Payment> getPayments() { return payments; }
    public void setPayments(List<Payment> payments) { this.payments = payments; }

    public BigDecimal getAmountPaid() { return amountPaid; }
    public void setAmountPaid(BigDecimal amountPaid) {
        this.amountPaid = amountPaid;
        this.updatedAt = LocalDateTime.now();
    }

    public BigDecimal getTaxAmount() {
        // Si taxAmount est défini, l'utiliser, sinon calculer à partir du sous-total
        if (taxAmount != null && taxAmount.compareTo(BigDecimal.ZERO) > 0) {
            return taxAmount;
        }
        return calculateSubtotal().multiply(new BigDecimal("0.20"));
    }

    public void setTaxAmount(BigDecimal taxAmount) {
        this.taxAmount = taxAmount;
        this.updatedAt = LocalDateTime.now();
    }

    public BigDecimal getShippingAmount() {
        // Si shippingAmount est défini, l'utiliser
        // Sinon, si lié à une commande, utiliser le montant de livraison de la commande
        if (shippingAmount != null && shippingAmount.compareTo(BigDecimal.ZERO) > 0) {
            return shippingAmount;
        } else if (order != null && order.getShippingAmount() != null) {
            return order.getShippingAmount();
        }
        return BigDecimal.ZERO;
    }

    public void setShippingAmount(BigDecimal shippingAmount) {
        this.shippingAmount = shippingAmount;
        this.updatedAt = LocalDateTime.now();
    }

    public String getReferenceNumber() { return referenceNumber; }
    public void setReferenceNumber(String referenceNumber) { this.referenceNumber = referenceNumber; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    // CORRECTION: Méthode getBillItems() - alias de getItems()
    public List<BillItem> getBillItems() {
        return items; // Retourne la même liste que getItems()
    }

    // Méthodes utilitaires
    public BigDecimal getRemainingAmount() {
        if (totalAmount == null) return BigDecimal.ZERO;
        return totalAmount.subtract(amountPaid != null ? amountPaid : BigDecimal.ZERO);
    }

    public boolean isFullyPaid() {
        return status == BillStatus.PAID ||
                (totalAmount != null && amountPaid != null &&
                        amountPaid.compareTo(totalAmount) >= 0);
    }

    public boolean isOverdue() {
        if (billDate == null) return false;
        // Considérer une facture en retard si elle a plus de 30 jours et n'est pas payée
        LocalDate overdueDate = billDate.plusDays(30);
        return LocalDate.now().isAfter(overdueDate) &&
                !isFullyPaid() && status != BillStatus.CANCELED;
    }

    public BigDecimal calculateSubtotal() {
        if (items == null || items.isEmpty()) {
            return BigDecimal.ZERO;
        }
        return items.stream()
                .map(item -> item.getLineTotal() != null ? item.getLineTotal() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public void addPayment(Payment payment) {
        if (payments == null) {
            payments = new ArrayList<>();
        }
        payments.add(payment);
        payment.setMonthlyBill(this);

        // Mettre à jour le montant payé
        if (amountPaid == null) amountPaid = BigDecimal.ZERO;
        amountPaid = amountPaid.add(payment.getAmount());

        // Mettre à jour le statut si entièrement payé
        if (totalAmount != null && amountPaid.compareTo(totalAmount) >= 0) {
            status = BillStatus.PAID;
        } else if (amountPaid.compareTo(BigDecimal.ZERO) > 0) {
            // Si un paiement a été fait mais pas complet, garder PENDING
            status = BillStatus.PENDING;
        }

        this.updatedAt = LocalDateTime.now();
    }

    public void addItem(BillItem item) {
        if (items == null) {
            items = new ArrayList<>();
        }
        items.add(item);
        item.setMonthlyBill(this);

        // Recalculer le total si nécessaire
        if (item.getLineTotal() != null) {
            if (totalAmount == null) totalAmount = BigDecimal.ZERO;
            totalAmount = totalAmount.add(item.getLineTotal());
        }

        this.updatedAt = LocalDateTime.now();
    }

    public void recalculateTotals() {
        BigDecimal subtotal = calculateSubtotal();
        BigDecimal tax = taxAmount != null ? taxAmount : subtotal.multiply(new BigDecimal("0.20"));
        BigDecimal shipping = getShippingAmount();

        totalAmount = subtotal.add(tax).add(shipping);
        updatedAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();

        // Générer un numéro de référence si non fourni
        if (referenceNumber == null || referenceNumber.isEmpty()) {
            referenceNumber = "BILL-" + System.currentTimeMillis();
        }

        // Calculer les totaux si nécessaire
        if (totalAmount == null || totalAmount.compareTo(BigDecimal.ZERO) == 0) {
            recalculateTotals();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Méthode pour générer un résumé
    public String getSummary() {
        return String.format("Facture #%d - %s - %s € - %s",
                id,
                customer != null ? customer.getFullName() : "Sans client",
                totalAmount != null ? totalAmount.toPlainString() : "0.00",
                status != null ? status.name() : "INCONNU"
        );
    }
}
