package com.electronics.backend.service;
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

    // ===========================
    // MAPPED LISTS (NO MORE DTOs)
    // ===========================
    public List<Map<String, Object>> getTopProducts() {
        return repo.getTopProducts();
    }

    public List<Map<String, Object>> getRevenueByMonth() {
        return repo.getRevenueByMonth();
    }

    public List<Map<String, Object>> getStatsByCategory() {
        return repo.getStatsByCategory();
    }

    public List<Map<String, Object>> getOrderCountByMonth() {
        return repo.getOrderCountByMonth();
    }

    public List<Map<String, Object>> getTopClients() {
        return repo.getTopClients();
    }

    // ===========================
    // SIMPLE NUMERIC ENDPOINTS
    // ===========================
    public long getTotalOrders() {
        return repo.getTotalOrders();
    }

    public long getTotalCustomers() {
        return repo.getTotalCustomers();
    }

    public double getTotalRevenue() {
        return repo.getTotalRevenue();
    }
}