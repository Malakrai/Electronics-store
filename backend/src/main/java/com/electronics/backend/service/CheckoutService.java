package com.electronics.backend.service;

import com.electronics.backend.model.*;
import com.electronics.backend.repository.MonthlyBillRepository;
import com.electronics.backend.repository.OrderRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class CheckoutService {

    private final OrderRepository orderRepository;
    private final MonthlyBillRepository monthlyBillRepository;

    public CheckoutService(OrderRepository orderRepository, MonthlyBillRepository monthlyBillRepository) {
        this.orderRepository = orderRepository;
        this.monthlyBillRepository = monthlyBillRepository;
    }

    /**
     * ✅ Merge-proof:
     * - Si une facture existe déjà pour cette commande => on la renvoie
     * - Sinon => on la crée en PENDING, basée sur les OrderItems
     */
    @Transactional
    public MonthlyBill initCheckout(Long orderId) {
        // 1) Si déjà une bill pour cette commande => return
        MonthlyBill existing = monthlyBillRepository.findByOrderId(orderId).orElse(null);
        if (existing != null) return existing;

        // 2) Charger la commande
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));

        // 3) Créer la facture
        MonthlyBill bill = new MonthlyBill();
        bill.setOrderId(order.getId());                // ✅ lien stable pour merge
        bill.setCustomer(order.getCustomer());
        bill.setBillDate(java.time.LocalDate.now());
        bill.setStatus(BillStatus.PENDING);

        BigDecimal total = BigDecimal.ZERO;

        if (order.getOrderItems() != null) {
            for (OrderItem oi : order.getOrderItems()) {
                BillItem bi = new BillItem();

                // Description : nom produit si présent
                String desc = "Item";
                if (oi.getProduct() != null && oi.getProduct().getName() != null) {
                    desc = oi.getProduct().getName();
                }
                bi.setDescription(desc);

                // Quantité
                Integer qty = (oi.getQuantity() == null || oi.getQuantity() <= 0) ? 1 : oi.getQuantity();
                bi.setQuantity(qty);

                // Prix unitaire et total ligne (déjà dans OrderItem)
                BigDecimal unit = oi.getUnitPrice() != null ? oi.getUnitPrice() : BigDecimal.ZERO;
                BigDecimal line = oi.getLineTotal() != null ? oi.getLineTotal() : unit.multiply(BigDecimal.valueOf(qty));
                bi.setUnitPrice(unit);
                bi.setLineTotal(line);

                // Liens
                bi.setProduct(oi.getProduct());
                bi.setOrder(order);      // ✅ lien BillItem -> Order
                bill.addItem(bi);        // ✅ lien BillItem -> MonthlyBill

                total = total.add(line);
            }
        }

        // Option: si tu veux reprendre les montants du Order (shipping/tax)
        // total = total.add(nz(order.getShippingAmount())).add(nz(order.getTaxAmount()));

        bill.setTotalAmount(total);

        return monthlyBillRepository.save(bill);
    }

    private BigDecimal nz(BigDecimal v) {
        return v == null ? BigDecimal.ZERO : v;
    }
}
