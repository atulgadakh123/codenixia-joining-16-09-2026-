
const API_URL = "http://127.0.0.1:8000";

const agentForm = document.getElementById("agentForm");
const employeeIdInput = document.getElementById("employee_id");
const questionInput = document.getElementById("question");
const loading = document.getElementById("loading");
const answerSection = document.getElementById("answerSection");
const answerElement = document.getElementById("answer");
const errorMessage = document.getElementById("errorMessage");

agentForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const employeeIdValue = employeeIdInput.value.trim();
    const question = questionInput.value.trim();

    if (!question) {
        errorMessage.textContent = "Please enter a question.";
        return;
    }

    const requestData = {
        employee_id: employeeIdValue ? Number(employeeIdValue) : null,
        question: question
    };

    loading.style.display = "block";
    answerSection.style.display = "none";
    errorMessage.textContent = "";

    try {
        const response = await fetch(`${API_URL}/employee-agent/ask`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail || "Failed to get an agent response."
            );
        }

        answerElement.textContent =
            typeof data === "string"
                ? data
                : data.answer ??
                  data.response ??
                  data.result ??
                  JSON.stringify(data, null, 2);

        answerSection.style.display = "block";

    } catch (error) {
        errorMessage.textContent = error.message;
        console.error("Employee Agent Error:", error);

    } finally {
        loading.style.display = "none";
    }
});
