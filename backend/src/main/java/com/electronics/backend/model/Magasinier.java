package com.electronics.backend.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("MAGASINIER")
public class Magasinier extends User {

    private String department;

    // ⚠️ Renommé pour éviter le conflit avec la colonne employee_id
    // car Hibernate crée automatiquement employee_id pour l’héritage JOINED
    private String employeeCode;

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getEmployeeCode() {
        return employeeCode;
    }

    public void setEmployeeCode(String employeeCode) {
        this.employeeCode = employeeCode;
    }
}
