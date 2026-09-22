package com.example.spare_parts_service.repository;

import com.example.spare_parts_service.entity.PartCategory;
import com.example.spare_parts_service.entity.SparePart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface SparePartRepository extends JpaRepository<SparePart, Long> {

    List<SparePart> findByActiveTrueOrderByPartNameAsc();

    Optional<SparePart> findByIdAndActiveTrue(Long id);

    Optional<SparePart> findByPartNumberAndActiveTrue(String partNumber);

    List<SparePart> findByCategoryAndActiveTrueOrderByPartNameAsc(PartCategory category);

    boolean existsByPartNumberAndActiveTrue(String partNumber);

    // Low stock: quantity <= minimum_stock
    @Query("SELECT p FROM SparePart p WHERE p.active = true AND p.quantity <= p.minimumStock ORDER BY p.quantity ASC")
    List<SparePart> findLowStockParts();
}