package com.electronics.backend.services;

import com.electronics.backend.repository.StatisticsRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class StatisticsService {

    private final StatisticsRepository repo;

    public StatisticsService(StatisticsRepository repo) {
        this.repo = repo;
    }

    // ===== KPI =====
    public long getTotalOrders() { return repo.getTotalOrders(); }
    public long getTotalOrdersByYear(int year) { return repo.getTotalOrdersByYear(year); }

    public long getTotalCustomers() { return repo.getTotalCustomers(); }

    public double getTotalRevenue() { return repo.getTotalRevenue(); }
    public double getTotalRevenueByYear(int year) { return repo.getTotalRevenueByYear(year); }

    public double getItemsPerOrder() { return repo.getItemsPerOrder(); }

    // ===== TIME =====
    public List<Map<String, Object>> getRevenueByMonth(Integer year) { return repo.getRevenueByMonth(year); }
    public List<Map<String, Object>> getOrdersPerMonth(Integer year) { return repo.getOrderCountByMonth(year); }

    // ===== PRODUCTS =====
    public List<Map<String, Object>> getTopProductsOverall(int limit) { return repo.getTopProductsOverall(limit); }
    public List<Map<String, Object>> getTopProductsByMonth(String month, int limit) { return repo.getTopProductsByMonth(month, limit); }
    public List<Map<String, Object>> getTopProductsByYear(int year, int limit) { return repo.getTopProductsByYear(year, limit); }
    public List<Map<String, Object>> getTopProductsByRevenue(int limit) { return repo.getTopProductsByRevenue(limit); }

    // ===== CLIENTS =====
    public List<Map<String, Object>> getTopClients(int limit) { return repo.getTopClients(limit); }

    // ===== CATEGORY =====
    public List<Map<String, Object>> getRevenueByCategory(Integer year) { return repo.getRevenueByCategory(year); }
    public List<Map<String, Object>> getMarginByCategory(Integer year) { return repo.getMarginByCategory(year); }
    public List<Map<String, Object>> getCategoryShare(Integer year) { return repo.getCategoryShare(year); }
}
