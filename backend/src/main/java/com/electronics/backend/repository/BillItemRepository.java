package com.electronics.backend.repository;

import com.electronics.backend.model.BillItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BillItemRepository extends JpaRepository<BillItem, Long> {
    List<BillItem> findByMonthlyBillId(Long monthlyBillId);
}
