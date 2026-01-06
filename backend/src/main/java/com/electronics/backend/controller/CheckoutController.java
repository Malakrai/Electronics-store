package com.electronics.backend.controller;

import com.electronics.backend.model.MonthlyBill;
import com.electronics.backend.service.CheckoutService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/checkout")
@CrossOrigin(origins = "*")
public class CheckoutController {

    private final CheckoutService checkoutService;

    public CheckoutController(CheckoutService checkoutService) {
        this.checkoutService = checkoutService;
    }

    // ✅ crée/retourne une facture PENDING pour une commande
    @PostMapping("/{orderId}/init")
    public MonthlyBill init(@PathVariable Long orderId) {
        return checkoutService.initCheckout(orderId);
    }
}
