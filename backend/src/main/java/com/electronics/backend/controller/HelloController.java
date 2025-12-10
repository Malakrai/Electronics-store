package com.electronics.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.electronics.backend.dto.HelloResponse;

@RestController
@RequestMapping("/api")
public class HelloController {

    @GetMapping("/")
    public HelloResponse hello(){
        return new HelloResponse("Hello from Authorized API request.");
    }

}
