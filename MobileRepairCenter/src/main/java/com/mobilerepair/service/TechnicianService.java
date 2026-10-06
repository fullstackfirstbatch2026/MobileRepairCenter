package com.mobilerepair.service;

import com.mobilerepair.entity.Technician;
import com.mobilerepair.exception.ResourceNotFoundException;
import com.mobilerepair.repository.TechnicianRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TechnicianService {
    private final TechnicianRepository repo;

    public TechnicianService(TechnicianRepository repo) {
        this.repo = repo;
    }

    public List<Technician> all() { return repo.findAll(); }

    public Technician get(Long id) {
        return repo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Technician not found: " + id));
    }

    public Technician save(Technician t) { return repo.save(t); }

    public Technician update(Long id, Technician t) {
        Technician x = get(id);
        x.setName(t.getName());
        x.setPhone(t.getPhone());
        x.setSpecialization(t.getSpecialization());
        return repo.save(x);
    }

    public void delete(Long id) { repo.delete(get(id)); }
}
