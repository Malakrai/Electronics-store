package com.electronics.backend.services;

import com.electronics.backend.dto.CheckoutRequest;
import com.electronics.backend.dto.CheckoutResponse;
import com.electronics.backend.model.*;
import com.electronics.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final BillingService billingService;
    private final MonthlyBillRepository monthlyBillRepository;

    public OrderService(OrderRepository orderRepository,
                        ProductRepository productRepository,
                        CustomerRepository customerRepository,
                        BillingService billingService,
                        MonthlyBillRepository monthlyBillRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
        this.billingService = billingService;
        this.monthlyBillRepository = monthlyBillRepository;
    }

    @Transactional
    public CheckoutResponse processCheckout(CheckoutRequest request) {
        try {
            System.out.println("Processing checkout...");

            // Créer la commande
            Order order = createOrder(request);

            // Créer la réponse
            CheckoutResponse response = new CheckoutResponse();
            response.setOrderId(order.getId());
            response.setOrderNumber(order.getOrderNumber());
            response.setTotalAmount(order.getTotalAmount());
            response.setOrderDate(order.getOrderDate() != null ? order.getOrderDate() : LocalDateTime.now());
            response.setStatus(order.getStatus().toString());

            // Récupérer l'ID de la facture créée
            List<MonthlyBill> bills = monthlyBillRepository.findByOrderId(order.getId());
            if (!bills.isEmpty() && bills.get(0) != null) {
                MonthlyBill bill = bills.get(0);
                response.setBillId(bill.getId());  // CORRECTION: Utiliser getId() sur MonthlyBill
                System.out.println("Bill ID found: " + bill.getId());  // CORRECTION: Utiliser getId() sur MonthlyBill
            }

            System.out.println("Checkout processed successfully!");
            return response;

        } catch (Exception e) {
            System.err.println("Error processing checkout: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to process checkout: " + e.getMessage(), e);
        }
    }

    @Transactional
    public Order createOrder(CheckoutRequest request) {
        if (request == null || request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }

        System.out.println("Creating order...");
        System.out.println("  Customer ID: " + request.getCustomerId());
        System.out.println("  Customer Name: " + request.getCustomerName());
        System.out.println("  Items count: " + request.getItems().size());

        // Gestion du client
        Customer customer;
        if (request.getCustomerId() != null) {
            customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new IllegalArgumentException("Customer not found: " + request.getCustomerId()));
            System.out.println("Existing customer found: " + customer.getId());
        } else {
            // Créer un client guest
            customer = new Customer();
            customer.setEmail(request.getCustomerEmail());

            if (request.getCustomerName() != null && !request.getCustomerName().trim().isEmpty()) {
                String[] nameParts = request.getCustomerName().split(" ", 2);
                customer.setFirstName(nameParts[0]);
                customer.setLastName(nameParts.length > 1 ? nameParts[1] : "");
            } else {
                customer.setFirstName("Guest");
                customer.setLastName("");
            }

            customer = customerRepository.save(customer);
            System.out.println("Guest customer created: " + customer.getId());
        }

        // Création de la commande
        Order order = new Order();
        order.setOrderNumber("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        order.setType(OrderType.ONLINE);
        order.setStatus(OrderStatus.CONFIRMED);
        order.setCustomer(customer);
        order.setCustomerName(request.getCustomerName());
        order.setCustomerEmail(request.getCustomerEmail());
        order.setOrderDate(LocalDateTime.now());

        BigDecimal subtotal = BigDecimal.ZERO;

        // Ajout des articles
        for (CheckoutRequest.Item item : request.getItems()) {
            if (item.getProductId() == null || item.getQuantity() == null || item.getQuantity() <= 0) {
                throw new IllegalArgumentException("Invalid item: productId=" + item.getProductId() + ", quantity=" + item.getQuantity());
            }

            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + item.getProductId()));

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setProductName(product.getName());
            orderItem.setQuantity(item.getQuantity());
            orderItem.setUnitPrice(product.getPrice());
            orderItem.calculateLineTotal();

            order.addOrderItem(orderItem);
            subtotal = subtotal.add(orderItem.getLineTotal());

            System.out.println("Added item: " + product.getName() + " x" + item.getQuantity() + " = " + orderItem.getLineTotal());
        }

        // Calcul des montants
        BigDecimal shippingAmount = request.getShippingAmount() != null ?
                request.getShippingAmount() : BigDecimal.ZERO;

        BigDecimal taxAmount = subtotal.multiply(new BigDecimal("0.20"));
        BigDecimal grandTotal = subtotal.add(shippingAmount).add(taxAmount);

        order.setTotalAmount(grandTotal);
        order.setTaxAmount(taxAmount);
        order.setShippingAmount(shippingAmount);

        // Calcul des cents totaux
        if (order.getTotalAmount() != null) {
            order.setTotalCents(order.getTotalAmount().multiply(new BigDecimal("100")).intValue());
        }

        Order savedOrder = orderRepository.save(order);
        System.out.println("Order created: " + savedOrder.getId() + " - Total: " + savedOrder.getTotalAmount());

        // Création automatique de la facture
        try {
            billingService.createBillFromOrder(savedOrder.getId());
            System.out.println("Bill created for order: " + savedOrder.getId());
        } catch (Exception e) {
            System.err.println("Could not create bill: " + e.getMessage());
            // Ne pas bloquer la commande si la facture échoue
        }

        return savedOrder;
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Order getOrderById(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = getOrderById(orderId);
        order.setStatus(status);
        return orderRepository.save(order);
    }
}
