package com.electronics.backend.repository;

import com.electronics.backend.model.MonthlyBill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MonthlyBillRepository extends JpaRepository<MonthlyBill, Long> {

    List<MonthlyBill> findByCustomerId(Long customerId);

    MonthlyBill findByOrderId(Long orderId);


    List<MonthlyBill> findByStatus(String status); // Ajouter cette méthode
}
