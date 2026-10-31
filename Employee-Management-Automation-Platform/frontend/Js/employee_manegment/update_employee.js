
const API_URL = "http://127.0.0.1:8000";

const searchForm = document.getElementById("searchEmployeeForm");
const updateForm = document.getElementById("updateEmployeeForm");
const message = document.getElementById("message");
const role = localStorage.getItem("role")

if (role !== "admin"){
    alert("Acess denied.Only admin update this page")
     window.location.href = "employee.html";
}

let employeeId = null;

function getToken() {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
        return null;
    }

    return token;
}

// Get employee details
searchForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const token = getToken();
    if (!token) return;

    employeeId = document.getElementById("employee_id").value;

    try {
        message.textContent = "Loading employee...";
        message.style.color = "blue";

        const response = await fetch(
            `${API_URL}/employee/get/${employeeId}`,
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Employee not found.");
        }

        document.getElementById("name").value = data.name ?? "";
        document.getElementById("email").value = data.email ?? "";
        document.getElementById("phone").value = data.phone ?? "";
        document.getElementById("department").value = data.department ?? "";
        document.getElementById("designation").value = data.designation ?? "";
        document.getElementById("joining_date").value =
            data.joining_date ? data.joining_date.slice(0, 10) : "";
        document.getElementById("salary").value = data.salary ?? "";

        updateForm.hidden = false;

        message.textContent = "Employee details loaded.";
        message.style.color = "green";

    } catch (error) {
        updateForm.hidden = true;
        message.textContent = error.message;
        message.style.color = "red";

        console.error("Get employee error:", error);
    }
});

// Update employee details
updateForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const token = getToken();
    if (!token) return;

    const employeeData = {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        department: document.getElementById("department").value.trim(),
        designation: document.getElementById("designation").value.trim(),
        joining_date: document.getElementById("joining_date").value,
        salary: Number(document.getElementById("salary").value)
    };

    try {
        message.textContent = "Updating employee...";
        message.style.color = "blue";

        const response = await fetch(
            `${API_URL}/employee/update/${employeeId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(employeeData)
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Failed to update employee.");
        }

        message.textContent =
            data.message || "Employee updated successfully!";
        message.style.color = "green";

    } catch (error) {
        message.textContent = error.message;
        message.style.color = "red";

        console.error("Update employee error:", error);
    }
});
