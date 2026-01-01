package com.electronics.backend.controller;

import com.electronics.backend.dto.CheckoutRequest;
import com.electronics.backend.model.Order;
import com.electronics.backend.services.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(@RequestBody CheckoutRequest request) {
        try {
            // Création de la commande
            Order order = orderService.createOrder(request);

            // Vérification si la commande a été créée
            if (order == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Erreur lors de la création de la commande.");
            }

            // Réponse OK avec la commande
            return ResponseEntity.ok(order);

        } catch (Exception e) {
            e.printStackTrace(); // Log complet pour debug
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Une erreur est survenue: " + e.getMessage());
        }
    }

    // Récupérer toutes les commandes
    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        List<Order> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }
}
