package com.mobilerepair.service;

import com.mobilerepair.dto.*;
import com.mobilerepair.entity.*;
import com.mobilerepair.exception.ResourceNotFoundException;
import com.mobilerepair.repository.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class RepairOrderService {
    private final RepairOrderRepository repairs;
    private final DeviceRepository devices;
    private final TechnicianRepository technicians;
    private final JdbcTemplate jdbc;

    public RepairOrderService(
            RepairOrderRepository repairs,
            DeviceRepository devices,
            TechnicianRepository technicians,
            JdbcTemplate jdbc) {
        this.repairs = repairs;
        this.devices = devices;
        this.technicians = technicians;
        this.jdbc = jdbc;
    }

    public List<RepairOrder> all() { return repairs.findAll(); }

    public RepairOrder get(Long id) {
        return repairs.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Repair order not found: " + id));
    }

    @Transactional
    public RepairOrder create(RepairOrderRequest req) {
        devices.findById(req.deviceId())
            .orElseThrow(() -> new ResourceNotFoundException("Device not found: " + req.deviceId()));
        technicians.findById(req.technicianId())
            .orElseThrow(() -> new ResourceNotFoundException("Technician not found: " + req.technicianId()));

        BigDecimal repairCost = nz(req.repairCost());
        BigDecimal partsCost = nz(req.partsCost());

        Long id = jdbc.queryForObject(
            "CALL create_repair_order(?, ?, ?, ?, ?)",
            Long.class,
            req.deviceId(),
            req.technicianId(),
            req.issueDescription(),
            repairCost,
            partsCost
        );

        return get(id);
    }

    public RepairOrder update(Long id, RepairOrderRequest req) {
        RepairOrder r = get(id);
        r.setDevice(devices.findById(req.deviceId())
            .orElseThrow(() -> new ResourceNotFoundException("Device not found")));
        r.setTechnician(technicians.findById(req.technicianId())
            .orElseThrow(() -> new ResourceNotFoundException("Technician not found")));
        r.setIssueDescription(req.issueDescription());
        r.setRepairCost(nz(req.repairCost()));
        r.setPartsCost(nz(req.partsCost()));
        r.setTotalBill(calculateBill(r.getRepairCost(), r.getPartsCost()));
        return repairs.save(r);
    }

    @Transactional
    public RepairOrder updateStatus(Long id, RepairStatus status) {
        RepairOrder r = get(id);
        r.setRepairStatus(status);
        return repairs.save(r);
    }

    public BigDecimal calculateBill(Long id) {
        RepairOrder r = get(id);
        return calculateBill(r.getRepairCost(), r.getPartsCost());
    }

    public BigDecimal calculateBill(BigDecimal repairCost, BigDecimal partsCost) {
        return jdbc.queryForObject(
            "SELECT calculate_repair_bill(?, ?)",
            BigDecimal.class,
            nz(repairCost),
            nz(partsCost)
        );
    }

    public void delete(Long id) { repairs.delete(get(id)); }

    public List<JoinedRepairOrder> joined() {
        return repairs.findJoinedRepairOrders();
    }

    public List<TechnicianAboveAverage> aboveAverage() {
        return repairs.findTechniciansAboveAverage().stream()
            .map(row -> new TechnicianAboveAverage(
                ((Number) row[0]).longValue(),
                String.valueOf(row[1]),
                ((Number) row[2]).longValue()))
            .toList();
    }

    private BigDecimal nz(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }
}
