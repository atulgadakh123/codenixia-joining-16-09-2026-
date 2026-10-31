// API Base URL
const API_URL = "http://127.0.0.1:8000";

// Open selected page
function openPage(page) {
    window.location.href = page;
}

// Load payment history
async function loadPaymentHistory() {
    const token = localStorage.getItem("token");
    const tableBody = document.getElementById("paymentTableBody");
    const message = document.getElementById("message");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/employee/get`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.detail || "Failed to load payment history.");
        }

        tableBody.innerHTML = "";

        if (!Array.isArray(result) || result.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6">No payment records found.</td>
                </tr>
            `;
            return;
        }

        result.forEach(payment => {
            const row = document.createElement("tr");

            const values = [
                payment.id ?? payment.payment_id ?? "-",
                payment.employee_id ?? "-",
                payment.total_salary ?? 0,
                payment.amount_paid ?? 0,
                payment.balance ?? 0,
                payment.payment_status ?? "-"
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
                <td colspan="6">Unable to load payment history.</td>
            </tr>
        `;
        message.textContent = error.message;
        message.style.color = "red";
    }
}

loadPaymentHistory();