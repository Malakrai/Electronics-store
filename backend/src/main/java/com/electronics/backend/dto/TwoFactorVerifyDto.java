package com.electronics.backend.dto;

public class TwoFactorVerifyDto {
    private Long userId;
    private String code;

    // Getters
    public Long getUserId() { return userId; }
    public String getCode() { return code; }
}
