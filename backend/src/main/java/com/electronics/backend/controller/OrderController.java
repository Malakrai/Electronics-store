package com.electronics.backend.controller;

import com.electronics.backend.dto.CheckoutRequest;
import com.electronics.backend.dto.CheckoutResponse;
import com.electronics.backend.services.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(@RequestBody CheckoutRequest request) {
        try {
            System.out.println("========== CHECKOUT REQUEST RECEIVED ==========");
            System.out.println("Customer ID: " + request.getCustomerId());
            System.out.println("Customer Name: " + request.getCustomerName());
            System.out.println("Customer Email: " + request.getCustomerEmail());
            System.out.println("Total Amount: " + request.getTotalAmount());
            System.out.println("Shipping Amount: " + request.getShippingAmount());

            // Log des articles
            if (request.getItems() != null) {
                System.out.println("Items (" + request.getItems().size() + "):");
                for (int i = 0; i < request.getItems().size(); i++) {
                    CheckoutRequest.Item item = request.getItems().get(i);
                    System.out.println("  " + (i + 1) + ". ProductId: " + item.getProductId() +
                            ", Quantity: " + item.getQuantity());
                }
            } else {
                System.out.println("No items in request!");
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "No items in cart"));
            }

            CheckoutResponse response = orderService.processCheckout(request);

            System.out.println("Checkout successful!");
            System.out.println("Order Number: " + response.getOrderNumber());
            System.out.println("Order Total: " + response.getTotalAmount());
            System.out.println("Bill ID: " + response.getBillId());
            System.out.println("========== CHECKOUT COMPLETED ==========");

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            System.err.println("Validation error: " + e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "error", "Checkout validation failed",
                            "message", e.getMessage()
                    ));
        } catch (Exception e) {
            System.err.println("Server error during checkout:");
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of(
                            "error", "Checkout failed",
                            "message", e.getMessage(),
                            "timestamp", java.time.LocalDateTime.now()
                    ));
        }
    }

    // Ajoutez d'autres endpoints si nécessaire
    @GetMapping
    public ResponseEntity<?> getAllOrders() {
        try {
            return ResponseEntity.ok(orderService.getAllOrders());
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to get orders"));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrder(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(orderService.getOrderById(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to get order"));
        }
    }
}
