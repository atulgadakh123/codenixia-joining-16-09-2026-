
const API_URL = "http://127.0.0.1:8000";

function openPage(page) {
    window.location.href = page;
}

const summaryForm = document.getElementById("summaryForm");
const employeeIdInput = document.getElementById("employee_id");
const monthInput = document.getElementById("month");
const yearInput = document.getElementById("year");
const summaryTableBody = document.getElementById("summaryTableBody");
const message = document.getElementById("message");
const salarySlip = document.getElementById("salarySlip");

function formatMoney(value) {
    const amount = Number(value);
    return Number.isFinite(amount)
        ? "₹ " + amount.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })
        : "-";
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value ?? "-";
    }
}

summaryForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const token = localStorage.getItem("token");
    const employeeId = employeeIdInput.value.trim();
    const month = monthInput.value;
    const year = yearInput.value.trim();

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    if (!employeeId || Number(employeeId) <= 0) {
        message.textContent = "Enter a valid Employee ID.";
        return;
    }

    if (!month || Number(month) < 1 || Number(month) > 12) {
        message.textContent = "Select a valid month.";
        return;
    }

    if (!year || !Number.isInteger(Number(year))) {
        message.textContent = "Enter a valid year.";
        return;
    }

    message.textContent = "Loading salary slip...";
    salarySlip.hidden = true;

    summaryTableBody.innerHTML = `
        <tr><td colspan="13">Loading...</td></tr>
    `;

    try {
        // Month and year are query parameters
        const response = await fetch(
            `${API_URL}/employee/salary-slip/${encodeURIComponent(employeeId)}?month=${encodeURIComponent(month)}&year=${encodeURIComponent(year)}`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        

        const result = await response.json();
        console.log(result)
        if (result.detail === "Employee not found" ||
    result.message === "Employee not found") {
    throw new Error(
        result.detail || result.message
    );
}
        if (!response.ok) {
            throw new Error(
                result.detail || "Unable to get payment summary."
            );
        }

        const record = Array.isArray(result) ? result[0] : result;

        if (!record || typeof record !== "object") {
            throw new Error("No salary summary found.");
        }

        // Employee details
        setText("employee_name", record.name);
        setText("display_employee_id", record.employee_id);
        setText("employee_email", record.email);
        setText("joining_date", record.joining_date);

        // Salary details
        setText("total_salary", formatMoney(record.total_salary));
        setText("amount_paid", formatMoney(record.amount_paid));
        setText("balance", formatMoney(record.balance));
        setText("payment_date", record.payment_date);
        setText("payment_status", record.payment_status);
        setText("present_days", record.present_days);
        setText("absent_days", record.absent_days);

        // Selected month and year
        const monthName = monthInput.options[monthInput.selectedIndex].text;
        setText("salary_month_year", `${monthName} ${year}`);

        // Fill payment details table
        summaryTableBody.innerHTML = "";

        const values = [
            record.employee_id,
            record.name,
            record.email,
            record.joining_date,
            monthName,
            year,
            formatMoney(record.total_salary),
            formatMoney(record.amount_paid),
            formatMoney(record.balance),
            record.payment_date,
            record.payment_status,
            record.present_days,
            record.absent_days
        ];

        const row = document.createElement("tr");

        values.forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value ?? "-";
            row.appendChild(cell);
        });

        summaryTableBody.appendChild(row);

        salarySlip.hidden = false;
        message.textContent = "";

    } catch (error) {
        summaryTableBody.innerHTML = `
            <tr>
                <td colspan="13">No salary summary available.</td>
            </tr>
        `;

        message.textContent = error.message;
        console.error("Payment summary error:", error);
    }
});
