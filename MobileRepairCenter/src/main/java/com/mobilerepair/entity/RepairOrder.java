package com.mobilerepair.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "repair_orders")
public class RepairOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "device_id", nullable = false)
    private Device device;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "technician_id", nullable = false)
    private Technician technician;

    @Column(name = "issue_description", columnDefinition = "TEXT")
    private String issueDescription;

    @Enumerated(EnumType.STRING)
    @Column(name = "repair_status", nullable = false)
    private RepairStatus repairStatus = RepairStatus.RECEIVED;

    @Column(name = "repair_cost", precision = 10, scale = 2, nullable = false)
    private BigDecimal repairCost = BigDecimal.ZERO;

    @Column(name = "parts_cost", precision = 10, scale = 2, nullable = false)
    private BigDecimal partsCost = BigDecimal.ZERO;

    @Column(name = "total_bill", precision = 10, scale = 2, nullable = false)
    private BigDecimal totalBill = BigDecimal.ZERO;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (repairCost == null) repairCost = BigDecimal.ZERO;
        if (partsCost == null) partsCost = BigDecimal.ZERO;
        if (totalBill == null) totalBill = repairCost.add(partsCost);
    }

    public RepairOrder() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Device getDevice() { return device; }
    public void setDevice(Device device) { this.device = device; }
    public Technician getTechnician() { return technician; }
    public void setTechnician(Technician technician) { this.technician = technician; }
    public String getIssueDescription() { return issueDescription; }
    public void setIssueDescription(String issueDescription) { this.issueDescription = issueDescription; }
    public RepairStatus getRepairStatus() { return repairStatus; }
    public void setRepairStatus(RepairStatus repairStatus) { this.repairStatus = repairStatus; }
    public BigDecimal getRepairCost() { return repairCost; }
    public void setRepairCost(BigDecimal repairCost) { this.repairCost = repairCost; }
    public BigDecimal getPartsCost() { return partsCost; }
    public void setPartsCost(BigDecimal partsCost) { this.partsCost = partsCost; }
    public BigDecimal getTotalBill() { return totalBill; }
    public void setTotalBill(BigDecimal totalBill) { this.totalBill = totalBill; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
}
