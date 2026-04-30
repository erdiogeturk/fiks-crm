package com.fikscrm.service;

import com.fikscrm.dto.SalesDocumentDTO;
import com.fikscrm.dto.SalesDocumentItemDTO;
import com.fikscrm.dto.SalesDocumentItemRequest;
import com.fikscrm.dto.SalesDocumentRequest;
import com.fikscrm.entity.*;
import com.fikscrm.exception.ResourceNotFoundException;
import com.fikscrm.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class SalesDocumentService {

    private final SalesDocumentRepository salesDocumentRepository;
    private final CustomerRepository customerRepository;
    private final ContactRepository contactRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public List<SalesDocumentDTO> getAll() {
        Long companyId = getCurrentUserCompanyId();
        return salesDocumentRepository.findAllByCompanyIdOrderByCreatedAtDesc(companyId)
                .stream()
                .map(doc -> mapToDTO(doc, false))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SalesDocumentDTO getById(Long id) {
        Long companyId = getCurrentUserCompanyId();
        SalesDocument doc = salesDocumentRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("SalesDocument", "id", id));
        return mapToDTO(doc, true);
    }

    @Transactional(readOnly = true)
    public List<SalesDocumentDTO> getByCustomer(Long customerId) {
        Long companyId = getCurrentUserCompanyId();
        return salesDocumentRepository.findAllByCompanyIdAndCustomerIdOrderByCreatedAtDesc(companyId, customerId)
                .stream()
                .map(doc -> mapToDTO(doc, false))
                .collect(Collectors.toList());
    }

    public SalesDocumentDTO create(SalesDocumentRequest req) {
        User currentUser = getCurrentUser();

        Customer customer = customerRepository.findById(req.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", req.getCustomerId()));

        Contact contact = null;
        if (req.getContactId() != null) {
            contact = contactRepository.findById(req.getContactId())
                    .orElseThrow(() -> new ResourceNotFoundException("Contact", "id", req.getContactId()));
        }

        SalesDocument doc = SalesDocument.builder()
                .documentNo(UUID.randomUUID().toString())
                .documentType(req.getDocumentType())
                .documentDate(req.getDocumentDate())
                .dueDate(req.getDueDate())
                .customer(customer)
                .contact(contact)
                .status(req.getStatus() != null ? req.getStatus() : "TASLAK")
                .currency(req.getCurrency() != null ? req.getCurrency() : "TRY")
                .notes(req.getNotes())
                .company(currentUser.getCompany())
                .createdBy(currentUser)
                .build();

        doc = salesDocumentRepository.save(doc);
        doc.setDocumentNo("SD" + String.format("%06d", doc.getId()));

        if (req.getItems() != null && !req.getItems().isEmpty()) {
            List<SalesDocumentItem> items = buildItems(req.getItems(), doc);
            doc.setItems(items);
        }

        recomputeTotals(doc);
        doc = salesDocumentRepository.save(doc);
        return mapToDTO(doc, true);
    }

    public SalesDocumentDTO update(Long id, SalesDocumentRequest req) {
        Long companyId = getCurrentUserCompanyId();
        SalesDocument doc = salesDocumentRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("SalesDocument", "id", id));

        Customer customer = customerRepository.findById(req.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", req.getCustomerId()));

        Contact contact = null;
        if (req.getContactId() != null) {
            contact = contactRepository.findById(req.getContactId())
                    .orElseThrow(() -> new ResourceNotFoundException("Contact", "id", req.getContactId()));
        }

        doc.setDocumentType(req.getDocumentType());
        doc.setDocumentDate(req.getDocumentDate());
        doc.setDueDate(req.getDueDate());
        doc.setCustomer(customer);
        doc.setContact(contact);
        if (req.getStatus() != null) doc.setStatus(req.getStatus());
        if (req.getCurrency() != null) doc.setCurrency(req.getCurrency());
        doc.setNotes(req.getNotes());

        // Replace items: clear existing (orphanRemoval handles deletion), add new ones
        doc.getItems().clear();
        if (req.getItems() != null && !req.getItems().isEmpty()) {
            List<SalesDocumentItem> newItems = buildItems(req.getItems(), doc);
            doc.getItems().addAll(newItems);
        }

        recomputeTotals(doc);
        doc = salesDocumentRepository.save(doc);
        return mapToDTO(doc, true);
    }

    public void delete(Long id) {
        Long companyId = getCurrentUserCompanyId();
        SalesDocument doc = salesDocumentRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("SalesDocument", "id", id));
        salesDocumentRepository.delete(doc);
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private List<SalesDocumentItem> buildItems(List<SalesDocumentItemRequest> requests, SalesDocument doc) {
        List<SalesDocumentItem> items = new ArrayList<>();
        int order = 0;
        for (SalesDocumentItemRequest itemReq : requests) {
            Product product = null;
            if (itemReq.getProductId() != null) {
                product = productRepository.findById(itemReq.getProductId()).orElse(null);
            }

            BigDecimal qty = itemReq.getQuantity() != null ? itemReq.getQuantity() : BigDecimal.ONE;
            BigDecimal price = itemReq.getUnitPrice() != null ? itemReq.getUnitPrice() : BigDecimal.ZERO;
            BigDecimal discount = itemReq.getDiscountRate() != null ? itemReq.getDiscountRate() : BigDecimal.ZERO;
            BigDecimal lineTotal = qty.multiply(price)
                    .multiply(BigDecimal.ONE.subtract(discount.divide(new BigDecimal("100"))));

            SalesDocumentItem item = SalesDocumentItem.builder()
                    .salesDocument(doc)
                    .product(product)
                    .productName(itemReq.getProductName())
                    .description(itemReq.getDescription())
                    .quantity(qty)
                    .unitPrice(price)
                    .discountRate(discount)
                    .lineTotal(lineTotal)
                    .unit(itemReq.getUnit())
                    .sortOrder(itemReq.getSortOrder() != null ? itemReq.getSortOrder() : order)
                    .build();

            items.add(item);
            order++;
        }
        return items;
    }

    private void recomputeTotals(SalesDocument doc) {
        BigDecimal subtotal = doc.getItems().stream()
                .map(SalesDocumentItem::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        doc.setSubtotal(subtotal);
        doc.setDiscountTotal(BigDecimal.ZERO);
        doc.setTotalAmount(subtotal);
    }

    private SalesDocumentDTO mapToDTO(SalesDocument doc, boolean includeItems) {
        SalesDocumentDTO.SalesDocumentDTOBuilder builder = SalesDocumentDTO.builder()
                .id(doc.getId())
                .documentNo(doc.getDocumentNo())
                .documentType(doc.getDocumentType())
                .documentDate(doc.getDocumentDate())
                .dueDate(doc.getDueDate())
                .customerId(doc.getCustomer().getId())
                .customerName(doc.getCustomer().getName())
                .contactId(doc.getContact() != null ? doc.getContact().getId() : null)
                .contactName(doc.getContact() != null ? doc.getContact().getName() : null)
                .status(doc.getStatus())
                .currency(doc.getCurrency())
                .subtotal(doc.getSubtotal())
                .discountTotal(doc.getDiscountTotal())
                .totalAmount(doc.getTotalAmount())
                .notes(doc.getNotes())
                .companyId(doc.getCompany().getId())
                .createdByName(doc.getCreatedBy() != null
                        ? doc.getCreatedBy().getFirstName() + " " + doc.getCreatedBy().getLastName()
                        : null)
                .createdAt(doc.getCreatedAt());

        if (includeItems) {
            List<SalesDocumentItemDTO> itemDTOs = doc.getItems().stream()
                    .map(this::mapItemToDTO)
                    .collect(Collectors.toList());
            builder.items(itemDTOs);
        }

        return builder.build();
    }

    private SalesDocumentItemDTO mapItemToDTO(SalesDocumentItem item) {
        return SalesDocumentItemDTO.builder()
                .id(item.getId())
                .salesDocumentId(item.getSalesDocument().getId())
                .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                .productName(item.getProductName())
                .description(item.getDescription())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .discountRate(item.getDiscountRate())
                .lineTotal(item.getLineTotal())
                .unit(item.getUnit())
                .sortOrder(item.getSortOrder())
                .build();
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
    }

    private Long getCurrentUserCompanyId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        return user.getCompany().getId();
    }
}
