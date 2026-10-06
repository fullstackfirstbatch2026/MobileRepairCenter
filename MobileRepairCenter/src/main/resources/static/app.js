/* =========================================================
   API CONFIGURATION
========================================================= */

const API = "/api";


/* =========================================================
   GLOBAL DATA
========================================================= */

let customers = [];
let devices = [];
let technicians = [];
let repairs = [];


/* =========================================================
   HELPER - API REQUEST
========================================================= */

async function apiRequest(url, options = {}) {

    try {

        const response = await fetch(url, {

            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            },

            ...options

        });


        if (!response.ok) {

            let message = `HTTP ${response.status}`;

            try {

                const errorData = await response.json();

                if (errorData.message) {
                    message = errorData.message;
                }

            } catch (e) {
                // Response may not contain JSON
            }

            throw new Error(message);

        }


        if (response.status === 204) {
            return null;
        }


        const text = await response.text();

        if (!text) {
            return null;
        }

        return JSON.parse(text);

    } catch (error) {

        console.error("API Error:", error);

        showToast("Error: " + error.message);

        throw error;

    }

}


/* =========================================================
   TOAST
========================================================= */

function showToast(message) {

    const toast = document.getElementById("toast");

    if (!toast) {
        return;
    }

    toast.textContent = message;

    toast.style.display = "block";


    setTimeout(() => {

        toast.style.display = "none";

    }, 3000);

}


/* =========================================================
   PAGE NAVIGATION
========================================================= */

function showSection(sectionId) {

    document.querySelectorAll(".page-section")
        .forEach(section => {

            section.classList.remove("active-section");

        });


    document.querySelectorAll(".nav-item")
        .forEach(button => {

            button.classList.remove("active");

        });


    const section = document.getElementById(sectionId);

    if (section) {
        section.classList.add("active-section");
    }


    const titles = {

        dashboard: "Dashboard",

        customers: "Customers",

        devices: "Devices",

        technicians: "Technicians",

        repairs: "Repair Orders"

    };


    const pageTitle = document.getElementById("pageTitle");

    if (pageTitle) {
        pageTitle.textContent =
            titles[sectionId] || "Mobile Repair Center";
    }


    document.querySelectorAll(".nav-item")
        .forEach(button => {

            if (
                button.getAttribute("onclick") ===
                `showSection('${sectionId}')`
            ) {

                button.classList.add("active");

            }

        });


    if (sectionId === "customers") {
        loadCustomers();
    }


    if (sectionId === "devices") {

        loadDevices();

        loadCustomersForSelect();

    }


    if (sectionId === "technicians") {
        loadTechnicians();
    }


    if (sectionId === "repairs") {

        loadRepairs();

        loadDevicesForSelect();

        loadTechniciansForSelect();

    }

}


/* =========================================================
   DASHBOARD
========================================================= */

async function loadDashboard() {

    try {

        await Promise.all([

            loadCustomers(),

            loadDevices(),

            loadTechnicians(),

            loadRepairs()

        ]);

        updateDashboardCounts();

        renderRecentRepairs();

    } catch (error) {

        console.error(error);

    }

}


function updateDashboardCounts() {

    const customerCount =
        document.getElementById("customerCount");

    const deviceCount =
        document.getElementById("deviceCount");

    const technicianCount =
        document.getElementById("technicianCount");

    const repairCount =
        document.getElementById("repairCount");


    if (customerCount) {
        customerCount.textContent = customers.length;
    }

    if (deviceCount) {
        deviceCount.textContent = devices.length;
    }

    if (technicianCount) {
        technicianCount.textContent = technicians.length;
    }

    if (repairCount) {
        repairCount.textContent = repairs.length;
    }

}


/* =========================================================
   CUSTOMERS
========================================================= */

async function loadCustomers() {

    try {

        customers =
            await apiRequest(`${API}/customers`) || [];

        renderCustomers();

        updateDashboardCounts();

        return customers;

    } catch (error) {

        customers = [];

        renderCustomers();

    }

}


