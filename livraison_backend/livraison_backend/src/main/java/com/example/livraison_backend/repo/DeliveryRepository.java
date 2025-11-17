package com.example.livraison_backend.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.livraison_backend.model.Delivery;

public interface DeliveryRepository extends JpaRepository<Delivery, Long> {
}
