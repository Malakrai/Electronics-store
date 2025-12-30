package com.electronics.backend.controller;

import com.electronics.backend.model.Customer;
import com.electronics.backend.model.User;
import com.electronics.backend.repository.CustomerRepository;
import com.electronics.backend.repository.UserRepository;
import com.electronics.backend.utils.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.Serializable;
import java.nio.file.*;
import java.util.Map;

@RestController
@RequestMapping("/api/customer")
@CrossOrigin(origins = "*")
public class CustomerController {

    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public CustomerController(CustomerRepository customerRepository,
                              UserRepository userRepository,
                              JwtUtil jwtUtil) {
        this.customerRepository = customerRepository;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    private String getEmail(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            throw new RuntimeException("Invalid Authorization header");
        }
        return jwtUtil.extractUsername(header.substring(7));
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(HttpServletRequest request) {
        try {
            String email = getEmail(request);

            Customer c = (Customer) userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            ResponseEntity<Map<String, ? extends Serializable>> ok = ResponseEntity.ok(Map.of(
                    "id", c.getId(),
                    "email", c.getEmail(),
                    "firstName", c.getFirstName(),
                    "lastName", c.getLastName(),
                    "phone", c.getPhone() != null ? c.getPhone() : "",
                    "address", c.getAddress() != null ? c.getAddress() : "",
                    "profileImage", c.getProfileImage() != null ? c.getProfileImage() : ""
            ));
            return ok;
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @RequestBody Map<String, String> body,
            HttpServletRequest request) {

        try {
            String email = getEmail(request);

            Customer c = (Customer) userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            c.setFirstName(body.get("firstName"));
            c.setLastName(body.get("lastName"));
            c.setPhone(body.get("phone"));
            c.setAddress(body.get("address"));

            customerRepository.save(c);

            return ResponseEntity.ok(Map.of("message", "Profile updated"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/profile/image")
    public ResponseEntity<?> uploadImage(
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request) {

        try {
            String email = getEmail(request);

            Customer c = (Customer) userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String dir = "uploads/customers/";
            Files.createDirectories(Paths.get(dir));

            String filename = c.getId() + "_" + file.getOriginalFilename();
            Path path = Paths.get(dir + filename);

            Files.write(path, file.getBytes());

            c.setProfileImage("customers/" + filename);
            customerRepository.save(c);

            return ResponseEntity.ok(Map.of(
                    "message", "Image uploaded",
                    "image", "customers/" + filename
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
