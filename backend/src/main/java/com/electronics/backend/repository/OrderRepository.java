package com.electronics.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.electronics.backend.model.Order;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
}
