package com.electronics.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @GetMapping("/public")
    public Map<String, String> publicEndpoint() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "This is a public endpoint");
        return response;
    }

    @GetMapping("/admin")
    public Map<String, String> adminEndpoint() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "This is an admin endpoint");
        return response;
    }

    @GetMapping("/magasinier")
    public Map<String, String> magasinierEndpoint() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "This is a magasinier endpoint");
        return response;
    }

    @GetMapping("/customer")
    public Map<String, String> customerEndpoint() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "This is a customer endpoint");
        return response;
    }

    @GetMapping("/authenticated")
    public Map<String, String> authenticatedEndpoint() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "This is for any authenticated user");
        return response;
    }
}
