package com.electronics.backend.repository;

import com.electronics.backend.model.MonthlyBill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MonthlyBillRepository extends JpaRepository<MonthlyBill, Long> {

    Optional<MonthlyBill> findByOrderId(Long orderId);

    // ✅ pour /api/bills/customer/{customerId}
    List<MonthlyBill> findByCustomerId(Long customerId);

    MonthlyBill findByOrderId(Long orderId);


    List<MonthlyBill> findByStatus(String status); // Ajouter cette méthode
}
