package com.example.livraison_backend.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.livraison_backend.model.Review;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByOrderId(Long orderId);
}
