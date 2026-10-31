const API_URL = "http://127.0.0.1:8000";

//Get form elements
const addEmployeeForm = document.getElementById("addEmployeeForm");
const message = document.getElementById("message")
const role = localStorage.getItem("role")
if(role !== "admin"){
     alert("Access denied. Only admin can add employees.");
    window.location.href = "employee.html";
}


//submit employee form

addEmployeeForm.addEventListener("submit" , async function (event) {
    event.preventDefault();

    const token = localStorage.getItem("token");

    if(!token){
        window.location.href = "login.html"
        return
    }

    const employeeData = {
         name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        department: document.getElementById("department").value.trim(),
        designation: document.getElementById("designation").value.trim(),
        joining_date: document.getElementById("joining_date").value,
        salary: Number(document.getElementById("salary").value)
    };
    
    try{
        message.textContent = "Adding employee..."
        message.style.color = "blue"

          const response = await fetch(`${API_URL}/employee/employee`,{
            method:"POST",
            headers:{
                "Content-Type" :"application/json",
                "Authorization":`Bearer ${token}`
            },
            body :JSON.stringify(employeeData)
        })
        const data = await response.json()

        if(response.ok){
            message.textContent = data.message || "Employee added sucessfully";
            message.style.color = "green";

            addEmployeeForm.reset()
        }else{
            message.textContent = data.detail || data.message || "failed to add employee"
            message.style.color = "red"
        }
    }
    catch(error){
        message.textContent ="unable to connect to the backend.";
        message.style.color = "red"
        console.error("Error:", error);
    }
})