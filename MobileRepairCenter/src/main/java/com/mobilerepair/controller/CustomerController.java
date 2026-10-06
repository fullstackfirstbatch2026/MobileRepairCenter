package com.mobilerepair.controller;

import com.mobilerepair.entity.Customer;
import com.mobilerepair.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {
    private final CustomerService service;

    public CustomerController(CustomerService service) { this.service = service; }

    @GetMapping
    public List<Customer> all() { return service.all(); }

    @GetMapping("/{id}")
    public Customer get(@PathVariable Long id) { return service.get(id); }

    @PostMapping
    public ResponseEntity<Customer> create(@Valid @RequestBody Customer c) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.save(c));
    }

    @PutMapping("/{id}")
    public Customer update(@PathVariable Long id, @Valid @RequestBody Customer c) {
        return service.update(id, c);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
