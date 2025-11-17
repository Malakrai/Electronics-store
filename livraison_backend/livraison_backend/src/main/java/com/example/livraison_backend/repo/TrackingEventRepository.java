package com.example.livraison_backend.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.livraison_backend.model.TrackingEvent;
import java.util.List;

public interface TrackingEventRepository extends JpaRepository<TrackingEvent, Long> {
    List<TrackingEvent> findByDeliveryIdOrderByCreatedAtAsc(Long deliveryId);
}
