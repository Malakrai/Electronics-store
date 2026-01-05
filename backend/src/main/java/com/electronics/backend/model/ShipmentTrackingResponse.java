package com.electronics.backend.model;

import java.time.LocalDate;

public class ShipmentTrackingResponse {

    private String trackingNumber;
    private String carrier;
    private String address;
    private String status;
    private LocalDate shipDate;
    private LocalDate estimatedDelivery;
    private LocalDate actualDelivery;

    public ShipmentTrackingResponse(Shipment shipment) {
        this.trackingNumber = shipment.getTrackingNumber();
        this.carrier = shipment.getShippingCarrier();
        this.address = shipment.getShippingAddress();
        this.status = shipment.getStatus().toString();
        this.shipDate = shipment.getShipDate();
        this.estimatedDelivery = shipment.getEstimatedDelivery();
        this.actualDelivery = shipment.getActualDelivery();
    }

    public String getTrackingNumber() { return trackingNumber; }
    public String getCarrier() { return carrier; }
    public String getAddress() { return address; }
    public String getStatus() { return status; }
    public LocalDate getShipDate() { return shipDate; }
    public LocalDate getEstimatedDelivery() { return estimatedDelivery; }
    public LocalDate getActualDelivery() { return actualDelivery; }
}
