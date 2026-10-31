
const API_URL = "http://127.0.0.1:8000";

const attendancePercentageForm = document.getElementById(
    "attendancePercentageForm"
);

const percentageTableBody = document.getElementById("percentageTableBody");
const message = document.getElementById("message");

attendancePercentageForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const employeeId = document.getElementById("employee_id").value;

    percentageTableBody.innerHTML = `
        <tr>
            <td colspan="2">Loading...</td>
        </tr>
    `;

    message.textContent = "";

    try {
        const response = await fetch(
            `${API_URL}/attendance/percentage/${encodeURIComponent(employeeId)}`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail ||
                data.message ||
                "Failed to fetch attendance percentage."
            );
        }

        let percentage;

        if (typeof data === "number") {
            percentage = data;
        } else if (typeof data === "object" && data !== null) {
            percentage =
                data.attendance_percentage ??
                data.percentage;
        }

        if (
            percentage === undefined ||
            percentage === null ||
            !Number.isFinite(Number(percentage))
        ) {
            throw new Error(
                "Unexpected API response. Check attendance_percentage()."
            );
        }

        percentageTableBody.innerHTML = "";

        const row = document.createElement("tr");

        const employeeCell = document.createElement("td");
        employeeCell.textContent = employeeId;

        const percentageCell = document.createElement("td");
        percentageCell.textContent = `${Number(percentage).toFixed(2)}%`;

        row.appendChild(employeeCell);
        row.appendChild(percentageCell);

        percentageTableBody.appendChild(row);

    } catch (error) {
        percentageTableBody.innerHTML = `
            <tr>
                <td colspan="2">Unable to load attendance percentage.</td>
            </tr>
        `;

        message.textContent = error.message;
        message.style.color = "red";

        console.error("Attendance Percentage Error:", error);
    }
});
