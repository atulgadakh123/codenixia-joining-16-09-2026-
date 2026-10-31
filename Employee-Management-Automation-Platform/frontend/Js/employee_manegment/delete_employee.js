
const API_URL = "http://127.0.0.1:8000";

const deleteEmployeeForm = document.getElementById("deleteEmployeeForm");
const message = document.getElementById("message");
const role = localStorage.getItem("role")
if(role !== "admin"){
    alert("acess denied.Only admin can delete employee")
     window.location.href = "employee.html";
}

deleteEmployeeForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    const employeeId = document.getElementById("employee_id").value;

    const confirmDelete = confirm(
        `Are you sure you want to delete employee ID ${employeeId}?`
    );

    if (!confirmDelete) {
        return;
    }

    try {
        message.textContent = "Deleting employee...";
        message.style.color = "blue";

        const response = await fetch(
            `${API_URL}/employee/delete/${employeeId}`,
            {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Failed to delete employee.");
        }

        message.textContent =
            data.message || "Employee deleted successfully!";
        message.style.color = "green";

        deleteEmployeeForm.reset();

    } catch (error) {
        message.textContent = error.message;
        message.style.color = "red";

        console.error("Delete employee error:", error);
    }
});
