package com.fikscrm.controller;

import com.fikscrm.dto.ApiResponse;
import com.fikscrm.dto.ContactDTO;
import com.fikscrm.dto.ContactRequest;
import com.fikscrm.service.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/contacts")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<ApiResponse<List<ContactDTO>>> getContactsByCustomer(@PathVariable Long customerId) {
        List<ContactDTO> contacts = contactService.getContactsByCustomer(customerId);
        return ResponseEntity.ok(ApiResponse.success(contacts));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ContactDTO>> getContactById(@PathVariable Long id) {
        ContactDTO contact = contactService.getContactById(id);
        return ResponseEntity.ok(ApiResponse.success(contact));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ContactDTO>> createContact(@Valid @RequestBody ContactRequest request) {
        ContactDTO contact = contactService.createContact(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Contact created successfully", contact));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ContactDTO>> updateContact(
            @PathVariable Long id, 
            @Valid @RequestBody ContactRequest request) {
        ContactDTO contact = contactService.updateContact(id, request);
        return ResponseEntity.ok(ApiResponse.success("Contact updated successfully", contact));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteContact(@PathVariable Long id) {
        contactService.deleteContact(id);
        return ResponseEntity.ok(ApiResponse.success("Contact deleted successfully", null));
    }
}
