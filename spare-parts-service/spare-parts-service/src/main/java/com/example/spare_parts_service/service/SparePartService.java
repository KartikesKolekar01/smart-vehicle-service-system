package com.example.spare_parts_service.service;

import com.example.spare_parts_service.dto.request.SparePartRequest;
import com.example.spare_parts_service.dto.request.StockUpdateRequest;
import com.example.spare_parts_service.dto.response.SparePartResponse;
import com.example.spare_parts_service.dto.response.SparePartSummaryResponse;
import com.example.spare_parts_service.entity.PartCategory;
import com.example.spare_parts_service.entity.SparePart;
import com.example.spare_parts_service.exception.DuplicateResourceException;
import com.example.spare_parts_service.exception.ResourceNotFoundException;
import com.example.spare_parts_service.exception.UnauthorizedActionException;
import com.example.spare_parts_service.repository.SparePartRepository;
import com.example.spare_parts_service.security.UserContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SparePartService {

    private final SparePartRepository sparePartRepository;
    private final UserContext userContext;

    // ────────────────────────────────────────────────────────
    // 1. ADD SPARE PART (Admin)
    // ────────────────────────────────────────────────────────
    @Transactional
    public SparePartResponse addPart(SparePartRequest request) {
        if (!userContext.isAdmin()) {
            throw new UnauthorizedActionException("Only Admin can add spare parts");
        }

        if (sparePartRepository.existsByPartNumberAndActiveTrue(request.getPartNumber())) {
            throw new DuplicateResourceException(
                    "Part with number " + request.getPartNumber() + " already exists"
            );
        }

        SparePart part = new SparePart();
        part.setPartName(request.getPartName());
        part.setPartNumber(request.getPartNumber().toUpperCase());
        part.setCategory(request.getCategory());
        part.setPrice(request.getPrice());
        part.setQuantity(request.getQuantity());
        part.setMinimumStock(request.getMinimumStock());
        part.setSupplier(request.getSupplier());
        part.setDescription(request.getDescription());
        part.setActive(true);

        SparePart saved = sparePartRepository.save(part);

        // Low stock check
        if (saved.getQuantity() <= saved.getMinimumStock()) {
            log.warn("⚠️ LOW STOCK: {} ({}) — Quantity: {}, Minimum: {}",
                    saved.getPartName(), saved.getPartNumber(),
                    saved.getQuantity(), saved.getMinimumStock());
        }

        log.info("Spare part added: {}", saved.getPartNumber());
        return toResponse(saved);
    }

    // ────────────────────────────────────────────────────────
    // 2. GET ALL PARTS
    // ────────────────────────────────────────────────────────
    public List<SparePartSummaryResponse> getAllParts() {
        return sparePartRepository.findByActiveTrueOrderByPartNameAsc()
                .stream().map(this::toSummary).collect(Collectors.toList());
    }

    // ────────────────────────────────────────────────────────
    // 3. GET BY ID
    // ────────────────────────────────────────────────────────
    public SparePartResponse getPartById(Long id) {
        SparePart part = sparePartRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Spare part not found: " + id));
        return toResponse(part);
    }

    // ────────────────────────────────────────────────────────
    // 4. GET BY CATEGORY
    // ────────────────────────────────────────────────────────
    public List<SparePartSummaryResponse> getByCategory(PartCategory category) {
        return sparePartRepository.findByCategoryAndActiveTrueOrderByPartNameAsc(category)
                .stream().map(this::toSummary).collect(Collectors.toList());
    }

    // ────────────────────────────────────────────────────────
    // 5. GET LOW-STOCK PARTS (Admin)
    // ────────────────────────────────────────────────────────
    public List<SparePartSummaryResponse> getLowStockParts() {
        if (!userContext.isAdmin()) {
            throw new UnauthorizedActionException("Only Admin can view low-stock parts");
        }
        return sparePartRepository.findLowStockParts()
                .stream().map(this::toSummary).collect(Collectors.toList());
    }

    // ────────────────────────────────────────────────────────
    // 6. UPDATE PART (Admin)
    // ────────────────────────────────────────────────────────
    @Transactional
    public SparePartResponse updatePart(Long id, SparePartRequest request) {
        if (!userContext.isAdmin()) {
            throw new UnauthorizedActionException("Only Admin can update spare parts");
        }

        SparePart part = sparePartRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Spare part not found: " + id));

        // If part number changed, check for duplicates
        if (!part.getPartNumber().equalsIgnoreCase(request.getPartNumber())
                && sparePartRepository.existsByPartNumberAndActiveTrue(request.getPartNumber())) {
            throw new DuplicateResourceException(
                    "Part with number " + request.getPartNumber() + " already exists"
            );
        }

        part.setPartName(request.getPartName());
        part.setPartNumber(request.getPartNumber().toUpperCase());
        part.setCategory(request.getCategory());
        part.setPrice(request.getPrice());
        part.setQuantity(request.getQuantity());
        part.setMinimumStock(request.getMinimumStock());
        part.setSupplier(request.getSupplier());
        part.setDescription(request.getDescription());

        SparePart updated = sparePartRepository.save(part);

        if (updated.getQuantity() <= updated.getMinimumStock()) {
            log.warn("⚠️ LOW STOCK: {} ({}) — Quantity: {}, Minimum: {}",
                    updated.getPartName(), updated.getPartNumber(),
                    updated.getQuantity(), updated.getMinimumStock());
        }

        log.info("Spare part updated: {}", id);
        return toResponse(updated);
    }

    // ────────────────────────────────────────────────────────
    // 7. UPDATE STOCK (Admin)
    // ────────────────────────────────────────────────────────
    @Transactional
    public SparePartResponse updateStock(Long id, StockUpdateRequest request) {
        if (!userContext.isAdmin()) {
            throw new UnauthorizedActionException("Only Admin can update stock");
        }

        SparePart part = sparePartRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Spare part not found: " + id));

        part.setQuantity(request.getQuantity());
        SparePart updated = sparePartRepository.save(part);

        if (updated.getQuantity() <= updated.getMinimumStock()) {
            log.warn("⚠️ LOW STOCK: {} — Quantity: {}, Minimum: {}",
                    updated.getPartName(), updated.getQuantity(), updated.getMinimumStock());
        }

        log.info("Stock updated for {}: {}", updated.getPartName(), request.getQuantity());
        return toResponse(updated);
    }

    // ────────────────────────────────────────────────────────
    // 8. SOFT DELETE (Admin)
    // ────────────────────────────────────────────────────────
    @Transactional
    public void deletePart(Long id) {
        if (!userContext.isAdmin()) {
            throw new UnauthorizedActionException("Only Admin can delete spare parts");
        }

        SparePart part = sparePartRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Spare part not found: " + id));

        part.setActive(false);
        sparePartRepository.save(part);
        log.info("Spare part soft-deleted: {}", id);
    }

    // ────────────────────────────────────────────────────────
    // HELPERS
    // ────────────────────────────────────────────────────────
    private SparePartResponse toResponse(SparePart p) {
        boolean lowStock = p.getQuantity() <= p.getMinimumStock();
        return new SparePartResponse(
                p.getId(),
                p.getPartName(),
                p.getPartNumber(),
                p.getCategory(),
                p.getPrice(),
                p.getQuantity(),
                p.getMinimumStock(),
                p.getSupplier(),
                p.getDescription(),
                lowStock,
                p.getCreatedAt(),
                p.getUpdatedAt()
        );
    }

    private SparePartSummaryResponse toSummary(SparePart p) {
        boolean lowStock = p.getQuantity() <= p.getMinimumStock();
        return new SparePartSummaryResponse(
                p.getId(),
                p.getPartName(),
                p.getPartNumber(),
                p.getCategory(),
                p.getPrice(),
                p.getQuantity(),
                lowStock
        );
    }
}