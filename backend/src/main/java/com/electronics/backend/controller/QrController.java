package com.electronics.backend.controller;

import com.electronics.backend.model.Qr;
import com.electronics.backend.services.QrService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/qr")
@CrossOrigin(origins = "*")
public class QrController {

    private final QrService qrService;

    public QrController(QrService qrService) {
        this.qrService = qrService;
    }

    @GetMapping
    public ResponseEntity<?> getAllQrs() {
        try {
            List<Qr> qrs = qrService.getAllQrs();
            List<Map<String, Object>> response = qrs.stream()
                    .map(qr -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("id", qr.getIdQr());
                        map.put("email", qr.getEmail());
                        map.put("status", qr.getStatus());
                        return map;
                    })
                    .collect(Collectors.toList());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/{email}")
    public ResponseEntity<?> getQrByEmail(@PathVariable String email) {
        try {
            Qr qr = qrService.getQrByEmail(email);
            Map<String, Object> response = new HashMap<>();
            response.put("id", qr.getIdQr());
            response.put("email", qr.getEmail());
            response.put("status", qr.getStatus());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/associate/{email}")
    public ResponseEntity<?> associateQr(@PathVariable String email) {
        try {
            Qr qr = qrService.associateQr(email);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "QR code associated successfully");
            response.put("email", qr.getEmail());
            response.put("status", qr.getStatus());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteQr(@PathVariable Long id) {
        try {
            qrService.deleteQr(id);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "QR code deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}
