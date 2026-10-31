
const API_URL = "http://127.0.0.1:8000";

document.addEventListener("DOMContentLoaded", () => {
    loadMyProfile();
});

async function loadMyProfile() {
    try {
        const token = localStorage.getItem("token");

        if (!token) {
            alert("Please login first");
            window.location.href = "login.html";
            return;
        }

        // Replace 1 with the logged-in employee's actual ID
        const employeeId = 1;

        const response = await fetch(
            `${API_URL}/employee/get/${employeeId}`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        if (!response.ok) {
            throw new Error("Failed to load profile.");
        }

        const employee = await response.json();

        document.getElementById("employee_id").textContent = employee.id ?? "";
        document.getElementById("name").textContent = employee.name ?? "";
        document.getElementById("email").textContent = employee.email ?? "";
        document.getElementById("phone").textContent = employee.phone ?? "";
        document.getElementById("department").textContent = employee.department ?? "";
        document.getElementById("designation").textContent = employee.designation ?? "";
        document.getElementById("joining_date").textContent = employee.joining_date ?? "";

        document.getElementById("salary").textContent =
            employee.salary != null
                ? `₹${Number(employee.salary).toLocaleString("en-IN")}`
                : "";

    } catch (error) {
        console.error("Profile error:", error);
        alert("Unable to load your profile");
    }
}
