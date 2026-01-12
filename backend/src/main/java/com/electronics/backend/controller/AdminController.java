package com.electronics.backend.controller;

import com.electronics.backend.dto.MagasinierCreationDto;
import com.electronics.backend.dto.MagasinierUpdateDto;
import com.electronics.backend.model.Magasinier;
import com.electronics.backend.services.AuthService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
@Slf4j
public class AdminController {

    private final AuthService authService;

    public AdminController(AuthService authService) {
        this.authService = authService;
    }

    // ========== CRÉATION D'UN MAGASINIER ==========
    @PostMapping("/magasiniers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createMagasinier(@Valid @RequestBody MagasinierCreationDto dto) {
        try {
            log.info("=== ADMIN: Création d'un magasinier ===");
            log.info("Données reçues: {}", dto);

            // Remove duplicate validation since @Valid handles it
            Magasinier magasinier = authService.createMagasinier(dto);

            log.info("Magasinier créé avec succès. ID: {}, Email: {}", magasinier.getId(), magasinier.getEmail());

            return ResponseEntity.ok(Map.of(
                    "message", "Magasinier créé avec succès",
                    "id", magasinier.getId(),
                    "email", magasinier.getEmail(),
                    "firstName", magasinier.getFirstName(),
                    "lastName", magasinier.getLastName(),
                    "userType", magasinier.getUserType()
            ));
        } catch (Exception e) {
            log.error("Erreur lors de la création du magasinier: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ========== LISTE DE TOUS LES MAGASINIERS ==========
    @GetMapping("/magasiniers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllMagasiniers() {
        try {
            log.info("=== ADMIN: Récupération de tous les magasiniers ===");

            List<Magasinier> magasiniers = authService.getAllMagasiniers();

            log.info("Nombre de magasiniers trouvés: {}", magasiniers.size());

            // Explicitly specify Map<String, Object>
            List<Map<String, Object>> formattedMagasiniers = magasiniers.stream()
                    .map(m -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("id", m.getId());
                        map.put("firstName", m.getFirstName() != null ? m.getFirstName() : "");
                        map.put("lastName", m.getLastName() != null ? m.getLastName() : "");
                        map.put("email", m.getEmail() != null ? m.getEmail() : "");
                        map.put("role", "MAGASINIER");
                        map.put("userType", m.getUserType() != null ? m.getUserType() : "MAGASINIER");
                        map.put("phone", m.getPhone() != null ? m.getPhone() : "");
                        map.put("address", m.getAddress() != null ? m.getAddress() : "");
                        map.put("enabled", m.isEnabled());
                        return map;
                    })
                    .toList();

            return ResponseEntity.ok(formattedMagasiniers);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des magasiniers: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ========== RÉCUPÉRATION D'UN MAGASINIER PAR ID ==========
    @GetMapping("/magasiniers/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getMagasinierById(@PathVariable Long id) {
        try {
            log.info("=== ADMIN: Récupération du magasinier avec ID: {} ===", id);

            Magasinier magasinier = authService.getMagasinierById(id);

            Map<String, Object> response = Map.of(
                    "id", magasinier.getId(),
                    "firstName", magasinier.getFirstName() != null ? magasinier.getFirstName() : "",
                    "lastName", magasinier.getLastName() != null ? magasinier.getLastName() : "",
                    "email", magasinier.getEmail() != null ? magasinier.getEmail() : "",
                    "role", "MAGASINIER",
                    "userType", magasinier.getUserType() != null ? magasinier.getUserType() : "MAGASINIER",
                    "phone", magasinier.getPhone() != null ? magasinier.getPhone() : "",
                    "address", magasinier.getAddress() != null ? magasinier.getAddress() : "",
                    "enabled", magasinier.isEnabled()
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération du magasinier ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ========== MISE À JOUR D'UN MAGASINIER ==========
    @PutMapping("/magasiniers/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateMagasinier(
            @PathVariable Long id,
            @Valid @RequestBody MagasinierUpdateDto dto) {
        try {
            log.info("=== ADMIN: Mise à jour du magasinier ID: {} ===", id);
            log.info("Données de mise à jour: {}", dto);

            Magasinier updatedMagasinier = authService.updateMagasinier(id, dto);

            log.info("Magasinier mis à jour avec succès. ID: {}", id);

            return ResponseEntity.ok(Map.of(
                    "message", "Magasinier mis à jour avec succès",
                    "id", updatedMagasinier.getId(),
                    "email", updatedMagasinier.getEmail(),
                    "firstName", updatedMagasinier.getFirstName(),
                    "lastName", updatedMagasinier.getLastName(),
                    "userType", updatedMagasinier.getUserType()
            ));
        } catch (Exception e) {
            log.error("Erreur lors de la mise à jour du magasinier ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ========== SUPPRESSION D'UN MAGASINIER ==========
    @DeleteMapping("/magasiniers/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteMagasinier(@PathVariable Long id) {
        try {
            log.info("=== ADMIN: Suppression du magasinier ID: {} ===", id);

            // Vérifier d'abord si le magasinier existe
            authService.getMagasinierById(id);

            // Supprimer le magasinier
            authService.deleteMagasinier(id);

            log.info("Magasinier supprimé avec succès. ID: {}", id);

            return ResponseEntity.ok(Map.of(
                    "message", "Magasinier supprimé avec succès",
                    "id", id
            ));
        } catch (Exception e) {
            log.error("Erreur lors de la suppression du magasinier ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ========== DASHBOARD ADMIN ==========
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAdminDashboard() {
        log.info("=== ADMIN: Accès au tableau de bord ===");

        try {
            // Récupérer les statistiques
            long totalMagasiniers = authService.getAllMagasiniers().size();
            // Note: Vous devrez ajouter d'autres services pour les autres statistiques

            return ResponseEntity.ok(Map.of(
                    "message", "Bienvenue sur le tableau de bord administrateur",
                    "statistics", Map.of(
                            "totalMagasiniers", totalMagasiniers,
                            "totalCustomers", 0, // À implémenter
                            "totalAdmins", 0, // À implémenter
                            "activeUsers", totalMagasiniers
                    ),
                    "timestamp", System.currentTimeMillis()
            ));
        } catch (Exception e) {
            log.error("Erreur lors de l'accès au dashboard: {}", e.getMessage(), e);
            return ResponseEntity.ok(Map.of(
                    "message", "Tableau de bord administrateur",
                    "error", "Impossible de charger les statistiques",
                    "timestamp", System.currentTimeMillis()
            ));
        }
    }

    // ========== ACTIVATION/DÉSACTIVATION D'UN MAGASINIER ==========
    @PatchMapping("/magasiniers/{id}/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> toggleMagasinierStatus(@PathVariable Long id) {
        try {
            log.info("=== ADMIN: Changement de statut du magasinier ID: {} ===", id);

            Magasinier magasinier = authService.getMagasinierById(id);

            // Créer un DTO pour mettre à jour uniquement le statut
            MagasinierUpdateDto dto = new MagasinierUpdateDto();
            dto.setEnabled(!magasinier.isEnabled());

            Magasinier updatedMagasinier = authService.updateMagasinier(id, dto);

            String status = updatedMagasinier.isEnabled() ? "activé" : "désactivé";

            log.info("Magasinier {} avec succès. ID: {}", status, id);

            return ResponseEntity.ok(Map.of(
                    "message", "Magasinier " + status + " avec succès",
                    "id", updatedMagasinier.getId(),
                    "enabled", updatedMagasinier.isEnabled()
            ));
        } catch (Exception e) {
            log.error("Erreur lors du changement de statut du magasinier ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
