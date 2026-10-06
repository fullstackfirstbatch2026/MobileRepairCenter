package com.mobilerepair.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record RepairOrderRequest(
    @NotNull Long deviceId,
    @NotNull Long technicianId,
    String issueDescription,
    @DecimalMin("0.00") BigDecimal repairCost,
    @DecimalMin("0.00") BigDecimal partsCost
) {}
