package com.electronics.backend.controller;

import com.electronics.backend.model.Magasinier;
import com.electronics.backend.repository.MagasinierRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/magasinier")
@CrossOrigin(origins = "*")
public class MagasinierController {

    private final MagasinierRepository magasinierRepository;

    public MagasinierController(MagasinierRepository magasinierRepository) {
        this.magasinierRepository = magasinierRepository;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getMagasinierDashboard() {
        try {
            return ResponseEntity.ok(Map.of(
                    "message", "Welcome to Magasinier Dashboard",
                    "features", List.of("Manage Inventory", "Track Stock", "Process Orders")
            ));
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllMagasiniers() {
        try {
            List<Magasinier> magasiniers = magasinierRepository.findAll();
            return ResponseEntity.ok(magasiniers);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getMagasinierById(@PathVariable Long id) {
        try {
            Optional<Magasinier> magasinier = magasinierRepository.findById(id);
            if (magasinier.isPresent()) {
                return ResponseEntity.ok(magasinier.get());
            } else {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Magasinier not found");
                return ResponseEntity.badRequest().body(errorResponse);
            }
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getMagasinierProfile() {
        try {
            return ResponseEntity.ok(Map.of("message", "Magasinier profile endpoint"));
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}
