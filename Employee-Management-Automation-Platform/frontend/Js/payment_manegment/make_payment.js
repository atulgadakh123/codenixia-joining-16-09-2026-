
const API_URL = "http://127.0.0.1:8000";

function openPage(page) {
    window.location.href = page;
}

const paymentForm = document.getElementById("paymentForm");
const message = document.getElementById("message");

const searchEmployeeButton = document.getElementById("searchEmployee");
const employeeIdInput = document.getElementById("employee_id");
const totalSalaryInput = document.getElementById("total_salary");
const amountPaidInput = document.getElementById("amount_paid");
const balanceInput = document.getElementById("balance");
const paymentStatusInput = document.getElementById("payment_status");
const role = localStorage.getItem("role")

// if(role ===admin){
//     alert("only admin add the payment")
// }

let databaseBalance = null;
let databaseSalary = null;


// Fetch salary and balance from database
async function fetchEmployeeDetails(employeeId, token) {
    const response = await fetch(
        `${API_URL}/employee/total_salary/${employeeId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.detail || "Employee not found.");
    }

    const salary = Number(result.total_salary);
    const balance = Number(result.balance);

    if (
        !Number.isFinite(salary) ||
        !Number.isFinite(balance)
    ) {
        throw new Error("Invalid salary or balance received.");
    }

    databaseSalary = salary;
    databaseBalance = balance;

    totalSalaryInput.value = salary.toFixed(2);
    balanceInput.value = balance.toFixed(2);
    paymentStatusInput.value =
        balance <= 0 ? "paid" : "pending";

    return { salary, balance };
}


// Search Employee
searchEmployeeButton.addEventListener("click", async function () {
    const employeeId = Number(employeeIdInput.value);
    const token = localStorage.getItem("token");

    if (!employeeId) {
        message.textContent = "Please enter Employee ID.";
        message.style.color = "red";
        return;
    }

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    try {
        amountPaidInput.value = "";

        const details = await fetchEmployeeDetails(
            employeeId,
            token
        );

        message.textContent =
            `Salary: ₹${details.salary.toFixed(2)} | ` +
            `Balance: ₹${details.balance.toFixed(2)}`;

        message.style.color = "green";

    } catch (error) {
        totalSalaryInput.value = "";
        amountPaidInput.value = "";
        balanceInput.value = "";
        paymentStatusInput.value = "";

        databaseBalance = null;
        databaseSalary = null;

        message.textContent = error.message;
        message.style.color = "red";
    }
});


// Update displayed balance while typing Paid Amount
amountPaidInput.addEventListener("input", function () {
    if (databaseBalance === null) {
        return;
    }

    const amountPaid = Number(amountPaidInput.value);

    if (amountPaidInput.value.trim() === "" || !Number.isFinite(amountPaid)) {
        balanceInput.value = databaseBalance.toFixed(2);
        paymentStatusInput.value =
            databaseBalance <= 0 ? "paid" : "pending";
        return;
    }

    const newBalance = databaseBalance - amountPaid;

    balanceInput.value = newBalance.toFixed(2);

    if (amountPaid < 0 || amountPaid > databaseBalance) {
        message.textContent =
            "Paid Amount must be between 0 and the current balance.";
        message.style.color = "red";
        paymentStatusInput.value = "pending";
        return;
    }

    paymentStatusInput.value =
        newBalance <= 0 ? "paid" : "pending";

    message.textContent = "";
});


// Submit Payment
paymentForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    const employeeId = Number(employeeIdInput.value);
    const amountPaid = Number(amountPaidInput.value);

    if (!employeeId || databaseBalance === null) {
        message.textContent = "Please search Employee ID first.";
        message.style.color = "red";
        return;
    }

    if (
        amountPaidInput.value.trim() === "" ||
        !Number.isFinite(amountPaid) ||
        amountPaid <= 0
    ) {
        message.textContent = "Enter a valid payment amount.";
        message.style.color = "red";
        return;
    }

    if (amountPaid > databaseBalance) {
        message.textContent =
            "Amount paid cannot exceed the current balance.";
        message.style.color = "red";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/employee/payment`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                employee_id: employeeId,
                amount_paid: amountPaid,
                payment_status:
                    amountPaid >= databaseBalance ? "paid" : "pending"
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.detail || "Payment failed.");
        }

        // Fetch the actual updated balance from the database
        const updatedDetails = await fetchEmployeeDetails(
            employeeId,
            token
        );

        amountPaidInput.value = "";

        message.textContent =
            `${result.message || "Payment successfully created."} ` +
            `Updated Balance: ₹${updatedDetails.balance.toFixed(2)}`;

        message.style.color = "green";

    } catch (error) {
        message.textContent = error.message;
        message.style.color = "red";
    }
});
