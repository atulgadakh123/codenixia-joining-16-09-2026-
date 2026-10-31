
const API_URL = "http://127.0.0.1:8000";

const deleteEmployeeForm = document.getElementById("deleteEmployeeForm");
const message = document.getElementById("message");
const role = localStorage.getItem("role")
const employeeTableBody = document.getElementById("employeeTableBody");
// if(role !== "admin"){
//     alert("acess denied.Only admin can delete employee")
//      window.location.href = "employee.html";
// }

deleteEmployeeForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    const employeeId = document.getElementById("employee_id").value;
    try {
        message.textContent = "Finding employee...";
        message.style.color = "blue";
        employeeTableBody.innerHTML= ""

        const response = await fetch(
            `${API_URL}/employee/get/${employeeId}`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();
        console.log("Employee API Response:", data);

        if (!response.ok) {
            throw new Error(data.detail || "Failed to find employee.");
        }
       employeeTableBody.innerHTML=`
       <tr>
        <td>${data.id ?? ""}</td>
        <td>${data.name ?? ""}</td>
        <td>${data.email ?? ""}</td>
        <td>${data.phone ?? ""}</td>
        <td>${data.department ?? ""}</td>
        <td>${data.designation ?? ""}</td>
        <td>${data.joining_date ?? ""}</td>
        <td>${data.salary ?? ""}</td>
    </tr>
       
       `
        message.textContent =
            data.message || "Employee found successfully!";
        message.style.color = "green";

        

    } catch (error) {
        message.textContent = error.message;
        message.style.color = "red";
        employeeTableBody.innerHTML=""

        console.error("Find employee error:", error);
    }
});
