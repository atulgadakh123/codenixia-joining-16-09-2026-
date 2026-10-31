const API_URL = "http://127.0.0.1:8000"

//Registration Form

const registrationForm = document.getElementById("registerForm");
//const message = document.getElementById("message")
const message = document.getElementById("registerMessage");

registrationForm.addEventListener("submit" , async function (event) {
    event.preventDefault()


const name = document.getElementById("name").value.trim();
const email = document.getElementById("regEmail").value.trim();
const password = document.getElementById("regPassword").value;

const confirmPassword = document.getElementById("confirm_password").value;
const role = document.getElementById("role").value;

if (!name || !email || !password ||!confirmPassword|| !role) {
    message.textContent = "Please fill in all fields.";
    message.style.color = "red";
    return;
}
if (password !== confirmPassword) {
    message.textContent = "Passwords do not match.";
    message.style.color = "red";
    return;
}
const userData = {
    name: name,
    email: email,
    password: password,
    //confirmPassword:confirmPassword,
    role: role
};
try {
    message.textContent = "Registering...";
    message.style.color = "blue";

    const response = await fetch(`${API_URL}/employee/registration`,{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify(userData)
    });
    const data = await response.json();
    data.message
    if (response.ok) {
    message.textContent = data.message || "Registration successful!";
    message.style.color = "green";
    window.location.href = "../Html/login.html";
}
else {
    message.textContent = data.detail || data.message || "Registration failed.";
    message.style.color = "red";
}
} catch (error) {
    message.textContent = "Unable to connect to the backend.";
    message.style.color = "red";

    console.error("Registration error:", error);
}
})