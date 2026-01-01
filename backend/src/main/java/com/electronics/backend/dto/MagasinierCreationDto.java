package com.electronics.backend.dto;

public class MagasinierCreationDto {
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String department;
    private String employeeId;

    // Getters
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public String getDepartment() { return department; }
    public String getEmployeeId() { return employeeId; }

    // Setters
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public void setEmail(String email) { this.email = email; }
    public void setPassword(String password) { this.password = password; }
    public void setDepartment(String department) { this.department = department; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }
}
