package com.electronics.backend.services;

import com.electronics.backend.model.Shipment;
import com.electronics.backend.repository.ShipmentRepository;
import org.springframework.stereotype.Service;

@Service
public class ShipmentTrackingService {

    private final ShipmentRepository repo;

    public ShipmentTrackingService(ShipmentRepository repo) {
        this.repo = repo;
    }

    public Shipment getShipment(String trackingNumber) {
        return repo.findByTrackingNumber(trackingNumber);
    }
}
