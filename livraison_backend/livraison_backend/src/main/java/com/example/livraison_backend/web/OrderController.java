package com.example.livraison_backend.web;

import com.example.livraison_backend.model.Order;
import com.example.livraison_backend.repo.OrderRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderRepository orders;

    public OrderController(OrderRepository orders) {
        this.orders = orders;
    }

    @PostMapping
    public Order create(@RequestBody Order order) {
        return orders.save(order);
    }

    @GetMapping("/{id}")
    public Order get(@PathVariable Long id) {
        return orders.findById(id).orElseThrow();
    }
}