function renderCustomers() {

    const tbody =
        document.getElementById("customerTableBody");

    if (!tbody) {
        return;
    }


    tbody.innerHTML = "";


    if (customers.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td colspan="6" class="empty-state">

                    No customers found.

                </td>

            </tr>

        `;

        return;

    }


    customers.forEach(customer => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>${customer.id ?? "-"}</td>

            <td>
                <strong>
                    ${escapeHtml(customer.name)}
                </strong>
            </td>

            <td>
                ${escapeHtml(customer.phone)}
            </td>

            <td>
                ${escapeHtml(customer.email || "-")}
            </td>

            <td>
                ${escapeHtml(customer.address || "-")}
            </td>

            <td>

                <div class="actions">

                    <button
                        class="edit-btn"
                        onclick="editCustomer(${customer.id})">

                        Edit

                    </button>

                    <button
                        class="danger-btn"
                        onclick="deleteCustomer(${customer.id})">

                        Delete

                    </button>

                </div>

            </td>

        `;


        tbody.appendChild(row);

    });

}


function openCustomerForm(customer = null) {

    const form =
        document.getElementById("customerForm");

    if (!form) {
        return;
    }

    form.classList.remove("hidden");


    if (customer) {

        document.getElementById("customerFormTitle")
            .textContent = "Edit Customer";

        document.getElementById("customerId")
            .value = customer.id;

        document.getElementById("customerName")
            .value = customer.name || "";

        document.getElementById("customerPhone")
            .value = customer.phone || "";

        document.getElementById("customerEmail")
            .value = customer.email || "";

        document.getElementById("customerAddress")
            .value = customer.address || "";

    } else {

        document.getElementById("customerFormTitle")
            .textContent = "Add Customer";

        document.getElementById("customerId")
            .value = "";

        document.getElementById("customerName")
            .value = "";

        document.getElementById("customerPhone")
            .value = "";

        document.getElementById("customerEmail")
            .value = "";

        document.getElementById("customerAddress")
            .value = "";

    }

}


function closeCustomerForm() {

    const form =
        document.getElementById("customerForm");

    if (form) {
        form.classList.add("hidden");
    }

}


async function saveCustomer(event) {

    event.preventDefault();


    const id =
        document.getElementById("customerId").value;


    const customer = {

        name:
            document.getElementById("customerName")
                .value.trim(),

        phone:
            document.getElementById("customerPhone")
                .value.trim(),

        email:
            document.getElementById("customerEmail")
                .value.trim(),

        address:
            document.getElementById("customerAddress")
                .value.trim()

    };


    try {

        if (id) {

            await apiRequest(

                `${API}/customers/${id}`,

                {

                    method: "PUT",

                    body: JSON.stringify(customer)

                }

            );

            showToast(
                "Customer updated successfully."
            );

        } else {

            await apiRequest(

                `${API}/customers`,

                {

                    method: "POST",

                    body: JSON.stringify(customer)

                }

            );

            showToast(
                "Customer created successfully."
            );

        }


        closeCustomerForm();

        await loadCustomers();

        updateDashboardCounts();

    } catch (error) {

        console.error(error);

    }

}


function editCustomer(id) {

    const customer =
        customers.find(c => c.id == id);

    if (customer) {
        openCustomerForm(customer);
    }

}


async function deleteCustomer(id) {

    if (!confirm("Delete this customer?")) {
        return;
    }


    try {

        await apiRequest(

            `${API}/customers/${id}`,

            {

                method: "DELETE"

            }

        );

        showToast(
            "Customer deleted successfully."
        );

        await loadCustomers();

        updateDashboardCounts();

    } catch (error) {

        console.error(error);

    }

}


/* =========================================================
   DEVICES
========================================================= */

async function loadDevices() {

    try {

        devices =
            await apiRequest(`${API}/devices`) || [];

        renderDevices();

        updateDashboardCounts();

        return devices;

    } catch (error) {

        devices = [];

        renderDevices();

    }

}


