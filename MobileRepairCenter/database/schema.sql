CREATE DATABASE IF NOT EXISTS mobile_repair_db;
USE mobile_repair_db;

DROP TRIGGER IF EXISTS trg_repair_status_completed;
DROP PROCEDURE IF EXISTS create_repair_order;
DROP FUNCTION IF EXISTS calculate_repair_bill;

DROP TABLE IF EXISTS repair_orders;
DROP TABLE IF EXISTS devices;
DROP TABLE IF EXISTS technicians;
DROP TABLE IF EXISTS customers;

CREATE TABLE customers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(120) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(150),
    address VARCHAR(255)
);

CREATE TABLE technicians (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(120) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    specialization VARCHAR(120)
);

CREATE TABLE devices (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    customer_id BIGINT NOT NULL,
    brand VARCHAR(80) NOT NULL,
    model VARCHAR(120) NOT NULL,
    imei VARCHAR(40) UNIQUE,
    problem_description TEXT,
    CONSTRAINT fk_device_customer
        FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE repair_orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    device_id BIGINT NOT NULL,
    technician_id BIGINT NOT NULL,
    issue_description TEXT,
    repair_status ENUM(
        'RECEIVED','DIAGNOSING','IN_PROGRESS','READY','COMPLETED','CANCELLED'
    ) NOT NULL DEFAULT 'RECEIVED',
    repair_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    parts_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_bill DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME NULL,
    CONSTRAINT fk_repair_device
        FOREIGN KEY (device_id) REFERENCES devices(id),
    CONSTRAINT fk_repair_technician
        FOREIGN KEY (technician_id) REFERENCES technicians(id)
);

DELIMITER $$

CREATE FUNCTION calculate_repair_bill(
    p_repair_cost DECIMAL(10,2),
    p_parts_cost DECIMAL(10,2)
)
RETURNS DECIMAL(10,2)
DETERMINISTIC
BEGIN
    RETURN COALESCE(p_repair_cost, 0.00)
         + COALESCE(p_parts_cost, 0.00);
END$$

CREATE PROCEDURE create_repair_order(
    IN p_device_id BIGINT,
    IN p_technician_id BIGINT,
    IN p_issue_description TEXT,
    IN p_repair_cost DECIMAL(10,2),
    IN p_parts_cost DECIMAL(10,2)
)
BEGIN
    INSERT INTO repair_orders (
        device_id, technician_id, issue_description, repair_status,
        repair_cost, parts_cost, total_bill, created_at
    )
    VALUES (
        p_device_id, p_technician_id, p_issue_description, 'RECEIVED',
        COALESCE(p_repair_cost, 0.00),
        COALESCE(p_parts_cost, 0.00),
        calculate_repair_bill(p_repair_cost, p_parts_cost),
        CURRENT_TIMESTAMP
    );

    SELECT LAST_INSERT_ID() AS id;
END$$

CREATE TRIGGER trg_repair_status_completed
BEFORE UPDATE ON repair_orders
FOR EACH ROW
BEGIN
    IF NEW.repair_status = 'COMPLETED'
       AND OLD.repair_status <> 'COMPLETED'
       AND NEW.completed_at IS NULL THEN
        SET NEW.completed_at = CURRENT_TIMESTAMP;
    END IF;
END$$

DELIMITER ;

INSERT INTO customers (name, phone, email, address) VALUES
('Arun Kumar','9876543210','arun@example.com','Chennai'),
('Priya Devi','9876501234','priya@example.com','Trichy'),
('Kavin Raj','9000011111','kavin@example.com','Coimbatore');

INSERT INTO technicians (name, phone, specialization) VALUES
('Ravi','9000000001','Apple and iPhone'),
('Suresh','9000000002','Android'),
('Meena','9000000003','Display and Battery');

INSERT INTO devices
(customer_id, brand, model, imei, problem_description)
VALUES
(1,'Samsung','Galaxy S23','111111111111111','Screen issue'),
(2,'Apple','iPhone 14','222222222222222','Battery issue'),
(3,'OnePlus','12R','333333333333333','Charging issue');

INSERT INTO repair_orders
(device_id, technician_id, issue_description, repair_status,
 repair_cost, parts_cost, total_bill)
VALUES
(1,2,'Display replacement','IN_PROGRESS',1200.00,2500.00,3700.00),
(2,1,'Battery replacement','COMPLETED',800.00,1800.00,2600.00),
(3,2,'Charging port repair','READY',600.00,900.00,1500.00);

-- Required JOIN
SELECT
    r.id AS repair_order_id,
    c.name AS customer_name,
    c.phone AS customer_phone,
    d.brand,
    d.model,
    t.name AS technician_name,
    r.repair_status,
    r.repair_cost,
    r.parts_cost,
    r.total_bill
FROM repair_orders r
JOIN devices d ON r.device_id = d.id
JOIN customers c ON d.customer_id = c.id
JOIN technicians t ON r.technician_id = t.id;

-- Required subquery using AVG
SELECT t.id, t.name, COUNT(r.id) AS repair_count
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
);
