package com.electronics.backend.controller;

import com.electronics.backend.services.StatisticsService;
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
    // KPI
    // ===========================
    @GetMapping("/total-orders")
    public Map<String, Long> totalOrders(@RequestParam(required = false) Integer year) {
        long v = (year == null) ? service.getTotalOrders() : service.getTotalOrdersByYear(year);
        return Map.of("value", v);
    }

    @GetMapping("/total-customers")
    public Map<String, Long> totalCustomers() {
        return Map.of("value", service.getTotalCustomers());
    }

    @GetMapping("/total-revenue")
    public Map<String, Double> totalRevenue(@RequestParam(required = false) Integer year) {
        double v = (year == null) ? service.getTotalRevenue() : service.getTotalRevenueByYear(year);
        return Map.of("value", v);
    }

    @GetMapping("/items-per-order")
    public Map<String, Double> itemsPerOrder() {
        return Map.of("value", service.getItemsPerOrder());
    }

    // ===========================
    // TIME SERIES
    // ===========================
    @GetMapping("/revenue-by-month")
    public List<Map<String, Object>> revenueByMonth(@RequestParam(required = false) Integer year) {
        return service.getRevenueByMonth(year);
    }

    @GetMapping("/orders-per-month")
    public List<Map<String, Object>> ordersPerMonth(@RequestParam(required = false) Integer year) {
        return service.getOrdersPerMonth(year);
    }

    // ===========================
    // PRODUCTS
    // ===========================
    // top produits global (quantité)
    @GetMapping("/top-products")
    public List<Map<String, Object>> topProducts(@RequestParam(defaultValue = "10") int limit) {
        return service.getTopProductsOverall(limit);
    }

    // top produits du mois (YYYY-MM)
    @GetMapping("/top-products/month")
    public List<Map<String, Object>> topProductsMonth(
            @RequestParam String month,
            @RequestParam(defaultValue = "10") int limit
    ) {
        return service.getTopProductsByMonth(month, limit);
    }

    // top produits de l'année
    @GetMapping("/top-products/year")
    public List<Map<String, Object>> topProductsYear(
            @RequestParam int year,
            @RequestParam(defaultValue = "10") int limit
    ) {
        return service.getTopProductsByYear(year, limit);
    }

    // top produits par CA
    @GetMapping("/top-products/revenue")
    public List<Map<String, Object>> topProductsByRevenue(@RequestParam(defaultValue = "10") int limit) {
        return service.getTopProductsByRevenue(limit);
    }

    // ===========================
    // CLIENTS
    // ===========================
    @GetMapping("/top-clients")
    public List<Map<String, Object>> topClients(@RequestParam(defaultValue = "10") int limit) {
        return service.getTopClients(limit);
    }

    // ===========================
    // CATEGORY (based on products.category)
    // ===========================
    @GetMapping("/category/revenue")
    public List<Map<String, Object>> categoryRevenue(@RequestParam(required = false) Integer year) {
        return service.getRevenueByCategory(year);
    }

    @GetMapping("/category/margin")
    public List<Map<String, Object>> categoryMargin(@RequestParam(required = false) Integer year) {
        return service.getMarginByCategory(year);
    }

    @GetMapping("/category/share")
    public List<Map<String, Object>> categoryShare(@RequestParam(required = false) Integer year) {
        return service.getCategoryShare(year);
    }

    // ===========================
    // Debug
    // ===========================
    @GetMapping("/check-db")
    public String checkDB() {
        return "Orders=" + service.getTotalOrders()
                + ", Customers=" + service.getTotalCustomers()
                + ", Revenue=" + service.getTotalRevenue();
    }
}