function renderDevices() {

    const tbody =
        document.getElementById("deviceTableBody");

    if (!tbody) {
        return;
    }


    tbody.innerHTML = "";


    if (devices.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td colspan="7" class="empty-state">

                    No devices found.

                </td>

            </tr>

        `;

        return;

    }


    devices.forEach(device => {

        const customer =
            getCustomerFromDevice(device);


        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>${device.id ?? "-"}</td>

            <td>
                ${escapeHtml(
                    customer
                        ? customer.name
                        : "-"
                )}
            </td>

            <td>
                ${escapeHtml(device.brand || "-")}
            </td>

            <td>
                ${escapeHtml(device.model || "-")}
            </td>

            <td>
                ${escapeHtml(device.imei || "-")}
            </td>

            <td>
                ${escapeHtml(
                    device.purchaseDate || "-"
                )}
            </td>

            <td>

                <div class="actions">

                    <button
                        class="edit-btn"
                        onclick="editDevice(${device.id})">

                        Edit

                    </button>

                    <button
                        class="danger-btn"
                        onclick="deleteDevice(${device.id})">

                        Delete

                    </button>

                </div>

            </td>

        `;


        tbody.appendChild(row);

    });

}


function getCustomerFromDevice(device) {

    if (device.customer) {

        if (typeof device.customer === "object") {

            return device.customer;

        }

        return customers.find(
            c => c.id == device.customer
        );

    }


    if (device.customerId) {

        return customers.find(
            c => c.id == device.customerId
        );

    }


    return null;

}


async function loadCustomersForSelect() {

    if (customers.length === 0) {
        await loadCustomers();
    }


    const select =
        document.getElementById("deviceCustomer");

    if (!select) {
        return;
    }


    select.innerHTML =
        `<option value="">Select Customer</option>`;


    customers.forEach(customer => {

        const option =
            document.createElement("option");


        option.value = customer.id;

        option.textContent =
            `${customer.name} - ${customer.phone}`;


        select.appendChild(option);

    });

}


function openDeviceForm(device = null) {

    const form =
        document.getElementById("deviceForm");

    if (!form) {
        return;
    }

    form.classList.remove("hidden");


    loadCustomersForSelect();


    if (device) {

        document.getElementById("deviceFormTitle")
            .textContent = "Edit Device";

        document.getElementById("deviceId")
            .value = device.id;


        const customer =
            getCustomerFromDevice(device);


        document.getElementById("deviceCustomer")
            .value =
                customer
                    ? customer.id
                    : "";


        document.getElementById("deviceBrand")
            .value = device.brand || "";

        document.getElementById("deviceModel")
            .value = device.model || "";

        document.getElementById("deviceImei")
            .value = device.imei || "";

        document.getElementById("devicePurchaseDate")
            .value =
                device.purchaseDate || "";

    } else {

        document.getElementById("deviceFormTitle")
            .textContent = "Add Device";

        document.getElementById("deviceId")
            .value = "";

        document.getElementById("deviceCustomer")
            .value = "";

        document.getElementById("deviceBrand")
            .value = "";

        document.getElementById("deviceModel")
            .value = "";

        document.getElementById("deviceImei")
            .value = "";

        document.getElementById("devicePurchaseDate")
            .value = "";

    }

}


function closeDeviceForm() {

    const form =
        document.getElementById("deviceForm");

    if (form) {
        form.classList.add("hidden");
    }

}


async function saveDevice(event) {

    event.preventDefault();


    const id =
        document.getElementById("deviceId").value;


    const customerId =
        document.getElementById("deviceCustomer").value;


    const device = {

        customer: {
            id: Number(customerId)
        },

        brand:
            document.getElementById("deviceBrand")
                .value.trim(),

        model:
            document.getElementById("deviceModel")
                .value.trim(),

        imei:
            document.getElementById("deviceImei")
                .value.trim(),

        purchaseDate:
            document.getElementById("devicePurchaseDate")
                .value || null

    };


    try {

        if (id) {

            await apiRequest(

                `${API}/devices/${id}`,

                {

                    method: "PUT",

                    body: JSON.stringify(device)

                }

            );

            showToast(
                "Device updated successfully."
            );

        } else {

            await apiRequest(

                `${API}/devices`,

                {

                    method: "POST",

                    body: JSON.stringify(device)

                }

            );

            showToast(
                "Device created successfully."
            );

        }


        closeDeviceForm();

        await loadDevices();

        updateDashboardCounts();

    } catch (error) {

        console.error(error);

    }

}


