package com.mobilerepair.repository;

import com.mobilerepair.dto.JoinedRepairOrder;
import com.mobilerepair.entity.RepairOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface RepairOrderRepository extends JpaRepository<RepairOrder, Long> {

    @Query("""
        select new com.mobilerepair.dto.JoinedRepairOrder(
            r.id, c.name, c.phone, d.brand, d.model, t.name,
            r.repairStatus, r.repairCost, r.partsCost, r.totalBill,
            r.createdAt, r.completedAt)
        from RepairOrder r
        join r.device d
        join d.customer c
        join r.technician t
        order by r.id desc
        """)
    List<JoinedRepairOrder> findJoinedRepairOrders();

    @Query(value = """
        SELECT t.id, t.name, COUNT(r.id)
        FROM technicians t
        JOIN repair_orders r ON r.technician_id = t.id
        GROUP BY t.id, t.name
        HAVING COUNT(r.id) > (
            SELECT AVG(x.repair_count)
            FROM (
                SELECT technician_id, COUNT(*) AS repair_count
                FROM repair_orders
                GROUP BY technician_id
            ) x
        )
        """, nativeQuery = true)
    List<Object[]> findTechniciansAboveAverage();
}
