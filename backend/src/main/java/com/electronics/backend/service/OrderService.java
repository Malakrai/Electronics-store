package com.electronics.backend.service;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;

import org.springframework.stereotype.Service;

import com.electronics.backend.model.Order;
import com.electronics.backend.model.OrderItem;
import com.electronics.backend.model.Product;
import com.electronics.backend.repository.OrderRepository;
import com.electronics.backend.repository.ProductRepository;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public OrderService(OrderRepository orderRepository, ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    // Crée une commande à partir des items du panier
    public Order createOrder(List<OrderItem> items) {
        Order order = new Order();
        HashSet<OrderItem> orderItems = new HashSet<>();
        BigDecimal total = BigDecimal.ZERO;

        for (OrderItem item : items) {
            // Si tu as juste productId + quantity depuis le frontend, récupère le prix et nom du produit
            Product product = productRepository.findById(item.getProductId()).orElse(null);
            if (product != null) {
                item.setProductName(product.getName());
                item.setUnitPrice(product.getPrice());
                item.setOrder(order);
                orderItems.add(item);

                total = total.add(product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
            }
        }

        order.setOrderItems(orderItems);
        order.setTotalAmount(total);

        return orderRepository.save(order);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
}
