
const API_URL = "http://127.0.0.1:8000";


// Add Attendance Function
async function addAttendance(employeeId) {
    try {           
        const response = await fetch(`${API_URL}/attendance/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                employee_id: Number(employeeId)
            })
        });

        const data = await response.json();
        if (data.message === "Employee not found") {
    throw new Error(data.message);
}
          if (!response.ok) {
            const message =
                data.detail || data.message || "Failed to add attendance";

            if (message.toLowerCase().includes("already")||
    message.toLowerCase().includes("unique constraint failed")) {
                alert("Attendance already marked for this employee today!");
            } else {
                alert(message);
            }
            return;
        }


        alert("Attendance added successfully!");

    } catch (error) {
        console.error("Add Attendance Error:", error);
        alert(error.message || "Unable to add attendance");
    }
}



document.getElementById("add_attendance_btn").addEventListener("click", function () {
    const employeeId = document.getElementById("employee_id").value.trim();

    if (!employeeId) {
        alert("Please enter Employee ID");
        return;
    }

    addAttendance(employeeId);
});

// End Attendance Function
async function endAttendance(employeeId) {
    try {
        const description = prompt("Enter description:");

        if (description === null) {
            return;
        }

        const response = await fetch(
            `${API_URL}/attendance/end_attendance/${employeeId}?description=${encodeURIComponent(description)}`,
            { method: "POST" }
        );

        const data = await response.json();
        if (data.message === "Employee not found") {
    throw new Error(data.message);
}

        if (!response.ok) {
            throw new Error(data.detail || "Failed to end attendance"|| "Employee not found");
        }

        alert("Attendance ended successfully!");

    } catch (error) {
        console.error("End Attendance Error:", error);
        alert(error.message || "Unable to end attendance");
    }
}
document.addEventListener("DOMContentLoaded",function(){
    document.getElementById("attendance_date").value= new Date().toLocaleDateString("en-CA");

    document.getElementById("search_btn").click();
 })
// Search Attendance
document.getElementById("search_btn").addEventListener("click", async function () {
    const employeeId = document.getElementById("employee_id").value.trim();
    const date = document.getElementById("attendance_date").value;
    const month = document.getElementById("month").value;
    const year = document.getElementById("year").value;

    // Validation
    if (!date && (!month || !year)) {
        alert("Please select Date OR Month and Year");
        return;
    }

    try {
        let recordsUrl;

        // Date-based search
        if (month && year) {
    if (employeeId) {
        recordsUrl = `${API_URL}/attendance/${employeeId}?month=${month}&year=${year}`;
    } else {
        recordsUrl = `${API_URL}/attendance/all?month=${month}&year=${year}`;
    }
} else if (date) {
    recordsUrl = `${API_URL}/attendance/all?date=${encodeURIComponent(date)}`;
} else {
    alert("Please select Date OR Month and Year");
    return;
}

        const recordsResponse = await fetch(recordsUrl);
        const recordsData = await recordsResponse.json();

        if (!recordsResponse.ok) {
            throw new Error(
                recordsData.detail || "Failed to fetch attendance records"
            );
        }

        if (!Array.isArray(recordsData)) {
            console.log("Attendance API response:", recordsData);
            throw new Error("Attendance records response is not a list");
        }

        // Filter by employee ID when searching by date
        const filteredRecords = employeeId && date
            ? recordsData.filter(
                item => String(item.employee_id) === employeeId
            )
            : recordsData;

        // Total attendance
        document.getElementById("total_days").textContent =
            filteredRecords.length;

        // Present, absent and leave
        const presentDays = filteredRecords.filter(
            item => item.status?.toLowerCase() === "present"
        ).length;

        const absentDays = filteredRecords.filter(
            item => item.status?.toLowerCase() === "absent"
        ).length;

        const leaveDays = filteredRecords.filter(
            item => item.status?.toLowerCase() === "leave"
        ).length;

        document.getElementById("present_days").textContent = presentDays;
        document.getElementById("absent_days").textContent = absentDays;
        document.getElementById("leave_days").textContent = leaveDays;

        // Total working hours
        const totalWorkingHours = filteredRecords.reduce((total, item) => {
            if (!item.time || !item.end_time) {
                return total;
            }

            const start = item.time.split(":").map(Number);
            const end = item.end_time.split(":").map(Number);

            const startSeconds =
                start[0] * 3600 + start[1] * 60 + (start[2] || 0);

            const endSeconds =
                end[0] * 3600 + end[1] * 60 + (end[2] || 0);

            let hours = (endSeconds - startSeconds) / 3600;

            if (hours < 0) {
                hours += 24;
            }

            return total + hours;
        }, 0);

        document.getElementById("total_working_hours").textContent =
            `${totalWorkingHours.toFixed(2)} Hours`;

        // Display attendance records
        const tbody = document.getElementById("attendance_table_body");
        tbody.innerHTML = "";

        filteredRecords.forEach(item => {
            const row = document.createElement("tr");
            const id = item.employee_id ?? employeeId;

            row.innerHTML = `
                <td>${id || "-"}</td>
                <td>${item.date ?? "-"}</td>
                <td>${item.time ?? "-"}</td>
                <td>${item.end_time ?? "-"}</td>
                <td>${item.working_hours ?? item.working_hour ?? "-"}</td>
                <td>${item.description ?? "-"}</td>
                <td>${item.status ?? "-"}</td>
                <td>
                    <button type="button" class="add-btn"
                        data-id="${id}">Add</button>
                    <button type="button" class="end-btn"
                        data-id="${id}">End</button>
                </td>
            `;

            tbody.appendChild(row);
        });

        // Add button event
        document.querySelectorAll(".add-btn").forEach(button => {
            button.addEventListener("click", function () {
                const id = this.dataset.id;

                if (!id || id === "-") {
                    alert("Employee ID not found");
                    return;
                }

                addAttendance(id);
            });
        });

        // End button event
        document.querySelectorAll(".end-btn").forEach(button => {
            button.addEventListener("click", function () {
                const id = this.dataset.id;

                if (!id || id === "-") {
                    alert("Employee ID not found");
                    return;
                }

                endAttendance(id);
            });
        });

    } catch (error) {
        console.error("Attendance Error:", error);
        alert(error.message || "Unable to fetch attendance");
    }
});
