package com.mobilerepair.controller;

import com.mobilerepair.entity.Device;
import com.mobilerepair.service.DeviceService;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/devices")
public class DeviceController {
    private final DeviceService service;

    public DeviceController(DeviceService service) { this.service = service; }

    @GetMapping
    public List<Device> all() { return service.all(); }

    @GetMapping("/{id}")
    public Device get(@PathVariable Long id) { return service.get(id); }

    @PostMapping
    public ResponseEntity<Device> create(@Valid @RequestBody Device d) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.save(d));
    }

    @PutMapping("/{id}")
    public Device update(@PathVariable Long id, @Valid @RequestBody Device d) {
        return service.update(id, d);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
