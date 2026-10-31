const API_URL = "http://127.0.0.1:8000";

//Get element 
const loginForm = document.getElementById("loginForm");
const message = document.getElementById("loginMessage");

//login FROm submit

loginForm.addEventListener("submit", async function (event) {
    
    event.preventDefault()

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

   const userData = {
      email :email,
      password:password
   };

   try{
       message.textContent ="Logging in...";
       message.style.color = "blue";

       const response = await fetch(`${API_URL}/employee/login`,{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify(userData)
       })
       const data = await response.json();

       if (response.ok && data.access_token) {
    console.log("Login response:", data);
    console.log("Role:", data.role);

    localStorage.setItem("token", data.access_token);
    localStorage.setItem("role", data.role);

    message.textContent = "Login successful!";
    message.style.color = "green";

    // alert("Role received: " + data.role);

    window.location.href = "dashboard.html";
}else{
          message.textContent = data.detail || data.message || "invalid email or password.";

          message.style.color = "red"
       }}catch(error){
           message.textContent ="Unable to connect to the backend."
           message.style.color = "red"

           console.error("Login error:",error)
       }


})