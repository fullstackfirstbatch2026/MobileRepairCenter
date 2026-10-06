package com.mobilerepair.service;

import com.mobilerepair.entity.Customer;
import com.mobilerepair.exception.ResourceNotFoundException;
import com.mobilerepair.repository.CustomerRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerService {
    private final CustomerRepository repo;

    public CustomerService(CustomerRepository repo) {
        this.repo = repo;
    }

    public List<Customer> all() { return repo.findAll(); }

    public Customer get(Long id) {
        return repo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + id));
    }

    public Customer save(Customer c) { return repo.save(c); }

    public Customer update(Long id, Customer c) {
        Customer x = get(id);
        x.setName(c.getName());
        x.setPhone(c.getPhone());
        x.setEmail(c.getEmail());
        x.setAddress(c.getAddress());
        return repo.save(x);
    }

    public void delete(Long id) { repo.delete(get(id)); }
}
