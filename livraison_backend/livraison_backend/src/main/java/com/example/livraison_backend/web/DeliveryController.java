package com.example.livraison_backend.web;

import com.example.livraison_backend.model.*;
import com.example.livraison_backend.repo.*;
import com.example.livraison_backend.service.*;
import com.example.livraison_backend.web.dto.UpdateStatusDto;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@RestController
@RequestMapping("/api/deliveries")
public class DeliveryController {

    private final DeliveryRepository deliveries;
    private final OrderRepository orders;
    private final TrackingEventRepository events;
    private final TrackingService tracking;
    private final TrackingHub hub;

    public DeliveryController(
            DeliveryRepository deliveries,
            OrderRepository orders,
            TrackingEventRepository events,
            TrackingService tracking,
            TrackingHub hub
    ) {
        this.deliveries = deliveries;
        this.orders = orders;
        this.events = events;
        this.tracking = tracking;
        this.hub = hub;
    }

    @PostMapping
    public Delivery create(@RequestParam Long orderId) {
        Order order = orders.findById(orderId).orElseThrow();
        Delivery d = new Delivery();
        d.setOrder(order);
        d.setStatus(DeliveryStatus.CREATED);
        return deliveries.save(d);
    }

    @GetMapping("/{id}")
    public Delivery get(@PathVariable Long id) {
        return deliveries.findById(id).orElseThrow();
    }

    @GetMapping("/{id}/events")
    public List<TrackingEvent> list(@PathVariable Long id) {
        return events.findByDeliveryIdOrderByCreatedAtAsc(id);
    }

    @PostMapping("/{id}/status")
    public TrackingEvent update(@PathVariable Long id, @RequestBody UpdateStatusDto dto) {
        return tracking.addEvent(id, dto.status(), dto.message(), dto.lat(), dto.lng());
    }

    @GetMapping(value="/{id}/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@PathVariable Long id) {
        return hub.subscribe(id);
    }
}
