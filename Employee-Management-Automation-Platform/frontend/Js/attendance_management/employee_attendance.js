
const API_URL = "http://127.0.0.1:8000";

const employeeAttendanceForm = document.getElementById("employeeAttendanceForm");
const attendanceTableBody = document.getElementById("attendanceTableBody");
const message = document.getElementById("message");

employeeAttendanceForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const employeeId = document.getElementById("employee_id").value;
    const month = document.getElementById("month").value;
    const year = document.getElementById("year").value;

    attendanceTableBody.innerHTML = `
        <tr>
            <td colspan="5">Loading attendance records...</td>
        </tr>
    `;

    message.textContent = "";

    try {
        const response = await fetch(
                `${API_URL}/attendance/${encodeURIComponent(employeeId)}?month=${month}&year=${year}`
            );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail || data.message || "Failed to fetch attendance."
            );
        }

        const records = Array.isArray(data)
            ? data
            : data.attendance || data.records || [];

        attendanceTableBody.innerHTML = "";

        if (records.length === 0) {
            attendanceTableBody.innerHTML = `
                <tr>
                    <td colspan="5">No attendance records found.</td>
                </tr>
            `;
            return;
        }

        records.forEach(function (record) {
            const row = document.createElement("tr");

            [
                record.id,
                record.employee_id,
                record.date,
                record.time,
                record.status
            ].forEach(function (value) {
                const cell = document.createElement("td");
                cell.textContent = value ?? "-";
                row.appendChild(cell);
            });

            attendanceTableBody.appendChild(row);
        });

    } catch (error) {
        attendanceTableBody.innerHTML = `
            <tr>
                <td colspan="5">Unable to load attendance.</td>
            </tr>
        `;

        message.textContent = error.message;
        message.style.color = "red";

        console.error("Employee Attendance Error:", error);
    }
});