function editDevice(id) {

    const device =
        devices.find(d => d.id == id);

    if (device) {
        openDeviceForm(device);
    }

}


async function deleteDevice(id) {

    if (!confirm("Delete this device?")) {
        return;
    }


    try {

        await apiRequest(

            `${API}/devices/${id}`,

            {

                method: "DELETE"

            }

        );

        showToast(
            "Device deleted successfully."
        );

        await loadDevices();

        updateDashboardCounts();

    } catch (error) {

        console.error(error);

    }

}


/* =========================================================
   TECHNICIANS
========================================================= */

async function loadTechnicians() {

    try {

        technicians =
            await apiRequest(`${API}/technicians`) || [];

        renderTechnicians();

        updateDashboardCounts();

        return technicians;

    } catch (error) {

        technicians = [];

        renderTechnicians();

    }

}


function renderTechnicians() {

    const tbody =
        document.getElementById(
            "technicianTableBody"
        );

    if (!tbody) {
        return;
    }


    tbody.innerHTML = "";


    if (technicians.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td colspan="5" class="empty-state">

                    No technicians found.

                </td>

            </tr>

        `;

        return;

    }


    technicians.forEach(technician => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${technician.id ?? "-"}
            </td>

            <td>

                <strong>
                    ${escapeHtml(
                        technician.name
                    )}
                </strong>

            </td>

            <td>
                ${escapeHtml(
                    technician.phone || "-"
                )}
            </td>

            <td>
                ${escapeHtml(
                    technician.specialization || "-"
                )}
            </td>

            <td>

                <div class="actions">

                    <button
                        class="edit-btn"
                        onclick="editTechnician(${technician.id})">

                        Edit

                    </button>

                    <button
                        class="danger-btn"
                        onclick="deleteTechnician(${technician.id})">

                        Delete

                    </button>

                </div>

            </td>

        `;


        tbody.appendChild(row);

    });

}


function openTechnicianForm(
    technician = null
) {

    const form =
        document.getElementById(
            "technicianForm"
        );

    if (!form) {
        return;
    }

    form.classList.remove("hidden");


    if (technician) {

        document.getElementById(
            "technicianFormTitle"
        ).textContent = "Edit Technician";

        document.getElementById(
            "technicianId"
        ).value = technician.id;

        document.getElementById(
            "technicianName"
        ).value = technician.name || "";

        document.getElementById(
            "technicianPhone"
        ).value = technician.phone || "";

        document.getElementById(
            "technicianSpecialization"
        ).value =
            technician.specialization || "";

    } else {

        document.getElementById(
            "technicianFormTitle"
        ).textContent = "Add Technician";

        document.getElementById(
            "technicianId"
        ).value = "";

        document.getElementById(
            "technicianName"
        ).value = "";

        document.getElementById(
            "technicianPhone"
        ).value = "";

        document.getElementById(
            "technicianSpecialization"
        ).value = "";

    }

}


function closeTechnicianForm() {

    const form =
        document.getElementById(
            "technicianForm"
        );

    if (form) {
        form.classList.add("hidden");
    }

}


async function saveTechnician(event) {

    event.preventDefault();


    const id =
        document.getElementById(
            "technicianId"
        ).value;


    const technician = {

        name:
            document.getElementById(
                "technicianName"
            ).value.trim(),

        phone:
            document.getElementById(
                "technicianPhone"
            ).value.trim(),

        specialization:
            document.getElementById(
                "technicianSpecialization"
            ).value.trim()

    };


    try {

        if (id) {

            await apiRequest(

                `${API}/technicians/${id}`,

                {

                    method: "PUT",

                    body:
                        JSON.stringify(
                            technician
                        )

                }

            );

            showToast(
                "Technician updated successfully."
            );

        } else {

            await apiRequest(

                `${API}/technicians`,

                {

                    method: "POST",

                    body:
                        JSON.stringify(
                            technician
                        )

                }

            );

            showToast(
                "Technician created successfully."
            );

        }


        closeTechnicianForm();

        await loadTechnicians();

        updateDashboardCounts();

    } catch (error) {

        console.error(error);

    }

}


