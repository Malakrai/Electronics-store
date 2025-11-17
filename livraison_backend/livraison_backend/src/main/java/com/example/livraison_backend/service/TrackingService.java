package com.example.livraison_backend.service;

import com.example.livraison_backend.model.*;
import com.example.livraison_backend.repo.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TrackingService {

    private final TrackingEventRepository events;
    private final DeliveryRepository deliveries;
    private final TrackingHub hub;

    public TrackingService(
            TrackingEventRepository events,
            DeliveryRepository deliveries,
            TrackingHub hub
    ) {
        this.events = events;
        this.deliveries = deliveries;
        this.hub = hub;
    }

    @Transactional
    public TrackingEvent addEvent(Long deliveryId, DeliveryStatus status, String message, Double lat, Double lng) {
        Delivery delivery = deliveries.findById(deliveryId).orElseThrow();
        delivery.setStatus(status);

        TrackingEvent event = new TrackingEvent();
        event.setDelivery(delivery);
        event.setStatus(status);
        event.setMessage(message);
        event.setLat(lat);
        event.setLng(lng);

        TrackingEvent saved = events.save(event);

        hub.publish(saved);

        return saved;
    }
}
