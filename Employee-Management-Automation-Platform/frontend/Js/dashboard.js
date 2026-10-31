
const API_URL = "http://127.0.0.1:8000";

const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

// Open selected page
function openPage(page) {
    window.location.href = page;
}

// Logout
function Logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "login.html";
}

// Check login
if (!token) {
    window.location.href = "login.html";
}

// Display logged-in user's role
const userRoleElement = document.getElementById("userRole");

if (userRoleElement) {
    userRoleElement.textContent =
        role?.toLowerCase() === "admin"
            ? "Admin "
            : "Employee ";
}


 // Total employees
async function loadTotalEmployee() {
    try {
        const response = await fetch(`${API_URL}/employee/list_all`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch employees");
        }

        const employees = await response.json();
        const total = Array.isArray(employees) ? employees.length : 0;

        const totalElement = document.getElementById("totalEmployees");

        if (totalElement) {
            totalElement.textContent = total;
        }

        return total;
    } catch (error) {
        console.error("Total employee error:", error);
        return 0;
    }
}

// Total present and absent
async function loadPresentAbsent() {
    try {
        const today = new Date().toLocaleDateString("en-CA");

        const response = await fetch(
            `${API_URL}/attendance/all?date=${today}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            throw new Error("Failed to fetch attendance");
        }

        const attendanceData = await response.json();

        const totalEmployees = await loadTotalEmployee();

        const presentCount = attendanceData.filter(
            item => item.status?.toLowerCase() === "present"
        ).length;

        const absentCount = Math.max(0, totalEmployees - presentCount);

        const presentElement = document.getElementById("presentToday");
        const absentElement = document.getElementById("absentToday");

        if (presentElement) {
            presentElement.textContent = presentCount;
        }

        if (absentElement) {
            absentElement.textContent = absentCount;
        }

    } catch (error) {
        console.error("Present/Absent error:", error);
    }
}

loadTotalEmployee();
loadPresentAbsent();


// Load registered users
async function loadUsers() {
    const usersHeading = document.getElementById("usersHeading");
    const usersTableBody = document.getElementById("usersTableBody");
    const actionHeading = document.getElementById("actionHeading");

    if (!usersHeading || !usersTableBody || !actionHeading) {
        console.error("Users table elements not found");
        return;
    }

    usersHeading.textContent = "All Registered Users";
    usersTableBody.innerHTML = "";

    try {
        const response = await fetch(`${API_URL}/employee/get_all`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch users");
        }
        const users = await response.json();


        if (!Array.isArray(users) || users.length === 0) {
            usersTableBody.innerHTML =
                `<tr><td colspan="5">No users found</td></tr>`;
            return;
        }

        users.forEach(user => {
            const row = document.createElement("tr");

            const idCell = document.createElement("td");
            idCell.textContent = user.id ?? "";
            row.appendChild(idCell);

            const nameCell = document.createElement("td");
            nameCell.textContent = user.name ?? "";
            row.appendChild(nameCell);

            const emailCell = document.createElement("td");
            emailCell.textContent = user.email ?? "";
            row.appendChild(emailCell);

            const roleCell = document.createElement("td");
            roleCell.textContent = user.role ?? "";
            row.appendChild(roleCell);

            const actionCell = document.createElement("td");

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.type = "button";
            deleteButton.addEventListener("click", () => {
                deleteUser(user.id);
            });

            actionCell.appendChild(deleteButton);
            row.appendChild(actionCell);

            usersTableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Load users error:", error);
        usersTableBody.innerHTML =
            `<tr><td colspan="5">Failed to load users</td></tr>`;
    }
}

loadUsers();


 // Delete user
async function deleteUser(userId) {
    const role = localStorage.getItem("role");

    if (role !== "admin") {
        alert("Access denied. Only admin can delete users.");
        return;
    }

    if (!confirm("Are you sure you want to delete this user?")) {
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/employee/delete/${userId}`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            throw new Error("Failed to delete user");
        }

        alert("User deleted successfully");

        loadUsers();
        loadTotalEmployee();

    } catch (error) {
        console.error("Delete user error:", error);
        alert(error.message);
    }
}


// RAG and Agent
const questionForm = document.getElementById("questionForm");
const questionInput = document.getElementById("question");
const employeeIdInput = document.getElementById("employee_id");
const answerElement = document.getElementById("answer");

if (questionForm) {
    questionForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const question = questionInput?.value.trim() ?? "";
        const employeeId = employeeIdInput?.value.trim() ?? "";

        if (!question) {
            if (answerElement) {
                answerElement.textContent = "Please enter a question";
            }
            return;
        }

        if (answerElement) {
            answerElement.textContent = "Getting answers...";
        }

        try {
            let endpoint;
            let requestData;
            const allEmployeeQuestion =
    /total|how many|all employees|all employee|every employee/i.test(question);

            if (employeeId !== ""|| allEmployeeQuestion) {
                endpoint = `${API_URL}/employee-agent/ask`;
                requestData = {
                    employee_id: employeeId !== "" ? Number(employeeId) : null,
                    question: question
                };
            } else {
                endpoint = `${API_URL}/rag/ask`;
                requestData = {
                    question: question
                };
            }

            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Request failed");
            }

            if (answerElement) {
                answerElement.textContent =
                    typeof data === "string"
                        ? data
                        : data.answer ??
                          data.response ??
                          data.result ??
                          JSON.stringify(data, null, 2);
            }
        } catch (error) {
            if (answerElement) {
                answerElement.textContent = "Error: " + error.message;
            }

            console.error("RAG/Agent error:", error);
        }
    });
}
