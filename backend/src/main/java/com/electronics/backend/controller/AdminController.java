package com.electronics.backend.controller;

import com.electronics.backend.dto.MagasinierCreationDto;
import com.electronics.backend.model.Magasinier;
import com.electronics.backend.services.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final AuthService authService;

    // Constructeur manuel
    public AdminController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/magasiniers")
    public ResponseEntity<?> createMagasinier(@RequestBody MagasinierCreationDto dto) {
        try {
            Magasinier magasinier = authService.createMagasinier(dto);

            return ResponseEntity.ok(Map.of(
                    "message", "Magasinier created successfully",
                    "magasinierId", magasinier.getId()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/magasiniers")
    public ResponseEntity<List<Magasinier>> getAllMagasiniers() {
        return ResponseEntity.ok(List.of());
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, String>> getAdminDashboard() {
        return ResponseEntity.ok(Map.of("message", "Welcome to Admin Dashboard"));
    }

    @GetMapping("/customers")
    public ResponseEntity<Map<String, String>> getAllCustomers() {
        return ResponseEntity.ok(Map.of("message", "List of all customers"));
    }

    @GetMapping("/statistics")
    public ResponseEntity<Map<String, String>> getStatistics() {
        return ResponseEntity.ok(Map.of(
                "totalUsers", "150",
                "totalOrders", "45",
                "revenue", "€12,500"
        ));
    }
}
