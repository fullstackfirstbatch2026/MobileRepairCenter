package com.mobilerepair.dto;

public record TechnicianAboveAverage(
    Long technicianId,
    String technicianName,
    long repairCount
) {}
