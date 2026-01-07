package com.electronics.backend.services;

import com.electronics.backend.model.*;
import com.electronics.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class BillingService {

    private final MonthlyBillRepository monthlyBillRepository;
    private final BillItemRepository billItemRepository;
    private final PaymentRepository paymentRepository;
    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository; // AJOUTÉ

    public BillingService(MonthlyBillRepository monthlyBillRepository,
                          BillItemRepository billItemRepository,
                          PaymentRepository paymentRepository,
                          CustomerRepository customerRepository,
                          OrderRepository orderRepository) { // AJOUTÉ
        this.monthlyBillRepository = monthlyBillRepository;
        this.billItemRepository = billItemRepository;
        this.paymentRepository = paymentRepository;
        this.customerRepository = customerRepository;
        this.orderRepository = orderRepository; // AJOUTÉ
    }

    // MÉTHODE CRITIQUE : Créer une facture depuis une commande
    @Transactional
    public MonthlyBill createBillFromOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));

        // Vérifier si une facture existe déjà pour cette commande
        MonthlyBill existingBill = monthlyBillRepository.findByOrderId(orderId);
        if (existingBill != null) {
            return existingBill;
        }

        // Créer la facture
        MonthlyBill bill = new MonthlyBill();
        bill.setCustomer(order.getCustomer());
        bill.setOrder(order);
        bill.setBillDate(LocalDate.now());
        bill.setStatus(BillStatus.UNPAID); // CHANGÉ de PENDING à UNPAID
        bill.setTotalAmount(order.getTotalAmount());

        monthlyBillRepository.save(bill);

        // Créer les lignes de facture à partir des lignes de commande
        for (OrderItem orderItem : order.getOrderItems()) {
            BillItem billItem = new BillItem();
            billItem.setDescription(orderItem.getProductName());
            billItem.setQuantity(orderItem.getQuantity());
            billItem.setUnitPrice(orderItem.getUnitPrice());
            billItem.setLineTotal(orderItem.getLineTotal());
            billItem.setMonthlyBill(bill);
            billItemRepository.save(billItem);
        }

        return bill;
    }

    @Transactional
    public MonthlyBill createSimpleBill(Long customerId,
                                        String description,
                                        Integer quantity,
                                        BigDecimal unitPrice) {

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found : " + customerId));

        MonthlyBill bill = new MonthlyBill();
        bill.setCustomer(customer);
        bill.setBillDate(LocalDate.now());
        bill.setStatus(BillStatus.UNPAID); // CHANGÉ ICI
        bill.setTotalAmount(BigDecimal.ZERO);
        monthlyBillRepository.save(bill);

        BillItem item = new BillItem();
        item.setDescription(description);
        item.setQuantity(quantity);
        item.setUnitPrice(unitPrice);
        BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(quantity));
        item.setLineTotal(lineTotal);
        item.setMonthlyBill(bill);
        billItemRepository.save(item);

        bill.setTotalAmount(lineTotal);
        monthlyBillRepository.save(bill);

        return bill;
    }

    public List<MonthlyBill> getUnpaidBills() {
        return monthlyBillRepository.findAll()
                .stream()
                .filter(b -> b.getStatus() == BillStatus.UNPAID) // CHANGÉ ICI
                .toList();
    }

    public MonthlyBill cancelBill(Long billId) {
        MonthlyBill bill = getBill(billId);
        bill.setStatus(BillStatus.CANCELLED); // CHANGÉ de CANCELED à CANCELLED
        return monthlyBillRepository.save(bill);
    }

    public MonthlyBill getBill(Long billId) {
        return monthlyBillRepository.findById(billId)
                .orElseThrow(() -> new IllegalArgumentException("Bill not found : " + billId));
    }

    public List<MonthlyBill> getAllBills() {
        return monthlyBillRepository.findAll();
    }

    public List<MonthlyBill> getBillsForCustomer(Long customerId) {
        return monthlyBillRepository.findByCustomerId(customerId);
    }

    @Transactional
    public Payment payBill(Long billId, BigDecimal amount, PaymentMethod method) {
        MonthlyBill bill = getBill(billId);

        // Vérifier si la facture est déjà payée
        if (bill.getStatus() == BillStatus.PAID) {
            throw new IllegalArgumentException("Bill is already paid");
        }

        // Vérifier si la facture est annulée
        if (bill.getStatus() == BillStatus.CANCELLED) {
            throw new IllegalArgumentException("Bill is cancelled");
        }

        Payment payment = new Payment();
        payment.setAmount(amount);
        payment.setPaymentDate(LocalDateTime.now());
        payment.setPaymentMethod(method);
        payment.setMonthlyBill(bill);
        paymentRepository.save(payment);

        BigDecimal totalPaid = paymentRepository.findByMonthlyBillId(billId).stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (bill.getTotalAmount() != null
                && totalPaid.compareTo(bill.getTotalAmount()) >= 0) {
            bill.setStatus(BillStatus.PAID);
            monthlyBillRepository.save(bill);
        } else {
            // Si paiement partiel, on pourrait mettre à jour un statut PARTIAL
            bill.setStatus(BillStatus.UNPAID); // Reste impayé si paiement partiel
            monthlyBillRepository.save(bill);
        }

        return payment;
    }
}
