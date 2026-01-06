package com.electronics.backend.service;

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

    public BillingService(MonthlyBillRepository monthlyBillRepository,
                          BillItemRepository billItemRepository,
                          PaymentRepository paymentRepository,
                          CustomerRepository customerRepository) {
        this.monthlyBillRepository = monthlyBillRepository;
        this.billItemRepository = billItemRepository;
        this.paymentRepository = paymentRepository;
        this.customerRepository = customerRepository;
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
        bill.setStatus(BillStatus.PENDING);
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

    /**
     * ✅ Crée une facture de test PENDING avec 1 item.
     * Utilisé par POST /api/bills/test
     */
    @Transactional
    public MonthlyBill createTestBill(Long customerId) {
        // tu peux changer le produit/description comme tu veux
        return createSimpleBill(customerId, "Produit test", 1, new BigDecimal("200.00"));
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

    public List<MonthlyBill> getUnpaidBills() {
        return monthlyBillRepository.findAll()
                .stream()
                .filter(b -> b.getStatus() != BillStatus.PAID)
                .toList();
    }

    @Transactional
    public MonthlyBill cancelBill(Long billId) {
        MonthlyBill bill = getBill(billId);

        // ⚠️ Mets le bon enum selon ton BillStatus :
        // Si ton enum = CANCELED -> garde CANCELED
        // Si ton enum = CANCELLED -> remplace par CANCELLED
        bill.setStatus(BillStatus.CANCELED);

        return monthlyBillRepository.save(bill);
    }

    @Transactional
    public Payment payBill(Long billId, BigDecimal amount, PaymentMethod method) {
        MonthlyBill bill = getBill(billId);

        Payment payment = new Payment();
        payment.setAmount(amount);
        payment.setPaymentDate(LocalDateTime.now());
        payment.setPaymentMethod(method);
        payment.setMonthlyBill(bill);
        paymentRepository.save(payment);

        BigDecimal totalPaid = paymentRepository.findByMonthlyBillId(billId).stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (bill.getTotalAmount() != null && totalPaid.compareTo(bill.getTotalAmount()) >= 0) {
            bill.setStatus(BillStatus.PAID);
            monthlyBillRepository.save(bill);
        }

        return payment;
    }
}
