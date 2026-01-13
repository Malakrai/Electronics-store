package com.electronics.backend.repository;

import com.electronics.backend.model.MonthlyBill;
import com.electronics.backend.model.Order;
import com.electronics.backend.model.BillStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface MonthlyBillRepository extends JpaRepository<MonthlyBill, Long> {

    Optional<MonthlyBill> findByOrder(Order order);

    // Ajoutez cette méthode pour trouver les factures par orderId
    @Query("SELECT b FROM MonthlyBill b WHERE b.order.id = :orderId")
    List<MonthlyBill> findByOrderId(@Param("orderId") Long orderId);

    List<MonthlyBill> findByCustomerId(Long customerId);

    List<MonthlyBill> findByStatus(BillStatus status);

    @Query("SELECT b FROM MonthlyBill b WHERE b.customer.id = :customerId AND b.status = :status")
    List<MonthlyBill> findByCustomerIdAndStatus(@Param("customerId") Long customerId,
                                                @Param("status") BillStatus status);

    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM MonthlyBill b WHERE b.customer.id = :customerId AND b.status = 'PAID'")
    BigDecimal findTotalPaidByCustomer(@Param("customerId") Long customerId);

    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM MonthlyBill b WHERE b.customer.id = :customerId AND b.status = 'PENDING'")
    BigDecimal findTotalPendingByCustomer(@Param("customerId") Long customerId);

    // Méthode pour trouver les factures impayées (optionnelle)
    @Query("SELECT b FROM MonthlyBill b WHERE b.status = 'PENDING' AND b.totalAmount > b.amountPaid")
    List<MonthlyBill> findUnpaidBills();

    // Méthode pour trouver les factures d'un client par période (optionnelle)
    @Query("SELECT b FROM MonthlyBill b WHERE b.customer.id = :customerId " +
            "AND b.billDate BETWEEN :startDate AND :endDate")
    List<MonthlyBill> findByCustomerIdAndDateRange(@Param("customerId") Long customerId,
                                                   @Param("startDate") java.time.LocalDate startDate,
                                                   @Param("endDate") java.time.LocalDate endDate);
}
