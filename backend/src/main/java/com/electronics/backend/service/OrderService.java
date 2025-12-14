package com.electronics.backend.service;

import com.electronics.backend.dto.CheckoutRequest;
import com.electronics.backend.model.Order;
import com.electronics.backend.model.OrderItem;
import com.electronics.backend.model.OrderStatus;
import com.electronics.backend.model.OrderType;
import com.electronics.backend.model.Product;
import com.electronics.backend.repository.OrderRepository;
import com.electronics.backend.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public OrderService(OrderRepository orderRepository,
                        ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    public Order createOrder(CheckoutRequest request) {

        if (request == null || request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }

        Order order = new Order();
        order.setOrderNumber(UUID.randomUUID().toString());
        order.setType(OrderType.ONLINE);
        order.setStatus(OrderStatus.PENDING);

        // guest info (facultatif)
        order.setCustomerName(request.getCustomerName());
        order.setCustomerEmail(request.getCustomerEmail());

        BigDecimal total = BigDecimal.ZERO;

        for (CheckoutRequest.Item item : request.getItems()) {
            if (item.getProductId() == null || item.getQuantity() <= 0) {
                throw new IllegalArgumentException("Invalid item: productId/quantity");
            }

            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + item.getProductId()));

            OrderItem oi = new OrderItem();
            oi.setProduct(product);
            oi.setProductName(product.getName());
            oi.setQuantity(item.getQuantity());
            oi.setUnitPrice(product.getPrice());

            BigDecimal lineTotal = product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            oi.setLineTotal(lineTotal);

            order.addOrderItem(oi);
            total = total.add(lineTotal);
        }

        order.setTotalAmount(total);

        return orderRepository.save(order);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
}
