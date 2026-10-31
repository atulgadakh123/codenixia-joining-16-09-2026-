
const API_URL = "http://127.0.0.1:8000";

const ragForm = document.getElementById("ragForm");
const questionInput = document.getElementById("question");
const answerSection = document.getElementById("answerSection");
const answerElement = document.getElementById("answer");
const loading = document.getElementById("loading");
const errorMessage = document.getElementById("errorMessage");

ragForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const question = questionInput.value.trim();

    if (!question) {
        errorMessage.textContent = "Please enter a question.";
        return;
    }

    loading.style.display = "block";
    answerSection.style.display = "none";
    errorMessage.textContent = "";

    try {
        const response = await fetch(`${API_URL}/rag/ask`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                question: question
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail || "Failed to get an answer."
            );
        }

        answerElement.textContent =
                typeof data === "string"
        ? data
        : data.answer || data.response || data.result || data.message || data.output || JSON.stringify(data);

        answerSection.style.display = "block";

    } catch (error) {
        errorMessage.textContent = error.message;
        console.error("RAG Error:", error);
    } finally {
        loading.style.display = "none";
    }
});
