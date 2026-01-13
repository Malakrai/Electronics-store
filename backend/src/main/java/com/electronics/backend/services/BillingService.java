package com.electronics.backend.services;

import com.electronics.backend.model.*;
import com.electronics.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class BillingService {

    private final MonthlyBillRepository monthlyBillRepository;
    private final OrderRepository orderRepository;
    private final BillItemRepository billItemRepository;
    private final CustomerRepository customerRepository;
    private final PaymentRepository paymentRepository;

    public BillingService(MonthlyBillRepository monthlyBillRepository,
                          OrderRepository orderRepository,
                          BillItemRepository billItemRepository,
                          CustomerRepository customerRepository,
                          PaymentRepository paymentRepository) {
        this.monthlyBillRepository = monthlyBillRepository;
        this.orderRepository = orderRepository;
        this.billItemRepository = billItemRepository;
        this.customerRepository = customerRepository;
        this.paymentRepository = paymentRepository;
    }

    public MonthlyBill createBillFromOrder(Long orderId) {
        try {
            System.out.println("Creating bill for order: " + orderId);

            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));

            // Vérifier si une facture existe déjà
            List<MonthlyBill> existingBills = monthlyBillRepository.findByOrderId(orderId);
            if (!existingBills.isEmpty()) {
                System.out.println("Bill already exists for order: " + orderId);
                return existingBills.get(0);
            }

            // Créer la facture
            MonthlyBill bill = new MonthlyBill();
            bill.setOrder(order);
            bill.setCustomer(order.getCustomer());
            bill.setBillDate(LocalDate.now());
            bill.setTotalAmount(order.getTotalAmount());
            bill.setTaxAmount(order.getTaxAmount());
            bill.setShippingAmount(order.getShippingAmount());
            bill.setStatus(BillStatus.PENDING);
            bill.setAmountPaid(BigDecimal.ZERO);

            // Générer un numéro de référence
            String referenceNumber = "BILL-" + System.currentTimeMillis() + "-" + orderId;
            bill.setReferenceNumber(referenceNumber);

            // Sauvegarder la facture
            MonthlyBill savedBill = monthlyBillRepository.save(bill);

            // Créer les items de facture
            createBillItemsFromOrder(order, savedBill);

            System.out.println("Bill created successfully: " + savedBill.getId());

            return savedBill;

        } catch (Exception e) {
            System.err.println("Error creating bill: " + e.getMessage());
            throw new RuntimeException("Failed to create bill: " + e.getMessage(), e);
        }
    }

    private void createBillItemsFromOrder(Order order, MonthlyBill bill) {
        for (OrderItem orderItem : order.getOrderItems()) {
            BillItem billItem = new BillItem();
            billItem.setMonthlyBill(bill);
            billItem.setOrder(order);
            billItem.setOrderItem(orderItem);
            billItem.setProduct(orderItem.getProduct());

            // CORRECTION : Utilisez setDescription() au lieu de setProductName()
            // Votre BillItem n'a pas setProductName(), mais il a setDescription()
            String productName = orderItem.getProductName() != null ?
                    orderItem.getProductName() :
                    (orderItem.getProduct() != null ? orderItem.getProduct().getName() : "Product");

            billItem.setDescription(productName + " - Qty: " + orderItem.getQuantity());
            billItem.setQuantity(orderItem.getQuantity());
            billItem.setUnitPrice(orderItem.getUnitPrice());
            billItem.setLineTotal(orderItem.getLineTotal());
            // Note: calculateLineTotal() sera appelé automatiquement par les setters

            billItemRepository.save(billItem);
            bill.getItems().add(billItem);
        }

        monthlyBillRepository.save(bill);
    }

    // MÉTHODES CORRIGÉES

    public MonthlyBill createSimpleBill(Long customerId, String description,
                                        Integer quantity, BigDecimal unitPrice) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found: " + customerId));

        MonthlyBill bill = new MonthlyBill();
        bill.setCustomer(customer);
        bill.setBillDate(LocalDate.now());
        bill.setTotalAmount(unitPrice.multiply(new BigDecimal(quantity)));
        bill.setStatus(BillStatus.PENDING);
        bill.setAmountPaid(BigDecimal.ZERO);

        String referenceNumber = "BILL-" + System.currentTimeMillis() + "-SIMPLE";
        bill.setReferenceNumber(referenceNumber);

        MonthlyBill savedBill = monthlyBillRepository.save(bill);

        // Créer un item simple
        BillItem billItem = new BillItem();
        billItem.setMonthlyBill(savedBill);
        billItem.setDescription(description);
        billItem.setQuantity(quantity);
        billItem.setUnitPrice(unitPrice);
        // calculateLineTotal() sera appelé automatiquement

        billItemRepository.save(billItem);

        return savedBill;
    }

    public MonthlyBill createTestBill(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found: " + customerId));

        MonthlyBill bill = new MonthlyBill();
        bill.setCustomer(customer);
        bill.setBillDate(LocalDate.now());
        bill.setTotalAmount(new BigDecimal("100.00"));
        bill.setStatus(BillStatus.PENDING);
        bill.setAmountPaid(BigDecimal.ZERO);

        String referenceNumber = "BILL-TEST-" + System.currentTimeMillis();
        bill.setReferenceNumber(referenceNumber);

        MonthlyBill savedBill = monthlyBillRepository.save(bill);

        // Créer un item de test
        BillItem billItem = new BillItem();
        billItem.setMonthlyBill(savedBill);
        billItem.setDescription("Test Item");
        billItem.setQuantity(1);
        billItem.setUnitPrice(new BigDecimal("100.00"));
        // calculateLineTotal() sera appelé automatiquement

        billItemRepository.save(billItem);

        return savedBill;
    }

    public List<MonthlyBill> getUnpaidBills() {
        return monthlyBillRepository.findByStatus(BillStatus.PENDING);
    }

    public MonthlyBill cancelBill(Long billId) {
        MonthlyBill bill = monthlyBillRepository.findById(billId)
                .orElseThrow(() -> new IllegalArgumentException("Bill not found: " + billId));

        bill.setStatus(BillStatus.CANCELED);
        return monthlyBillRepository.save(bill);
    }

    public Payment payBill(Long billId, BigDecimal amount, PaymentMethod method) {
        MonthlyBill bill = monthlyBillRepository.findById(billId)
                .orElseThrow(() -> new IllegalArgumentException("Bill not found: " + billId));

        BigDecimal newAmountPaid = bill.getAmountPaid().add(amount);
        bill.setAmountPaid(newAmountPaid);

        // Mettre à jour le statut si entièrement payé
        if (newAmountPaid.compareTo(bill.getTotalAmount()) >= 0) {
            bill.setStatus(BillStatus.PAID);
        }

        monthlyBillRepository.save(bill);

        // Créer le paiement selon votre modèle
        Payment payment = new Payment();
        payment.setMonthlyBill(bill);
        payment.setAmount(amount);
        payment.setPaymentMethod(method);
        payment.setPaymentDate(LocalDateTime.now());
        payment.setTransactionReference("TRX-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        payment.setTransactionStatus("SUCCESS");

        // Sauvegarder le paiement
        return paymentRepository.save(payment);
    }

    public List<MonthlyBill> getBillsForCustomer(Long customerId) {
        return monthlyBillRepository.findByCustomerId(customerId);
    }

    public MonthlyBill getBill(Long billId) {
        return monthlyBillRepository.findById(billId)
                .orElseThrow(() -> new IllegalArgumentException("Bill not found: " + billId));
    }

    public List<MonthlyBill> getAllBills() {
        return monthlyBillRepository.findAll();
    }
}
