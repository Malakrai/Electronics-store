package com.electronics.backend.controller;

import com.electronics.backend.model.MonthlyBill;
import com.electronics.backend.model.Payment;
import com.electronics.backend.model.PaymentMethod;
import com.electronics.backend.services.BillingService;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/bills")
@CrossOrigin(origins = "*")
public class BillingController {

    private final BillingService billingService;

    public BillingController(BillingService billingService) {
        this.billingService = billingService;
    }

    // POST /api/bills?customerId=1&description=Test&quantity=2&unitPrice=100
    @PostMapping
    public MonthlyBill createSimpleBill(@RequestParam Long customerId,
                                        @RequestParam String description,
                                        @RequestParam Integer quantity,
                                        @RequestParam BigDecimal unitPrice) {
        return billingService.createSimpleBill(customerId, description, quantity, unitPrice);
    }

    // GET /api/bills
    @GetMapping
    public List<MonthlyBill> getAllBills() {
        return billingService.getAllBills();
    }

    // GET /api/bills/1
    @GetMapping("/{billId}")
    public MonthlyBill getBill(@PathVariable Long billId) {
        return billingService.getBill(billId);
    }
    @GetMapping("/unpaid")
public List<MonthlyBill> getUnpaidBills() {
    return billingService.getUnpaidBills();
}
@PostMapping("/{billId}/cancel")
public MonthlyBill cancelBill(@PathVariable Long billId) {
    return billingService.cancelBill(billId);
}
    // ================== MÉTHODES DE TEST EN GET ==================

    // GET /api/bills/create?customerId=1&description=Test&quantity=2&unitPrice=100
    @GetMapping("/create")
    public MonthlyBill createSimpleBillGet(@RequestParam Long customerId,
                                           @RequestParam String description,
                                           @RequestParam Integer quantity,
                                           @RequestParam BigDecimal unitPrice) {
        return billingService.createSimpleBill(customerId, description, quantity, unitPrice);
    }

    // GET /api/bills/{billId}/pay-test?amount=200&method=CARD
    @GetMapping("/{billId}/pay-test")
    public Payment payBillGet(@PathVariable Long billId,
                              @RequestParam BigDecimal amount,
                              @RequestParam PaymentMethod method) {
        return billingService.payBill(billId, amount, method);
    }



    // GET /api/bills/customer/1
    @GetMapping("/customer/{customerId}")
    public List<MonthlyBill> getBillsForCustomer(@PathVariable Long customerId) {
        return billingService.getBillsForCustomer(customerId);
    }

    // POST /api/bills/1/pay?amount=200&method=CARD
    @PostMapping("/{billId}/pay")
    public Payment payBill(@PathVariable Long billId,
                           @RequestParam BigDecimal amount,
                           @RequestParam PaymentMethod method) {
        return billingService.payBill(billId, amount, method);
    }
}
