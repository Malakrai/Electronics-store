package com.electronics.backend.model.statistics;

public class ClientRevenueDTO {

    private String client;
    private Double revenue;

    public ClientRevenueDTO(String client, Double revenue) {
        this.client = client;
        this.revenue = revenue;
    }

    public String getClient() {
        return client;
    }

    public Double getRevenue() {
        return revenue;
    }
}
