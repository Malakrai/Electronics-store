package com.electronics.backend.repository;

import com.electronics.backend.model.Magasinier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MagasinierRepository extends JpaRepository<Magasinier, Long> {

    Optional<Magasinier> findByEmail(String email);

    boolean existsByEmail(String email);

    // Recherche par mot-clé
    @Query("SELECT m FROM Magasinier m WHERE " +
            "LOWER(m.firstName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(m.lastName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(m.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(m.phone) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(m.address) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Magasinier> searchByKeyword(@Param("keyword") String keyword);
}
