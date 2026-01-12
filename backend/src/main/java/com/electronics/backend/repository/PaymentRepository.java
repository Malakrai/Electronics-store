package com.electronics.backend.repository;

import com.electronics.backend.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    // Trouver tous les paiements d'une facture
    List<Payment> findByMonthlyBillId(Long monthlyBillId);

    // Calculer le total des paiements pour une facture
    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.monthlyBill.id = :monthlyBillId")
    BigDecimal sumAmountByMonthlyBillId(@Param("monthlyBillId") Long monthlyBillId);
}
