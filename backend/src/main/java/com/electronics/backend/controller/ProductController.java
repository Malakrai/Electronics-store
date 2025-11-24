package com.electronics.backend.controller;

import com.electronics.backend.model.Product;
import com.electronics.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @GetMapping("/")
    @ResponseBody
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

}
