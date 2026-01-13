package com.electronics.backend.services;

import com.electronics.backend.model.*;
import com.electronics.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
public class CheckoutService {

    private final OrderRepository orderRepository;
    private final MonthlyBillRepository monthlyBillRepository;
    private final BillItemRepository billItemRepository;
    private final ProductRepository productRepository;

    public CheckoutService(OrderRepository orderRepository,
                           MonthlyBillRepository monthlyBillRepository,
                           BillItemRepository billItemRepository,
                           ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.monthlyBillRepository = monthlyBillRepository;
        this.billItemRepository = billItemRepository;
        this.productRepository = productRepository;
    }

    /**
     * Crée ou récupère une facture pour une commande
     */
    @Transactional
    public MonthlyBill initCheckout(Long orderId) {
        // 1) Vérifier si une facture existe déjà pour cette commande
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Commande non trouvée: " + orderId));

        // Utiliser la nouvelle méthode avec l'objet Order
        MonthlyBill existing = monthlyBillRepository.findByOrder(order).orElse(null);
        if (existing != null) {
            return existing;
        }

        // 2) Vérifier que la commande a des items
        if (order.getOrderItems() == null || order.getOrderItems().isEmpty()) {
            throw new IllegalArgumentException("La commande ne contient aucun article");
        }

        // 3) Créer la facture
        MonthlyBill bill = new MonthlyBill();
        bill.setOrder(order); // CORRECTION: Utiliser l'objet Order, pas juste l'ID
        bill.setCustomer(order.getCustomer());
        bill.setBillDate(LocalDate.now());
        bill.setStatus(BillStatus.PENDING);

        // Utiliser le total de la commande s'il existe
        if (order.getTotalAmount() != null) {
            bill.setTotalAmount(order.getTotalAmount());
        } else {
            // Calculer le total à partir des items
            BigDecimal total = calculateOrderTotal(order);
            bill.setTotalAmount(total);
        }

        // Sauvegarder d'abord la facture pour avoir un ID
        MonthlyBill savedBill = monthlyBillRepository.save(bill);

        // 4) Créer les items de facture
        createBillItemsFromOrder(order, savedBill);

        // Recharger la facture avec les items
        return monthlyBillRepository.findById(savedBill.getId())
                .orElseThrow(() -> new RuntimeException("Erreur lors de la création de la facture"));
    }

    /**
     * Crée les items de facture à partir des items de commande
     */
    private void createBillItemsFromOrder(Order order, MonthlyBill bill) {
        for (OrderItem orderItem : order.getOrderItems()) {
            BillItem billItem = new BillItem();

            // Définir la description
            String description = "Article";
            if (orderItem.getProduct() != null && orderItem.getProduct().getName() != null) {
                description = orderItem.getProduct().getName();
            } else if (orderItem.getProductName() != null) {
                description = orderItem.getProductName();
            }
            billItem.setDescription(description);

            // Définir la quantité
            Integer quantity = orderItem.getQuantity() != null && orderItem.getQuantity() > 0
                    ? orderItem.getQuantity()
                    : 1;
            billItem.setQuantity(quantity);

            // Définir le prix unitaire
            BigDecimal unitPrice = orderItem.getUnitPrice() != null
                    ? orderItem.getUnitPrice()
                    : (orderItem.getProduct() != null ? orderItem.getProduct().getPrice() : BigDecimal.ZERO);
            billItem.setUnitPrice(unitPrice);

            // Calculer ou utiliser le total de ligne
            BigDecimal lineTotal;
            if (orderItem.getLineTotal() != null) {
                lineTotal = orderItem.getLineTotal();
            } else {
                lineTotal = unitPrice.multiply(BigDecimal.valueOf(quantity));
            }
            billItem.setLineTotal(lineTotal);

            // Définir les relations
            billItem.setMonthlyBill(bill);
            billItem.setOrder(order);
            billItem.setOrderItem(orderItem);
            billItem.setProduct(orderItem.getProduct());

            // Sauvegarder l'item
            billItemRepository.save(billItem);
        }
    }

    /**
     * Calcule le total d'une commande à partir de ses items
     */
    private BigDecimal calculateOrderTotal(Order order) {
        if (order.getOrderItems() == null || order.getOrderItems().isEmpty()) {
            return BigDecimal.ZERO;
        }

        BigDecimal total = BigDecimal.ZERO;
        for (OrderItem item : order.getOrderItems()) {
            BigDecimal itemTotal;
            if (item.getLineTotal() != null) {
                itemTotal = item.getLineTotal();
            } else {
                BigDecimal unitPrice = item.getUnitPrice() != null
                        ? item.getUnitPrice()
                        : (item.getProduct() != null ? item.getProduct().getPrice() : BigDecimal.ZERO);
                Integer quantity = item.getQuantity() != null && item.getQuantity() > 0
                        ? item.getQuantity()
                        : 1;
                itemTotal = unitPrice.multiply(BigDecimal.valueOf(quantity));
            }
            total = total.add(itemTotal);
        }

        // Ajouter les frais de livraison et taxes si présents
        if (order.getShippingAmount() != null) {
            total = total.add(order.getShippingAmount());
        }
        if (order.getTaxAmount() != null) {
            total = total.add(order.getTaxAmount());
        }

        return total;
    }

    /**
     * Finalise le checkout et marque la facture comme prête pour paiement
     */
    @Transactional
    public MonthlyBill finalizeCheckout(Long billId) {
        MonthlyBill bill = monthlyBillRepository.findById(billId)
                .orElseThrow(() -> new IllegalArgumentException("Facture non trouvée: " + billId));

        if (bill.getStatus() != BillStatus.PENDING) {
            throw new IllegalStateException("La facture n'est pas en attente. Statut actuel: " + bill.getStatus());
        }

        // Ici, vous pourriez ajouter des validations supplémentaires :
        // - Vérifier que le client a une adresse de livraison
        // - Vérifier le stock des produits
        // - Calculer les frais de livraison finals
        // - etc.

        return bill;
    }

    /**
     * Annule le checkout et supprime la facture
     */
    @Transactional
    public void cancelCheckout(Long billId) {
        MonthlyBill bill = monthlyBillRepository.findById(billId)
                .orElseThrow(() -> new IllegalArgumentException("Facture non trouvée: " + billId));

        // Ne peut annuler que les factures en attente
        if (bill.getStatus() != BillStatus.PENDING) {
            throw new IllegalStateException("Seules les factures en attente peuvent être annulées");
        }

        // Supprimer la facture (cascade supprimera les BillItems)
        monthlyBillRepository.delete(bill);
    }

    /**
     * Récupère la facture d'une commande
     */
    public MonthlyBill getBillForOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Commande non trouvée: " + orderId));

        return monthlyBillRepository.findByOrder(order)
                .orElseThrow(() -> new IllegalArgumentException("Aucune facture trouvée pour cette commande"));
    }

    /**
     * Vérifie si une commande a déjà une facture
     */
    public boolean hasBillForOrder(Long orderId) {
        try {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new IllegalArgumentException("Commande non trouvée"));
            return monthlyBillRepository.findByOrder(order).isPresent();
        } catch (Exception e) {
            return false;
        }
    }
}
