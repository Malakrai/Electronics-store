package com.electronics.backend.model.statistics;

public class CategoryStatsDTO {

    private String category;
    private Long totalSold;
    private Double totalRevenue;

    public CategoryStatsDTO(String category, Long totalSold, Double totalRevenue) {
        this.category = category;
        this.totalSold = totalSold;
        this.totalRevenue = totalRevenue;
    }

    public String getCategory() { return category; }
    public Long getTotalSold() { return totalSold; }
    public Double getTotalRevenue() { return totalRevenue; }
}
