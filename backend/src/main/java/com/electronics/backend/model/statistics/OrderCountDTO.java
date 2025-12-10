package com.electronics.backend.model.statistics;

public class OrderCountDTO {
    private String month;
    private Long totalOrders;

    public OrderCountDTO(String month, Long totalOrders) {
        this.month = month;
        this.totalOrders = totalOrders;
    }

    public String getMonth() { return month; }
    public Long getTotalOrders() { return totalOrders; }
}
