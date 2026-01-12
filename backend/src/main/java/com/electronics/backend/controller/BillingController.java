package com.electronics.backend.controller;

import com.electronics.backend.model.MonthlyBill;
import com.electronics.backend.model.Payment;
import com.electronics.backend.model.PaymentMethod;
<<<<<<< HEAD
import com.electronics.backend.services.BillingService;
=======
import com.electronics.backend.service.BillingService;
import com.electronics.backend.service.InvoicePdfService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
>>>>>>> origin/ayoub
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/bills")
@CrossOrigin(origins = "*")
public class BillingController {

    private final BillingService billingService;
    private final InvoicePdfService invoicePdfService;

    public BillingController(BillingService billingService, InvoicePdfService invoicePdfService) {
        this.billingService = billingService;
        this.invoicePdfService = invoicePdfService;
    }


    @PostMapping("/from-order/{orderId}")
    public MonthlyBill createBillFromOrder(@PathVariable Long orderId) {
        return billingService.createBillFromOrder(orderId);
    }

    // ✅ POST /api/bills/test (création facture PENDING)
    @PostMapping("/test-bill")
    public MonthlyBill createTestBill() {
        // ⚠️ mets un customerId qui existe vraiment en base
        Long customerId = 1L;
        return billingService.createTestBill(customerId);
    }

    // GET /api/bills
    @GetMapping
    public List<MonthlyBill> getAllBills() {
        return billingService.getAllBills();
    }

<<<<<<< HEAD
    // GET /api/bills/unpaid
    @GetMapping("/unpaid")
    public List<MonthlyBill> getUnpaidBills() {
        return billingService.getUnpaidBills();
    }

    // GET /api/bills/1
=======
    // GET /api/bills/{billId}
>>>>>>> origin/ayoub
    @GetMapping("/{billId}")
    public MonthlyBill getBill(@PathVariable Long billId) {
        return billingService.getBill(billId);
    }

<<<<<<< HEAD
    @PostMapping("/{billId}/cancel")
    public MonthlyBill cancelBill(@PathVariable Long billId) {
        return billingService.cancelBill(billId);
=======
    // GET /api/bills/unpaid
    @GetMapping("/unpaid")
    public List<MonthlyBill> getUnpaidBills() {
        return billingService.getUnpaidBills();
    }

    // POST /api/bills/{billId}/cancel
    @PostMapping("/{billId}/cancel")
    public MonthlyBill cancelBill(@PathVariable Long billId) {
        return billingService.cancelBill(billId);
    }

    // GET /api/bills/customer/{customerId}
    @GetMapping("/customer/{customerId}")
    public List<MonthlyBill> getBillsForCustomer(@PathVariable Long customerId) {
        return billingService.getBillsForCustomer(customerId);
>>>>>>> origin/ayoub
    }

    // ✅ POST /api/bills/{billId}/pay?amount=200&method=CARD
    @PostMapping("/{billId}/pay")
    public Payment payBill(@PathVariable Long billId,
                           @RequestParam BigDecimal amount,
                           @RequestParam PaymentMethod method) {
        return billingService.payBill(billId, amount, method);
    }

<<<<<<< HEAD
    @PostMapping
    public MonthlyBill createSimpleBill(@RequestParam Long customerId,
                                        @RequestParam String description,
                                        @RequestParam Integer quantity,
                                        @RequestParam BigDecimal unitPrice) {
        return billingService.createSimpleBill(customerId, description, quantity, unitPrice);
    }


    @GetMapping("/customer/{customerId}")
    public List<MonthlyBill> getBillsForCustomer(@PathVariable Long customerId) {
        return billingService.getBillsForCustomer(customerId);
=======
    // ✅ GET /api/bills/{id}/pdf
    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> billPdf(@PathVariable Long id) {
        byte[] pdf = invoicePdfService.generate(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "application/pdf")
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=invoice-" + id + ".pdf")
                .body(pdf);
>>>>>>> origin/ayoub
    }
}
