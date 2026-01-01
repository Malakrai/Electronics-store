package com.electronics.backend.model.statistics;

public class TopProductDTO {
    private String name;
    private Long totalSold;

    public TopProductDTO(String name, Long totalSold) {
        this.name = name;
        this.totalSold = totalSold;
    }

    public String getName() { return name; }
    public Long getTotalSold() { return totalSold; }
}
