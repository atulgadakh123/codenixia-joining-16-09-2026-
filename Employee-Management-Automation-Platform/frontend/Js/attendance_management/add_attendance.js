const API_URL = "http://127.0.0.1:8000";

const attendanceForm = document.getElementById("attendanceForm");
const message = document.getElementById("message");

attendanceForm.addEventListener("submit" ,async function (event) {
    event.preventDefault();

    
const employee_id = document.getElementById("employee_id").value;
const status = document.getElementById("status").value;

const attendanceData = {
    employee_id: Number(employee_id),
    status: status
};

    try{
        const response = await fetch(`${API_URL}/attendance/add`,{
            method:"POST",
            headers:{
                "Content-Type" :"application/json"
            },
            body:JSON.stringify(attendanceData)
        })
        const result = await response.json();

        if(response.ok){
            message.textContent = "Attendance added successfully!"
            message.style.color ="green"
            attendanceForm.reset()
        }else{
            message.textContent =result.detail || result.message || "Failed to add attendance."
            message.style.color = "red"
        }
    }catch(error){
        message.textContent = "unable to connect backend"
        message.style.color = "red"
        console.error("Attendance Error", error)
    }
})