function editTechnician(id) {

    const technician =
        technicians.find(
            t => t.id == id
        );

    if (technician) {
        openTechnicianForm(technician);
    }

}


async function deleteTechnician(id) {

    if (!confirm("Delete this technician?")) {
        return;
    }


    try {

        await apiRequest(

            `${API}/technicians/${id}`,

            {

                method: "DELETE"

            }

        );

        showToast(
            "Technician deleted successfully."
        );

        await loadTechnicians();

        updateDashboardCounts();

    } catch (error) {

        console.error(error);

    }

}


/* =========================================================
   ABOVE AVERAGE TECHNICIANS
========================================================= */

async function loadAboveAverage() {

    const container =
        document.getElementById(
            "aboveAverageContainer"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        `<div class="empty-state">Loading...</div>`;


    try {

        const data =
            await apiRequest(
                `${API}/technicians/above-average-repairs`
            ) || [];


        if (data.length === 0) {

            container.innerHTML = `

                <div class="empty-state">

                    No above-average technicians found.

                </div>

            `;

            return;

        }


        container.innerHTML = `

            <table>

                <thead>

                    <tr>

                        <th>Technician</th>

                        <th>Repairs</th>

                        <th>Average</th>

                    </tr>

                </thead>

                <tbody>

                    ${data.map(item => `

                        <tr>

                            <td>

                                ${escapeHtml(
                                    item.technicianName ||
                                    item.name ||
                                    "-"
                                )}

                            </td>

                            <td>

                                ${
                                    item.repairCount ??
                                    item.totalRepairs ??
                                    "-"
                                }

                            </td>

                            <td>

                                ${
                                    item.averageRepairs ??
                                    item.average ??
                                    "-"
                                }

                            </td>

                        </tr>

                    `).join("")}

                </tbody>

            </table>

        `;

    } catch (error) {

        container.innerHTML = `

            <div class="empty-state">

                Unable to load data.

            </div>

        `;

    }

}


/* =========================================================
   REPAIR ORDERS
========================================================= */

async function loadRepairs() {

    try {

        /*
         * IMPORTANT:
         * The backend controller uses:
         *
         * GET /api/repairs/joined
         *
         * This returns customer, device and technician
         * information together.
         */

        repairs =
            await apiRequest(
                `${API}/repairs/joined`
            ) || [];


        renderRepairs();

        renderRecentRepairs();

        updateDashboardCounts();

        return repairs;

    } catch (error) {

        repairs = [];

        renderRepairs();

        renderRecentRepairs();

        updateDashboardCounts();

    }

}


function getDeviceFromRepair(repair) {

    if (
        repair.device &&
        typeof repair.device === "object"
    ) {

        return repair.device;

    }


    if (repair.deviceId) {

        return devices.find(
            d => d.id == repair.deviceId
        );

    }


    return null;

}


function getTechnicianFromRepair(repair) {

    if (
        repair.technician &&
        typeof repair.technician === "object"
    ) {

        return repair.technician;

    }


    if (repair.technicianId) {

        return technicians.find(
            t => t.id == repair.technicianId
        );

    }


    return null;

}


function getCustomerNameFromRepair(repair) {

    if (repair.customerName) {
        return repair.customerName;
    }


    const device =
        getDeviceFromRepair(repair);


    if (!device) {
        return "-";
    }


    const customer =
        getCustomerFromDevice(device);


    return customer
        ? customer.name
        : "-";

}


function getDeviceNameFromRepair(repair) {

    if (
        repair.deviceBrand ||
        repair.deviceModel
    ) {

        return `${repair.deviceBrand || ""}
                ${repair.deviceModel || ""}`;

    }


    const device =
        getDeviceFromRepair(repair);


    if (!device) {
        return "-";
    }


    return `${device.brand || ""}
            ${device.model || ""}`;

}


function getTechnicianNameFromRepair(repair) {

    if (repair.technicianName) {
        return repair.technicianName;
    }


    const technician =
        getTechnicianFromRepair(repair);


    return technician
        ? technician.name
        : "-";

}


function statusBadge(status) {

    const value =
        status || "RECEIVED";


    const css =
        value.toLowerCase();


    return `

        <span class="status-badge status-${css}">

            ${escapeHtml(value)}

        </span>

    `;

}


function renderRepairs() {

    const tbody =
        document.getElementById(
            "repairTableBody"
        );


    if (!tbody) {
        return;
    }


    tbody.innerHTML = "";


    if (repairs.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="10"
                    class="empty-state">

                    No repair orders found.

                </td>

            </tr>

        `;

        return;

    }


    repairs.forEach(repair => {

        const row =
            document.createElement("tr");


        const customerName =
            getCustomerNameFromRepair(
                repair
            );


        const deviceName =
            getDeviceNameFromRepair(
                repair
            );


        const technicianName =
            getTechnicianNameFromRepair(
                repair
            );


        row.innerHTML = `

            <td>
                ${
                    repair.repairOrderId ||
                    repair.id ||
                    "-"
                }
            </td>

            <td>
                ${escapeHtml(customerName)}
            </td>

            <td>
                ${escapeHtml(deviceName)}
            </td>

            <td>
                ${escapeHtml(technicianName)}
            </td>

            <td>

                ${statusBadge(
                    repair.repairStatus ||
                    repair.status
                )}

            </td>

            <td>

                ₹${formatMoney(
                    repair.repairCost
                )}

            </td>

            <td>

                ₹${formatMoney(
                    repair.partsCost
                )}

            </td>

            <td>

                <strong>

                    ₹${formatMoney(
                        repair.totalBill
                    )}

                </strong>

            </td>

            <td>

                ${formatDate(
                    repair.createdAt
                )}

            </td>

            <td>

                <button
                    class="edit-btn"
                    onclick="viewRepair(
                        ${
                            repair.repairOrderId ||
                            repair.id
                        }
                    )">

                    View

                </button>

            </td>

        `;


        tbody.appendChild(row);

    });

}


function renderRecentRepairs() {

    const container =
        document.getElementById(
            "recentRepairs"
        );


    if (!container) {
        return;
    }


    if (repairs.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                No repair orders found.

            </div>

        `;

        return;

    }


    const recent =
        [...repairs].slice(0, 5);


    container.innerHTML = `

        <table>

            <thead>

                <tr>

                    <th>ID</th>

                    <th>Customer</th>

                    <th>Device</th>

                    <th>Status</th>

                    <th>Total</th>

                </tr>

            </thead>

            <tbody>

                ${recent.map(repair => `

                    <tr>

                        <td>

                            ${
                                repair.repairOrderId ||
                                repair.id ||
                                "-"
                            }

                        </td>

                        <td>

                            ${escapeHtml(
                                getCustomerNameFromRepair(
                                    repair
                                )
                            )}

                        </td>

                        <td>

                            ${escapeHtml(
                                getDeviceNameFromRepair(
                                    repair
                                )
                            )}

                        </td>

                        <td>

                            ${statusBadge(
                                repair.repairStatus ||
                                repair.status
                            )}

                        </td>

                        <td>

                            ₹${formatMoney(
                                repair.totalBill
                            )}

                        </td>

                    </tr>

                `).join("")}

            </tbody>

        </table>

    `;

}


