package com.mobilerepair.controller;

import com.mobilerepair.dto.*;
import com.mobilerepair.entity.RepairOrder;
import com.mobilerepair.service.RepairOrderService;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/repairs")
public class RepairOrderController {
    private final RepairOrderService service;

    public RepairOrderController(RepairOrderService service) {
        this.service = service;
    }

    @GetMapping
    public List<RepairOrder> all() { return service.all(); }

    @GetMapping("/joined")
    public List<JoinedRepairOrder> joined() { return service.joined(); }

    @GetMapping("/{id}")
    public RepairOrder get(@PathVariable Long id) { return service.get(id); }

    @PostMapping
    public ResponseEntity<RepairOrder> create(@Valid @RequestBody RepairOrderRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req));
    }

    @PutMapping("/{id}")
    public RepairOrder update(@PathVariable Long id, @Valid @RequestBody RepairOrderRequest req) {
        return service.update(id, req);
    }

    @PutMapping("/{id}/status")
    public RepairOrder status(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest req) {
        return service.updateStatus(id, req.status());
    }

    @GetMapping("/{id}/bill")
    public BigDecimal bill(@PathVariable Long id) {
        return service.calculateBill(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
