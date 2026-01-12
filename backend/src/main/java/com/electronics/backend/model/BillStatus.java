package com.electronics.backend.model;

public enum BillStatus {
    PENDING,   // Facture créée, en attente de paiement
    PAID,      // Facture entièrement payée
    CANCELED;  // Facture annulée

    public boolean isPaid() {
        return this == PAID;
    }

    public boolean isUnpaid() {
        return this == PENDING;
    }

    public boolean isCanceled() {
        return this == CANCELED;
    }

    public boolean canBePaid() {
        return this == PENDING;
    }

    public boolean canBeCanceled() {
        return this == PENDING;
    }
}
