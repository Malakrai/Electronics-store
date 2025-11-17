package com.example.livraison_backend.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.livraison_backend.model.Order;

public interface OrderRepository extends JpaRepository<Order, Long> {
}