/* =========================================================
   REPAIR FORM SELECTS
========================================================= */

async function loadDevicesForSelect() {

    if (devices.length === 0) {
        await loadDevices();
    }


    const select =
        document.getElementById(
            "repairDevice"
        );


    if (!select) {
        return;
    }


    select.innerHTML = `

        <option value="">

            Select Device

        </option>

    `;


    devices.forEach(device => {

        const customer =
            getCustomerFromDevice(device);


        const option =
            document.createElement(
                "option"
            );


        option.value = device.id;


        option.textContent =
            `${device.brand || ""}
             ${device.model || ""}
             ${
                customer
                    ? " - " + customer.name
                    : ""
             }`;


        select.appendChild(option);

    });

}


async function loadTechniciansForSelect() {

    if (technicians.length === 0) {
        await loadTechnicians();
    }


    const select =
        document.getElementById(
            "repairTechnician"
        );


    if (!select) {
        return;
    }


    select.innerHTML = `

        <option value="">

            Select Technician

        </option>

    `;


    technicians.forEach(technician => {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            technician.id;


        option.textContent =
            `${technician.name}
             ${
                technician.specialization
                    ? "- " +
                      technician.specialization
                    : ""
             }`;


        select.appendChild(option);

    });

}


function openRepairForm() {

    const form =
        document.getElementById(
            "repairForm"
        );


    if (!form) {
        return;
    }


    form.classList.remove("hidden");


    loadDevicesForSelect();

    loadTechniciansForSelect();

}


