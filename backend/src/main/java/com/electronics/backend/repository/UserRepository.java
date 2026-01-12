package com.electronics.backend.repository;

import com.electronics.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    // Supprimez la méthode problématique
    // List<User> findByUserTypeIgnoreCase(String userType);

    // Utilisez une requête JPQL qui accède au discriminator
    @Query("SELECT u FROM User u WHERE TYPE(u) = :clazz")
    List<User> findByClass(Class<? extends User> clazz);

    // Ou utilisez une requête native pour accéder à user_type
    @Query(value = "SELECT * FROM users WHERE user_type = ?1", nativeQuery = true)
    List<User> findByUserTypeNative(String userType);

    // Ou utilisez cette méthode plus simple
    @Query("SELECT u FROM User u")
    List<User> findAllUsers();
}
