package com.mobilerepair.dto;

import com.mobilerepair.entity.RepairStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record JoinedRepairOrder(
    Long repairOrderId,
    String customerName,
    String customerPhone,
    String deviceBrand,
    String deviceModel,
    String technicianName,
    RepairStatus repairStatus,
    BigDecimal repairCost,
    BigDecimal partsCost,
    BigDecimal totalBill,
    LocalDateTime createdAt,
    LocalDateTime completedAt
) {}