package com.mobilerepair.service;

import com.mobilerepair.entity.Customer;
import com.mobilerepair.entity.Device;
import com.mobilerepair.exception.ResourceNotFoundException;
import com.mobilerepair.repository.CustomerRepository;
import com.mobilerepair.repository.DeviceRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DeviceService {
    private final DeviceRepository repo;
    private final CustomerRepository customers;

    public DeviceService(DeviceRepository repo, CustomerRepository customers) {
        this.repo = repo;
        this.customers = customers;
    }

    public List<Device> all() { return repo.findAll(); }

    public Device get(Long id) {
        return repo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Device not found: " + id));
    }

    public Device save(Device d) {
        if (d.getCustomer() == null || d.getCustomer().getId() == null) {
            throw new IllegalArgumentException("customer.id is required");
        }
        Customer c = customers.findById(d.getCustomer().getId())
            .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        d.setCustomer(c);
        return repo.save(d);
    }

    public Device update(Long id, Device d) {
        Device x = get(id);
        x.setBrand(d.getBrand());
        x.setModel(d.getModel());
        x.setImei(d.getImei());
        x.setProblemDescription(d.getProblemDescription());

        if (d.getCustomer() != null && d.getCustomer().getId() != null) {
            Customer c = customers.findById(d.getCustomer().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
            x.setCustomer(c);
        }
        return repo.save(x);
    }

    public void delete(Long id) { repo.delete(get(id)); }
}
