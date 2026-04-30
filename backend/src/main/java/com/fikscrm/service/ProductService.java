package com.fikscrm.service;

import com.fikscrm.dto.ProductDTO;
import com.fikscrm.dto.ProductRequest;
import com.fikscrm.entity.Company;
import com.fikscrm.entity.Product;
import com.fikscrm.entity.User;
import com.fikscrm.exception.BadRequestException;
import com.fikscrm.exception.ResourceNotFoundException;
import com.fikscrm.repository.ProductRepository;
import com.fikscrm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<ProductDTO> getAll() {
        Long companyId = getCurrentUserCompanyId();
        return productRepository.findAllByCompanyIdOrderByNameAsc(companyId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductDTO getById(Long id) {
        return toDTO(findByIdAndValidateOwnership(id));
    }

    public ProductDTO create(ProductRequest req) {
        Long companyId = getCurrentUserCompanyId();

        if (req.getCode() != null && !req.getCode().isBlank()) {
            if (productRepository.existsByCompanyIdAndCode(companyId, req.getCode())) {
                throw new BadRequestException("Bu ürün kodu zaten kullanılmaktadır: " + req.getCode());
            }
        }

        Company company = new Company();
        company.setId(companyId);

        Product product = Product.builder()
                .code(req.getCode())
                .name(req.getName())
                .description(req.getDescription())
                .price(req.getPrice())
                .currency(req.getCurrency() != null ? req.getCurrency() : "TRY")
                .unit(req.getUnit())
                .category(req.getCategory())
                .status(req.getStatus() != null ? req.getStatus() : "Aktif")
                .company(company)
                .build();

        return toDTO(productRepository.save(product));
    }

    public ProductDTO update(Long id, ProductRequest req) {
        Product product = findByIdAndValidateOwnership(id);
        Long companyId = product.getCompany().getId();

        if (req.getCode() != null && !req.getCode().isBlank()) {
            if (productRepository.existsByCompanyIdAndCodeAndIdNot(companyId, req.getCode(), id)) {
                throw new BadRequestException("Bu ürün kodu zaten kullanılmaktadır: " + req.getCode());
            }
        }

        product.setCode(req.getCode());
        product.setName(req.getName());
        product.setDescription(req.getDescription());
        product.setPrice(req.getPrice());
        if (req.getCurrency() != null) product.setCurrency(req.getCurrency());
        product.setUnit(req.getUnit());
        product.setCategory(req.getCategory());
        if (req.getStatus() != null) product.setStatus(req.getStatus());

        return toDTO(productRepository.save(product));
    }

    public void delete(Long id) {
        productRepository.delete(findByIdAndValidateOwnership(id));
    }

    private Product findByIdAndValidateOwnership(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        Long companyId = getCurrentUserCompanyId();
        if (!product.getCompany().getId().equals(companyId)) {
            throw new ResourceNotFoundException("Product", "id", id);
        }
        return product;
    }

    private Long getCurrentUserCompanyId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        return user.getCompany().getId();
    }

    private ProductDTO toDTO(Product p) {
        return ProductDTO.builder()
                .id(p.getId())
                .code(p.getCode())
                .name(p.getName())
                .description(p.getDescription())
                .price(p.getPrice())
                .currency(p.getCurrency())
                .unit(p.getUnit())
                .category(p.getCategory())
                .status(p.getStatus())
                .companyId(p.getCompany().getId())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
