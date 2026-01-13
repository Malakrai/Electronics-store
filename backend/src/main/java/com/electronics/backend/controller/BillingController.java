package com.electronics.backend.controller;

import com.electronics.backend.model.MonthlyBill;
import com.electronics.backend.model.Payment;
import com.electronics.backend.model.PaymentMethod;
import com.electronics.backend.repository.MonthlyBillRepository;
import com.electronics.backend.services.BillingService;
import com.electronics.backend.services.InvoicePdfService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bills")
@CrossOrigin(origins = "*")
public class BillingController {

    private final BillingService billingService;
    private final InvoicePdfService invoicePdfService;
    private final MonthlyBillRepository monthlyBillRepository;

    public BillingController(BillingService billingService,
                             InvoicePdfService invoicePdfService,
                             MonthlyBillRepository monthlyBillRepository) {
        this.billingService = billingService;
        this.invoicePdfService = invoicePdfService;
        this.monthlyBillRepository = monthlyBillRepository;
    }

    // Endpoint simplifié pour éviter les problèmes Hibernate
    @GetMapping("/simple")
    public ResponseEntity<List<Map<String, Object>>> getSimpleBills() {
        try {
            List<MonthlyBill> bills = monthlyBillRepository.findAll();

            List<Map<String, Object>> response = bills.stream()
                    .limit(10) // Limitez pour éviter les problèmes
                    .map(bill -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("id", bill.getId());
                        map.put("referenceNumber", bill.getReferenceNumber());
                        map.put("totalAmount", bill.getTotalAmount());
                        map.put("status", bill.getStatus().toString());
                        map.put("amountPaid", bill.getAmountPaid());
                        map.put("billDate", bill.getBillDate());
                        map.put("taxAmount", bill.getTaxAmount());
                        map.put("shippingAmount", bill.getShippingAmount());

                        // Customer simple (évitez les relations complexes)
                        if (bill.getCustomer() != null) {
                            Map<String, Object> customer = new HashMap<>();
                            customer.put("id", bill.getCustomer().getId());
                            customer.put("firstName", bill.getCustomer().getFirstName());
                            customer.put("lastName", bill.getCustomer().getLastName());
                            customer.put("email", bill.getCustomer().getEmail());
                            customer.put("phone", bill.getCustomer().getPhone());
                            map.put("customer", customer);
                        }

                        // Order simple
                        if (bill.getOrder() != null) {
                            Map<String, Object> order = new HashMap<>();
                            order.put("id", bill.getOrder().getId());
                            order.put("orderNumber", bill.getOrder().getOrderNumber());
                            order.put("totalAmount", bill.getOrder().getTotalAmount());
                            order.put("status", bill.getOrder().getStatus().toString());
                            map.put("order", order);
                        }

                        // Items simples
                        if (bill.getItems() != null && !bill.getItems().isEmpty()) {
                            List<Map<String, Object>> items = bill.getItems().stream()
                                    .limit(5)
                                    .map(item -> {
                                        Map<String, Object> itemMap = new HashMap<>();
                                        itemMap.put("id", item.getId());
                                        itemMap.put("description", item.getDescription());
                                        itemMap.put("quantity", item.getQuantity());
                                        itemMap.put("unitPrice", item.getUnitPrice());
                                        itemMap.put("lineTotal", item.getLineTotal());
                                        return itemMap;
                                    })
                                    .collect(Collectors.toList());
                            map.put("items", items);
                        }

                        return map;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.OK)
                    .body(List.of()); // Retourne liste vide en cas d'erreur
        }
    }


    @GetMapping("/order/{orderId}")
    public ResponseEntity<?> getBillsByOrder(@PathVariable Long orderId) {
        try {
            System.out.println("Getting bills for order: " + orderId);

            // Utilisez la méthode du repository que vous avez déjà
            List<MonthlyBill> bills = monthlyBillRepository.findByOrderId(orderId);

            if (bills.isEmpty()) {
                System.out.println("No bills found for order: " + orderId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of(
                                "error", "No bills found for order: " + orderId,
                                "orderId", orderId
                        ));
            }

            System.out.println("Found " + bills.size() + " bills for order: " + orderId);

            // Pour éviter les problèmes de sérialisation, créez une réponse simple
            List<Map<String, Object>> response = bills.stream()
                    .map(bill -> {
                        Map<String, Object> billMap = new HashMap<>();
                        billMap.put("id", bill.getId());
                        billMap.put("referenceNumber", bill.getReferenceNumber());
                        billMap.put("totalAmount", bill.getTotalAmount());
                        billMap.put("status", bill.getStatus().toString());
                        billMap.put("amountPaid", bill.getAmountPaid());
                        billMap.put("billDate", bill.getBillDate());

                        // Info client basique
                        if (bill.getCustomer() != null) {
                            Map<String, Object> customer = new HashMap<>();
                            customer.put("id", bill.getCustomer().getId());
                            customer.put("firstName", bill.getCustomer().getFirstName());
                            customer.put("lastName", bill.getCustomer().getLastName());
                            customer.put("email", bill.getCustomer().getEmail());
                            billMap.put("customer", customer);
                        }

                        // Info commande
                        if (bill.getOrder() != null) {
                            Map<String, Object> order = new HashMap<>();
                            order.put("id", bill.getOrder().getId());
                            order.put("orderNumber", bill.getOrder().getOrderNumber());
                            order.put("totalAmount", bill.getOrder().getTotalAmount());
                            billMap.put("order", order);
                        }

                        return billMap;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Error getting bills for order " + orderId + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "error", "Failed to get bills for order: " + e.getMessage(),
                            "orderId", orderId
                    ));
        }
    }

    @PostMapping
    public MonthlyBill createSimpleBill(@RequestParam Long customerId,
                                        @RequestParam String description,
                                        @RequestParam Integer quantity,
                                        @RequestParam BigDecimal unitPrice) {
        return billingService.createSimpleBill(customerId, description, quantity, unitPrice);
    }

    @PostMapping("/test")
    public MonthlyBill createTestBill(@RequestParam Long customerId) {
        return billingService.createTestBill(customerId);
    }

    @GetMapping
    public List<MonthlyBill> getAllBills() {
        return billingService.getAllBills();
    }

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

    @GetMapping("/customer/{customerId}")
    public List<MonthlyBill> getBillsForCustomer(@PathVariable Long customerId) {
        return billingService.getBillsForCustomer(customerId);
    }

    @PostMapping("/{billId}/pay")
    public Payment payBill(@PathVariable Long billId,
                           @RequestParam BigDecimal amount,
                           @RequestParam PaymentMethod method) {
        return billingService.payBill(billId, amount, method);
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> billPdf(@PathVariable Long id) {
        byte[] pdf = invoicePdfService.generate(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "application/pdf")
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=invoice-" + id + ".pdf")
                .body(pdf);
    }
}
