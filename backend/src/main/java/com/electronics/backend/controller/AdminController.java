package com.electronics.backend.controller;

import com.electronics.backend.dto.MagasinierCreationDto;
import com.electronics.backend.dto.MagasinierUpdateDto;
import com.electronics.backend.model.Magasinier;
import com.electronics.backend.services.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final AuthService authService;

    public AdminController(AuthService authService) {
        this.authService = authService;
    }

    // CREATE
    @PostMapping("/magasiniers")
    public ResponseEntity<?> createMagasinier(@Valid @RequestBody MagasinierCreationDto dto) {
        try {
            Magasinier magasinier = authService.createMagasinier(dto);

            return ResponseEntity.ok(Map.of(
                    "message", "Magasinier created successfully",
                    "id", magasinier.getId(),
                    "email", magasinier.getEmail(),
                    "firstName", magasinier.getFirstName(),
                    "lastName", magasinier.getLastName()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // READ ALL
    @GetMapping("/magasiniers")
    public ResponseEntity<?> getAllMagasiniers() {
        try {
            List<Magasinier> magasiniers = authService.getAllMagasiniers();
            return ResponseEntity.ok(magasiniers);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // READ ONE
    @GetMapping("/magasiniers/{id}")
    public ResponseEntity<?> getMagasinierById(@PathVariable Long id) {
        try {
            Magasinier magasinier = authService.getMagasinierById(id);
            return ResponseEntity.ok(magasinier);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // UPDATE
    @PutMapping("/magasiniers/{id}")
    public ResponseEntity<?> updateMagasinier(
            @PathVariable Long id,
            @Valid @RequestBody MagasinierUpdateDto dto) {
        try {
            Magasinier updatedMagasinier = authService.updateMagasinier(id, dto);
            return ResponseEntity.ok(Map.of(
                    "message", "Magasinier updated successfully",
                    "id", updatedMagasinier.getId()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // DELETE
    @DeleteMapping("/magasiniers/{id}")
    public ResponseEntity<?> deleteMagasinier(@PathVariable Long id) {
        try {
            authService.deleteMagasinier(id);
            return ResponseEntity.ok(Map.of(
                    "message", "Magasinier deleted successfully",
                    "id", id
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // DASHBOARD
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, String>> getAdminDashboard() {
        return ResponseEntity.ok(Map.of("message", "Welcome to Admin Dashboard"));
    }

    // CUSTOMERS
    @GetMapping("/customers")
    public ResponseEntity<Map<String, String>> getAllCustomers() {
        return ResponseEntity.ok(Map.of("message", "List of all customers"));
    }

    // STATISTICS
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, String>> getStatistics() {
        return ResponseEntity.ok(Map.of(
                "totalUsers", "150",
                "totalOrders", "45",
                "revenue", "€12,500"
        ));
    }
}
