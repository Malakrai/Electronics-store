package com.electronics.backend.controller;

import com.electronics.backend.model.Shipment;
import com.electronics.backend.model.ShipmentTrackingResponse;
import com.electronics.backend.service.ShipmentTrackingService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/delivery-tracking")
@CrossOrigin(origins = "http://localhost:4200")
public class ShipmentTrackingController {

    private final ShipmentTrackingService service;

    public ShipmentTrackingController(ShipmentTrackingService service) {
        this.service = service;
    }

    @GetMapping("/{trackingNumber}")
    public ShipmentTrackingResponse track(@PathVariable String trackingNumber) {

        Shipment shipment = service.getShipment(trackingNumber.toUpperCase());

        if (shipment == null) {
            return null; // Le front gèrera "introuvable"
        }

        return new ShipmentTrackingResponse(shipment);
    }
}
