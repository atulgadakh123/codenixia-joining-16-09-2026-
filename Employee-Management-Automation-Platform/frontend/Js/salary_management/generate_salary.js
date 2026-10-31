
const API_URL = "http://127.0.0.1:8000";

const salaryForm = document.getElementById("salaryForm");
const salaryResult = document.getElementById("salaryResult");
const message = document.getElementById("message");
const salaryTableBody = document.getElementById("salaryTableBody");

salaryForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const employeeId = Number(
        document.getElementById("employee_id").value
    );

    const month = document.getElementById("month").value;

    const token = localStorage.getItem("token");

    message.textContent = "";
    salaryResult.style.display = "none";

    if (!token) {
        message.textContent = "Please login first.";
        message.style.color = "red";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/salary/generate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                employee_id: employeeId,
                month: month
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail || data.message || "Failed to generate salary."
            );
        }

        message.textContent =
            data.message || "Salary generated successfully.";
        message.style.color = "green";

        salaryTableBody.innerHTML = "";

        const row = document.createElement("tr");

        const fields = [
            data.employee_id,
            data.month,
            data.final_salary,
            data.amount_paid,
            data.pending_payment
        ];

        fields.forEach(function (value) {
            const cell = document.createElement("td");
            cell.textContent = value ?? "-";
            row.appendChild(cell);
        });

        salaryTableBody.appendChild(row);
        salaryResult.style.display = "block";

    } catch (error) {
        message.textContent = error.message;
        message.style.color = "red";

        console.error("Salary Generation Error:", error);
    }
});
