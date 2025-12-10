package com.electronics.backend.model.statistics;

public class RevenueDTO {
    private String month;
    private Double revenue;

    public RevenueDTO(String month, Double revenue) {
        this.month = month;
        this.revenue = revenue;
    }

    public String getMonth() { return month; }
    public Double getRevenue() { return revenue; }
}
