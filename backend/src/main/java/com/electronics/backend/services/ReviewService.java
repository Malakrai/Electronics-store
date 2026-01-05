package com.electronics.backend.services;

import com.electronics.backend.model.Review;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ReviewService {

    private final List<Review> reviews = new ArrayList<>();

    public List<Review> getAll() { return reviews; }

    public Review addReview(int rating, String comment) {
        Review r = new Review(rating, comment);
        reviews.add(r);
        return r;
    }
}
