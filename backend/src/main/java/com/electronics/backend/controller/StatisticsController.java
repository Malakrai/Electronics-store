package com.electronics.backend.controller;
import com.electronics.backend.service.StatisticsService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
@RestController
@RequestMapping("/stats")
@CrossOrigin(origins = "http://localhost:4200")
public class StatisticsController {

    private final StatisticsService service;

    public StatisticsController(StatisticsService service) {
        this.service = service;
    }

    // ===========================
    // LIST ENDPOINTS (NO DTO)
    // ===========================

    @GetMapping("/top-products")
    public List<Map<String, Object>> getTopProducts() {
        return service.getTopProducts();
    }

    @GetMapping("/revenue-by-month")
    public List<Map<String, Object>> getRevenueByMonth() {
        return service.getRevenueByMonth();
    }

    @GetMapping("/category")
    public List<Map<String, Object>> getStatsByCategory() {
        return service.getStatsByCategory();
    }

    @GetMapping("/orders-per-month")
    public List<Map<String, Object>> getOrderCountByMonth() {
        return service.getOrderCountByMonth();
    }

    @GetMapping("/top-clients")
    public List<Map<String, Object>> getTopClients() {
        return service.getTopClients();
    }

    // ===========================
    // SIMPLE NUMERIC ENDPOINTS
    // ===========================
    @GetMapping("/total-orders")
    public Map<String, Long> getTotalOrders() {
        return Map.of("value", service.getTotalOrders());
    }

    @GetMapping("/total-customers")
    public Map<String, Long> getTotalCustomers() {
        return Map.of("value", service.getTotalCustomers());
    }

    @GetMapping("/total-revenue")
    public Map<String, Double> getTotalRevenue() {
        return Map.of("value", service.getTotalRevenue());
    }


    @GetMapping("/check-db")
    public String checkDB() {
        Long orders = service.getTotalOrders();
        Long customers = service.getTotalCustomers();
        Double revenue = service.getTotalRevenue();

        return "Orders=" + orders + ", Customers=" + customers + ", Revenue=" + revenue;
    }
}