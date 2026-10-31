const API_URL = "http://127.0.0.1:8000";
const payBtn = document.getElementById("pay_btn");
const role = localStorage.getItem("role");
if (role === "employee") {
    payBtn.disabled = true;
}

//search Employee payment details
document.getElementById("search_btn").addEventListener("click",async function () {
    const employeeId = document.getElementById("employee_id").value.trim()
    const month = document.getElementById("month").value
    const year = document.getElementById("year").value
    

    if(!employeeId){
        alert("please enter employee id")
        return
    }
    if(!month || !year){
        alert("please enter month and year")
        return
    }
    try{
       const response = await fetch( 
        `${API_URL}/employee/salary-slip/${employeeId}?month=${month}&year=${year}`

       );
       const data = await response.json();
       console.log("Status:", response.status);
       console.log("Response:", data);
       if(!response.ok){
        throw new Error(data.detail || "Failed to fetch payment details");
       }

      document.getElementById("total_days").textContent =
            data.total_days ?? 0;

        document.getElementById("present_days").textContent =
            data.present_days ?? 0;

        document.getElementById("total_salary").textContent =
            `₹${data.total_salary ?? 0}`;

        document.getElementById("pending_salary").textContent =
            `₹${data.balance ?? 0}`;

            
    }catch(error){
        console.error("payment Search Error", error)
        alert(error.message || "unable to fetch payment details");
    }
})

// Fetch All Employee Payments
async function fetchAllPayments() {
    try {
        const response = await fetch(`${API_URL}/employee/get`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Failed to fetch payments");
        }

        const tableBody = document.getElementById("payment_table_body");
        tableBody.innerHTML = "";

        if (data.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7">No payment records available</td>
                </tr>
            `;
            return;
        }

        data.forEach(payment => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${payment.id ?? ""}</td>
                <td>${payment.employee_id ?? ""}</td>
                <td>${payment.amount_paid ?? ""}</td>
                <td>${payment.balance ?? ""}</td>
                <td>${payment.total_salary ?? ""}</td>
                <td>${payment.payment_date ?? ""}</td>
                <td>${payment.payment_status ?? ""}</td>
            `;

            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error("Fetch Payments Error:", error);
        alert(error.message || "Unable to fetch payments");
    }
}

// Fetch payments when page loads
document.addEventListener("DOMContentLoaded", fetchAllPayments);