function closeRepairForm() {

    const form =
        document.getElementById(
            "repairForm"
        );


    if (form) {
        form.classList.add("hidden");
    }

}


/* =========================================================
   SAVE REPAIR
========================================================= */

async function saveRepair(event) {

    event.preventDefault();


    const deviceId =
        document.getElementById(
            "repairDevice"
        ).value;


    const technicianId =
        document.getElementById(
            "repairTechnician"
        ).value;


    const repairCost =
        Number(
            document.getElementById(
                "repairCost"
            ).value || 0
        );


    const partsCost =
        Number(
            document.getElementById(
                "partsCost"
            ).value || 0
        );


    /*
     * IMPORTANT:
     * RepairOrderService expects RepairOrderRequest
     * with deviceId and technicianId.
     */

    const repair = {

        deviceId:
            Number(deviceId),

        technicianId:
            Number(technicianId),

        issueDescription:
            document.getElementById(
                "repairIssue"
            ).value.trim(),

        repairCost:
            repairCost,

        partsCost:
            partsCost

    };


    try {

        await apiRequest(

            `${API}/repairs`,

            {

                method: "POST",

                body:
                    JSON.stringify(repair)

            }

        );


        showToast(
            "Repair order created successfully."
        );


        closeRepairForm();


        await loadRepairs();


        updateDashboardCounts();


    } catch (error) {

        console.error(error);

    }

}


/* =========================================================
   VIEW REPAIR
========================================================= */

function viewRepair(id) {

    const repair =
        repairs.find(

            r =>
                (r.id == id) ||
                (r.repairOrderId == id)

        );


    if (!repair) {
        return;
    }


    const customer =
        getCustomerNameFromRepair(
            repair
        );


    const device =
        getDeviceNameFromRepair(
            repair
        );


    const technician =
        getTechnicianNameFromRepair(
            repair
        );


    alert(

        `Repair Order #${id}\n\n` +

        `Customer: ${customer}\n` +

        `Device: ${device}\n` +

        `Technician: ${technician}\n` +

        `Status: ${
            repair.repairStatus ||
            repair.status ||
            "-"
        }\n\n` +

        `Issue: ${
            repair.issueDescription ||
            "-"
        }\n\n` +

        `Repair Cost: ₹${
            formatMoney(
                repair.repairCost
            )
        }\n` +

        `Parts Cost: ₹${
            formatMoney(
                repair.partsCost
            )
        }\n` +

        `Total Bill: ₹${
            formatMoney(
                repair.totalBill
            )
        }`

    );

}


/* =========================================================
   FORMATTING
========================================================= */

function formatMoney(value) {

    const number =
        Number(value || 0);


    return number.toFixed(2);

}


function formatDate(value) {

    if (!value) {
        return "-";
    }


    try {

        return new Date(value)
            .toLocaleDateString(
                "en-IN"
            );

    } catch (error) {

        return value;

    }

}


/* =========================================================
   SECURITY - HTML ESCAPE
========================================================= */

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(

    "DOMContentLoaded",

    async function () {

        console.log(
            "Mobile Repair Center frontend started."
        );


        await loadDashboard();

    }

);