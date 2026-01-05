package com.electronics.backend.controller;

import com.electronics.backend.model.Review;
import com.electronics.backend.service.ReviewService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "http://localhost:4200")
public class ReviewController {

    private final ReviewService service;

    public ReviewController(ReviewService service) {
        this.service = service;
    }

    @GetMapping
    public List<Review> getAll() {
        return service.getAll();
    }

    @PostMapping
    public Review add(@RequestParam int rating, @RequestParam String comment) {
        return service.addReview(rating, comment);
    }
}
