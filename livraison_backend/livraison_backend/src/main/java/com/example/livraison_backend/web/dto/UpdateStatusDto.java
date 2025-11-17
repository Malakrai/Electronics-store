package com.example.livraison_backend.web.dto;

import com.example.livraison_backend.model.DeliveryStatus;

public record UpdateStatusDto(
        DeliveryStatus status,
        String message,
        Double lat,
        Double lng
) {}
