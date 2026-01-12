package com.electronics.backend.controller;

import com.electronics.backend.model.MonthlyBill;
import com.electronics.backend.services.OrderService;
import com.electronics.backend.services.BillingService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/checkout")
@CrossOrigin(origins = "*")
public class CheckoutController {

    private final OrderService orderService;
    private final BillingService billingService;

    public CheckoutController(OrderService orderService, BillingService billingService) {
        this.orderService = orderService;
        this.billingService = billingService;
    }

    @PostMapping("/{orderId}/init")
    public MonthlyBill init(@PathVariable Long orderId) {
        // Cette méthode crée ou récupère la facture pour une commande
        return billingService.createBillFromOrder(orderId);
    }
}
