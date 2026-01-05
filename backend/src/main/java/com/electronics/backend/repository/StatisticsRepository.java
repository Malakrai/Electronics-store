package com.electronics.backend.repository;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class StatisticsRepository {

    private final JdbcTemplate jdbc;

    public StatisticsRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // ===========================
    // TOP PRODUCTS
    // ===========================
    public List<Map<String, Object>> getTopProducts() {
        String sql = """
            SELECT p.name,
                   SUM(oi.quantity) AS totalSold
            FROM order_items oi
            JOIN products p ON p.product_id = oi.product_id
            GROUP BY p.name
            ORDER BY totalSold DESC
        """;

        return jdbc.queryForList(sql);
    }

    // ===========================
    // REVENUE BY MONTH
    // ===========================
    public List<Map<String, Object>> getRevenueByMonth() {
        String sql = """
            SELECT DATE_FORMAT(order_date, '%Y-%m') AS month,
                   SUM(total_amount) AS revenue
            FROM orders
            GROUP BY DATE_FORMAT(order_date, '%Y-%m')
            ORDER BY month
        """;

        return jdbc.queryForList(sql);
    }

    // ===========================
    // CATEGORY STATS
    // ===========================
    public List<Map<String, Object>> getStatsByCategory() {
        String sql = """
            SELECT c.name AS category,
                   SUM(oi.quantity) AS totalSold,
                   SUM(oi.line_total) AS totalRevenue
            FROM order_items oi
            JOIN products p ON p.product_id = oi.product_id
            JOIN product_categories pc ON pc.product_id = p.product_id
            JOIN categories c ON c.id = pc.category_id
            GROUP BY c.id
            ORDER BY totalRevenue DESC
        """;

        return jdbc.queryForList(sql);
    }

    // ===========================
    // ORDERS PER MONTH
    // ===========================
    public List<Map<String, Object>> getOrderCountByMonth() {
        String sql = """
            SELECT DATE_FORMAT(order_date, '%Y-%m') AS month,
                   COUNT(*) AS totalOrders
            FROM orders
            GROUP BY DATE_FORMAT(order_date, '%Y-%m')
            ORDER BY month
        """;

        return jdbc.queryForList(sql);
    }

    // ===========================
    // TOP CLIENTS
    // ===========================
    public List<Map<String, Object>> getTopClients() {
        String sql = """
            SELECT c.account_number AS client,
                   SUM(o.total_amount) AS revenue
            FROM orders o
            JOIN customers c ON c.id = o.customer_id
            GROUP BY c.id
            ORDER BY revenue DESC
        """;

        return jdbc.queryForList(sql);
    }

    // ===========================
    // TOTALS
    // ===========================
    public long getTotalOrders() {
        return jdbc.queryForObject(
                "SELECT COUNT(*) FROM orders",
                Long.class
        );
    }

    public long getTotalCustomers() {
        return jdbc.queryForObject(
                "SELECT COUNT(*) FROM customers",
                Long.class
        );
    }

    public double getTotalRevenue() {
        return jdbc.queryForObject(
                "SELECT SUM(total_amount) FROM orders",
                Double.class
        );
    }
}
