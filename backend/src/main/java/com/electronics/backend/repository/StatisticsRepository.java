package com.electronics.backend.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public class StatisticsRepository {

    private final JdbcTemplate jdbc;

    public StatisticsRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // ===========================
    // KPI
    // ===========================
    public long getTotalOrders() {
        return jdbc.queryForObject("SELECT COUNT(*) FROM orders", Long.class);
    }

    public long getTotalOrdersByYear(int year) {
        return jdbc.queryForObject(
                "SELECT COUNT(*) FROM orders WHERE YEAR(order_date)=?",
                Long.class,
                year
        );
    }

    public double getTotalRevenue() {
        return jdbc.queryForObject("SELECT COALESCE(SUM(total_amount),0) FROM orders", Double.class);
    }

    public double getTotalRevenueByYear(int year) {
        return jdbc.queryForObject(
                "SELECT COALESCE(SUM(total_amount),0) FROM orders WHERE YEAR(order_date)=?",
                Double.class,
                year
        );
    }

    public long getTotalCustomers() {
        return jdbc.queryForObject(
                "SELECT COUNT(*) FROM users WHERE user_type='CUSTOMER'",
                Long.class
        );
    }

    // Items / order (moyenne)
    public double getItemsPerOrder() {
        String sql = """
            SELECT 
              COALESCE(SUM(oi.quantity) / NULLIF(COUNT(DISTINCT oi.order_id),0), 0) AS itemsPerOrder
            FROM order_items oi
        """;
        return jdbc.queryForObject(sql, Double.class);
    }

    // ===========================
    // SALES OVER TIME
    // ===========================
    public List<Map<String, Object>> getOrderCountByMonth(Integer year) {
        String sql = """
            SELECT DATE_FORMAT(order_date, '%Y-%m') AS month,
                   COUNT(*) AS totalOrders
            FROM orders
            WHERE (? IS NULL OR YEAR(order_date)=?)
            GROUP BY DATE_FORMAT(order_date, '%Y-%m')
            ORDER BY month
        """;
        return jdbc.queryForList(sql, year, year);
    }

    public List<Map<String, Object>> getRevenueByMonth(Integer year) {
        String sql = """
            SELECT DATE_FORMAT(order_date, '%Y-%m') AS month,
                   SUM(total_amount) AS revenue
            FROM orders
            WHERE (? IS NULL OR YEAR(order_date)=?)
            GROUP BY DATE_FORMAT(order_date, '%Y-%m')
            ORDER BY month
        """;
        return jdbc.queryForList(sql, year, year);
    }

    // ===========================
    // TOP PRODUCTS
    // ===========================
    // Top products overall by quantity
    public List<Map<String, Object>> getTopProductsOverall(int limit) {
        String sql = """
            SELECT p.product_id,
                   p.name,
                   SUM(oi.quantity) AS totalSold
            FROM order_items oi
            JOIN products p ON p.product_id = oi.product_id
            GROUP BY p.product_id, p.name
            ORDER BY totalSold DESC
            LIMIT ?
        """;
        return jdbc.queryForList(sql, limit);
    }

    // Top products by month (YYYY-MM)
    public List<Map<String, Object>> getTopProductsByMonth(String month, int limit) {
        String sql = """
            SELECT p.product_id,
                   p.name,
                   SUM(oi.quantity) AS totalSold,
                   SUM(oi.line_total) AS revenue
            FROM order_items oi
            JOIN orders o ON o.id = oi.order_id
            JOIN products p ON p.product_id = oi.product_id
            WHERE DATE_FORMAT(o.order_date, '%Y-%m') = ?
            GROUP BY p.product_id, p.name
            ORDER BY totalSold DESC
            LIMIT ?
        """;
        return jdbc.queryForList(sql, month, limit);
    }

    // Top products by year
    public List<Map<String, Object>> getTopProductsByYear(int year, int limit) {
        String sql = """
            SELECT p.product_id,
                   p.name,
                   SUM(oi.quantity) AS totalSold,
                   SUM(oi.line_total) AS revenue
            FROM order_items oi
            JOIN orders o ON o.id = oi.order_id
            JOIN products p ON p.product_id = oi.product_id
            WHERE YEAR(o.order_date) = ?
            GROUP BY p.product_id, p.name
            ORDER BY totalSold DESC
            LIMIT ?
        """;
        return jdbc.queryForList(sql, year, limit);
    }

    // Top products by revenue (overall)
    public List<Map<String, Object>> getTopProductsByRevenue(int limit) {
        String sql = """
            SELECT p.product_id,
                   p.name,
                   SUM(oi.line_total) AS revenue
            FROM order_items oi
            JOIN products p ON p.product_id = oi.product_id
            GROUP BY p.product_id, p.name
            ORDER BY revenue DESC
            LIMIT ?
        """;
        return jdbc.queryForList(sql, limit);
    }

    // ===========================
    // CLIENTS
    // ===========================
    public List<Map<String, Object>> getTopClients(int limit) {
        String sql = """
            SELECT u.account_number AS client,
                   SUM(o.total_amount) AS revenue
            FROM orders o
            JOIN users u ON u.id = o.customer_id
            WHERE u.user_type = 'CUSTOMER'
            GROUP BY u.id, u.account_number
            ORDER BY revenue DESC
            LIMIT ?
        """;
        return jdbc.queryForList(sql, limit);
    }

    // ===========================
    // CATEGORY (uses products.category)
    // ===========================
    public List<Map<String, Object>> getRevenueByCategory(Integer year) {
        String sql = """
            SELECT COALESCE(p.category, 'UNKNOWN') AS category,
                   SUM(oi.line_total) AS revenue,
                   SUM(oi.quantity) AS totalSold
            FROM order_items oi
            JOIN orders o ON o.id = oi.order_id
            JOIN products p ON p.product_id = oi.product_id
            WHERE (? IS NULL OR YEAR(o.order_date)=?)
            GROUP BY COALESCE(p.category, 'UNKNOWN')
            ORDER BY revenue DESC
        """;
        return jdbc.queryForList(sql, year, year);
    }

    // Marge par catégorie (si cost est rempli)
    public List<Map<String, Object>> getMarginByCategory(Integer year) {
        String sql = """
            SELECT COALESCE(p.category, 'UNKNOWN') AS category,
                   SUM( (COALESCE(oi.unit_price,0) - COALESCE(p.cost,0)) * oi.quantity ) AS margin
            FROM order_items oi
            JOIN orders o ON o.id = oi.order_id
            JOIN products p ON p.product_id = oi.product_id
            WHERE (? IS NULL OR YEAR(o.order_date)=?)
            GROUP BY COALESCE(p.category, 'UNKNOWN')
            ORDER BY margin DESC
        """;
        return jdbc.queryForList(sql, year, year);
    }

    // Part (%) par catégorie (sur revenue)
    public List<Map<String, Object>> getCategoryShare(Integer year) {
        String sql = """
            SELECT t.category,
                   t.revenue,
                   ROUND(100 * t.revenue / NULLIF(s.totalRevenue,0), 2) AS sharePercent
            FROM (
              SELECT COALESCE(p.category, 'UNKNOWN') AS category,
                     SUM(oi.line_total) AS revenue
              FROM order_items oi
              JOIN orders o ON o.id = oi.order_id
              JOIN products p ON p.product_id = oi.product_id
              WHERE (? IS NULL OR YEAR(o.order_date)=?)
              GROUP BY COALESCE(p.category, 'UNKNOWN')
            ) t
            CROSS JOIN (
              SELECT SUM(oi2.line_total) AS totalRevenue
              FROM order_items oi2
              JOIN orders o2 ON o2.id = oi2.order_id
              WHERE (? IS NULL OR YEAR(o2.order_date)=?)
            ) s
            ORDER BY t.revenue DESC
        """;
        return jdbc.queryForList(sql, year, year, year, year);
    }
}
