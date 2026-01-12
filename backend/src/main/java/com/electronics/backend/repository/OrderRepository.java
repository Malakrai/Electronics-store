package com.electronics.backend.repository;

<<<<<<< HEAD
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.electronics.backend.model.Order;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
}
=======
import com.electronics.backend.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {}
>>>>>>> origin/ayoub
