package com.electronics.backend.controller;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.electronics.backend.model.Order;
import com.electronics.backend.model.OrderItem;
import com.electronics.backend.model.Product;
import com.electronics.backend.repository.OrderRepository;
import com.electronics.backend.repository.ProductRepository;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    // ===========================
    // Créer une commande (checkout)
    // ===========================
    @PostMapping("/checkout")
    public Order createOrder(@RequestBody List<ItemRequest> items) {

        Order order = new Order();
        HashSet<OrderItem> orderItems = new HashSet<>();
        BigDecimal total = BigDecimal.ZERO;

        for (ItemRequest item : items) {
            Product product = productRepository.findById(item.getProductId()).orElse(null);
            if (product != null) {
                OrderItem orderItem = new OrderItem();
                orderItem.setProductId(product.getId());
                orderItem.setProductName(product.getName());
                orderItem.setUnitPrice(product.getPrice());
                orderItem.setQuantity(item.getQuantity());

                orderItem.setOrder(order);
                orderItems.add(orderItem);

                total = total.add(product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
            }
        }

        order.setOrderItems(orderItems);
        order.setTotalAmount(total);

        return orderRepository.save(order);
    }

    // ===========================
    // Récupérer toutes les commandes
    // ===========================
    @GetMapping
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    // ===========================
    // Classe interne pour recevoir les items du frontend
    // ===========================
    public static class ItemRequest {

        private Long productId;
        private int quantity;

        public Long getProductId() {
            return productId;
        }

        public void setProductId(Long productId) {
            this.productId = productId;
        }

        public int getQuantity() {
            return quantity;
        }

        public void setQuantity(int quantity) {
            this.quantity = quantity;
        }
    }
}
