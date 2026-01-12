package com.electronics.backend.controller;

import com.electronics.backend.dto.AdminCreateUserDto;
import com.electronics.backend.dto.AdminUpdateUserDto;
import com.electronics.backend.model.User;
import com.electronics.backend.services.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminUsersController {

    private final AuthService authService;

    public AdminUsersController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getUsers() {
        return ResponseEntity.ok(authService.getAllUsers());
    }

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody AdminCreateUserDto dto) {
        try {
            User created = authService.adminCreateUser(dto);
            return ResponseEntity.ok(Map.of(
                    "message", "User created",
                    "id", created.getId(),
                    "email", created.getEmail(),
                    "firstName", created.getFirstName(),
                    "lastName", created.getLastName(),
                    "userType", created.getUserType()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }


    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody AdminUpdateUserDto dto) {
        try {
            User updated = authService.adminUpdateUser(id, dto);
            return ResponseEntity.ok(Map.of(
                    "message", "User updated",
                    "id", updated.getId(),
                    "email", updated.getEmail(),
                    "firstName", updated.getFirstName(),
                    "lastName", updated.getLastName(),
                    "userType", updated.getUserType(),
                    "enabled", updated.isEnabled()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            authService.adminDeleteUser(id);
            return ResponseEntity.ok(Map.of(
                    "message", "User deleted",
                    "id", id
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
