
const API_URL = "http://127.0.0.1:8000";

const attendanceTableBody = document.getElementById("attendanceTableBody");
const message = document.getElementById("message");
const monthSelect = document.getElementById("month");
const yearSelect = document.getElementById("year");

async function loadAttendance() {

    const month = monthSelect.value;
    const year = yearSelect.value;

    attendanceTableBody.innerHTML = `
        <tr>
            <td colspan="5">Loading attendance records...</td>
        </tr>`;

    message.textContent = "";

    try {
        const response = await fetch(
            `${API_URL}/attendance/all?month=${month}&year=${year}`
        );

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();

        const records = Array.isArray(data)
            ? data
            : data.attendance || data.records || [];

        attendanceTableBody.innerHTML = "";

        if (records.length === 0) {
            attendanceTableBody.innerHTML = `
                <tr>
                    <td colspan="5">
                        No attendance records found for this month.
                    </td>
                </tr>`;
            return;
        }

        records.forEach(function (record) {
            const row = document.createElement("tr");

            const fields = [
                record.id,
                record.employee_id,
                record.date,
                record.time,
                record.status
            ];

            fields.forEach(function (value) {
                const cell = document.createElement("td");
                cell.textContent = value ?? "-";
                row.appendChild(cell);
            });

            attendanceTableBody.appendChild(row);
        });

    } catch (error) {
        attendanceTableBody.innerHTML = `
            <tr>
                <td colspan="5">Failed to load attendance records.</td>
            </tr>`;

        message.textContent = error.message;
        message.style.color = "red";

        console.error("Attendance Error:", error);
    }
}

document.addEventListener("DOMContentLoaded", loadAttendance);
