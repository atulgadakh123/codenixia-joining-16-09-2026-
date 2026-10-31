
const API_URL = "http://127.0.0.1:8000";

const employeeTableBody = document.getElementById("employeeTableBody");
const message = document.getElementById("message");
const totalEmployees = document.getElementById("totalEmployees");

async function getEmployees() {

    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    try {
        if (message) {
            message.textContent = "Loading employees...";
        }

        const response = await fetch(`${API_URL}/employee/list_all`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch employees.");
        }

        const employees = await response.json();

        if (!Array.isArray(employees)) {
            throw new Error("Invalid employee data received.");
        }

        // Show total employees
        if (totalEmployees) {
            totalEmployees.textContent = employees.length;
        }

        if (!employeeTableBody) {
            throw new Error("Employee table body not found in HTML.");
        }

        employeeTableBody.innerHTML = "";

        if (employees.length === 0) {
            if (message) {
                message.textContent = "No employees found.";
            }
            return;
        }

        employees.forEach(function (employee) {

            const row = document.createElement("tr");

            const fields = [
                employee.id,
                employee.name,
                employee.email,
                employee.phone,
                employee.department,
                employee.designation,
                employee.joining_date,
                employee.salary
            ];

            fields.forEach(function (value) {
                const cell = document.createElement("td");
                cell.textContent = value ?? "";
                row.appendChild(cell);
            });

            employeeTableBody.appendChild(row);
        });

        if (message) {
            message.textContent = "";
        }

    } catch (error) {
        if (message) {
            message.textContent = "Unable to load employees.";
        }

        console.error("Get employees error:", error);
    }
}

getEmployees();
