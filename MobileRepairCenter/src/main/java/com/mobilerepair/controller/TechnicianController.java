package com.mobilerepair.controller;

import com.mobilerepair.dto.TechnicianAboveAverage;
import com.mobilerepair.entity.Technician;
import com.mobilerepair.service.RepairOrderService;
import com.mobilerepair.service.TechnicianService;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/technicians")
public class TechnicianController {
    private final TechnicianService service;
    private final RepairOrderService repairService;

    public TechnicianController(
            TechnicianService service,
            RepairOrderService repairService) {
        this.service = service;
        this.repairService = repairService;
    }

    @GetMapping
    public List<Technician> all() { return service.all(); }

    @GetMapping("/above-average-repairs")
    public List<TechnicianAboveAverage> aboveAverage() {
        return repairService.aboveAverage();
    }

    @GetMapping("/{id}")
    public Technician get(@PathVariable Long id) { return service.get(id); }

    @PostMapping
    public ResponseEntity<Technician> create(@Valid @RequestBody Technician t) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.save(t));
    }

    @PutMapping("/{id}")
    public Technician update(@PathVariable Long id, @Valid @RequestBody Technician t) {
        return service.update(id, t);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
