// API Base URL
const API_URL = "http://127.0.0.1:8000";

// Open selected page
function openPage(page) {
    window.location.href = page;
}

// Get HTML elements
const employeeIdInput = document.getElementById("employee_id");
const searchButton = document.getElementById("searchButton");
const tableBody = document.getElementById("pendingTableBody");
const message = document.getElementById("message");

// Search pending payment
searchButton.addEventListener("click", async function () {
    const token = localStorage.getItem("token");
    const employeeId = employeeIdInput.value.trim();

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    if (!employeeId || Number(employeeId) <= 0) {
        message.textContent = "Please enter a valid Employee ID.";
        message.style.color = "red";
        return;
    }

    tableBody.innerHTML = `
        <tr>
            <td colspan="5">Loading...</td>
        </tr>
    `;

    message.textContent = "";

    try {
        const response = await fetch(
            `${API_URL}/employee/pending/${encodeURIComponent(employeeId)}`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.detail || "Unable to get pending payment."
            );
        }

        // Handle either a single object or an array
        const records = Array.isArray(result) ? result : [result];

        tableBody.innerHTML = "";

        if (
            records.length === 0 ||
            records.every(record => record === null)
        ) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5">No pending payment found.</td>
                </tr>
            `;
            return;
        }

        records.forEach(record => {
            const row = document.createElement("tr");

            const values = [
                record.employee_id ?? employeeId,
                record.total_salary ?? "-",
                record.amount_paid ?? "-",
                record.pending_payment ?? record.balance ?? "-",
                record.payment_status ?? "-"
            ];

            values.forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });

            tableBody.appendChild(row);
        });

    } catch (error) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5">No data available.</td>
            </tr>
        `;

        message.textContent = error.message;
        message.style.color = "red";
    }
});