
const API_URL = "http://127.0.0.1:8000";


// ===============================
// TOKEN & ROLE
// ===============================

function getToken() {
    return localStorage.getItem("access_token");
}


function getRole() {
    return localStorage.getItem("role");
}


// ===============================
// PAGE CONTROL
// ===============================

function hideAllPages() {

    document.getElementById("registerPage").classList.add("hidden");
    document.getElementById("loginPage").classList.add("hidden");
    document.getElementById("dashboardPage").classList.add("hidden");
    document.getElementById("addQuestionPage").classList.add("hidden");
    document.getElementById("getQuestionPage").classList.add("hidden");
    document.getElementById("deleteQuestionPage").classList.add("hidden");
    document.getElementById("reportPage").classList.add("hidden");
}


function showRegister() {

    hideAllPages();

    document.getElementById("registerPage")
        .classList.remove("hidden");
}


function showLogin() {

    hideAllPages();

    document.getElementById("loginPage")
        .classList.remove("hidden");
}


function showDashboard() {

    hideAllPages();

    document.getElementById("dashboardPage")
        .classList.remove("hidden");


    const role = getRole();

    document.getElementById("userRole")
        .innerText = `(${role || ""})`;


    // ADMIN ONLY BUTTONS

    if (role === "admin") {

        document.getElementById("addQuestionButton")
            .style.display = "block";

        document.getElementById("deleteQuestionButton")
            .style.display = "block";

    } else {

        document.getElementById("addQuestionButton")
            .style.display = "none";

        document.getElementById("deleteQuestionButton")
            .style.display = "none";
    }
}


function showAddQuestion() {

    if (getRole() !== "admin") {

        alert("Only admin can add questions.");

        return;
    }


    hideAllPages();


    document.getElementById("addQuestionPage")
        .classList.remove("hidden");


    const questionList =
        document.getElementById("questionList");


    // First question

    if (questionList.children.length === 0) {

        addQuestionForm();
    }
}


function showGetQuestion() {

    hideAllPages();

    document.getElementById("getQuestionPage")
        .classList.remove("hidden");

    getQuestions();
}


function showDeleteQuestion() {

    if (getRole() !== "admin") {

        alert("Only admin can delete questions.");

        return;
    }


    hideAllPages();

    document.getElementById("deleteQuestionPage")
        .classList.remove("hidden");
}


function showReport() {

    hideAllPages();

    document.getElementById("reportPage")
        .classList.remove("hidden");
}



// ===============================
// REGISTER
// ===============================

const registerForm =
    document.getElementById("registerForm");


registerForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const userData = {

            name:
                document.getElementById("name").value,

            email:
                document.getElementById("email").value,

            college:
                document.getElementById("college").value,

            division:
                document.getElementById("division").value,

            degree:
                document.getElementById("degree").value,

            role:
                document.getElementById("role").value,

            password:
                document.getElementById("password").value
        };


        try {

            const response = await fetch(
                `${API_URL}/auth/register`,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(userData)
                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                document.getElementById(
                    "registerMessage"
                ).innerText =
                    data.detail ||
                    "Registration failed";

                return;
            }


            document.getElementById(
                "registerMessage"
            ).innerText =
                "Registration successful!";


            registerForm.reset();


            setTimeout(
                () => {

                    showLogin();

                },
                1000
            );


        } catch (error) {

            document.getElementById(
                "registerMessage"
            ).innerText =
                "Backend connection failed.";

            console.error(error);
        }

    }
);



// ===============================
// LOGIN
// ===============================

const loginForm =
    document.getElementById("loginForm");


loginForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const loginData = {

            email:
                document.getElementById(
                    "loginEmail"
                ).value,

            password:
                document.getElementById(
                    "loginPassword"
                ).value
        };


        try {

            const response = await fetch(
                `${API_URL}/auth/login`,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(loginData)
                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                document.getElementById(
                    "loginMessage"
                ).innerText =
                    data.detail ||
                    "Login failed";

                return;
            }


            // =========================
            // SAVE TOKEN
            // =========================

            localStorage.setItem(
                "access_token",
                data.access_token
            );


            // =========================
            // SAVE ROLE
            // =========================

            localStorage.setItem(
                "role",
                data.role
            );


            document.getElementById(
                "loginMessage"
            ).innerText =
                "Login successful!";


            setTimeout(
                () => {

                    showDashboard();

                },
                500
            );


        } catch (error) {

            document.getElementById(
                "loginMessage"
            ).innerText =
                "Backend connection failed.";

            console.error(error);
        }

    }
);



// ===============================
// ADD QUESTION
// ===============================

let questionNumber = 0;


function addQuestionForm() {

    questionNumber++;


    const questionList =
        document.getElementById(
            "questionList"
        );


    const questionBox =
        document.createElement("div");


    questionBox.className =
        "question-box";


    questionBox.innerHTML = `

        <h3>
            Question ${questionNumber}
        </h3>


        <input
            type="text"
            class="question"
            placeholder="Question"
            required
        >


        <input
            type="text"
            class="option_a"
            placeholder="Option A"
            required
        >


        <input
            type="text"
            class="option_b"
            placeholder="Option B"
            required
        >


        <input
            type="text"
            class="option_c"
            placeholder="Option C"
            required
        >


        <input
            type="text"
            class="option_d"
            placeholder="Option D"
            required
        >


        <select
            class="correct_answer"
            required
        >

            <option value="">
                Select Correct Answer
            </option>

            <option value="A">
                A
            </option>

            <option value="B">
                B
            </option>

            <option value="C">
                C
            </option>

            <option value="D">
                D
            </option>

        </select>


        <input
            type="number"
            class="marks"
            placeholder="Marks"
            required
        >

        <hr>

    `;


    questionList.appendChild(
        questionBox
    );
}



// ===============================
// SUBMIT ALL QUESTIONS
// ===============================

const questionForm =
    document.getElementById(
        "questionForm"
    );


questionForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const token = getToken();


        if (!token) {

            alert("Please login first.");

            showLogin();

            return;
        }


        const questionBoxes =
            document.querySelectorAll(
                ".question-box"
            );


        if (questionBoxes.length === 0) {

            document.getElementById(
                "questionMessage"
            ).innerText =
                "Please add at least one question.";

            return;
        }


        let successCount = 0;


        for (const box of questionBoxes) {

            const questionData = {

                question:
                    box.querySelector(
                        ".question"
                    ).value,

                option_a:
                    box.querySelector(
                        ".option_a"
                    ).value,

                option_b:
                    box.querySelector(
                        ".option_b"
                    ).value,

                option_c:
                    box.querySelector(
                        ".option_c"
                    ).value,

                option_d:
                    box.querySelector(
                        ".option_d"
                    ).value,

                correct_answer:
                    box.querySelector(
                        ".correct_answer"
                    ).value,

                marks:
                    Number(
                        box.querySelector(
                            ".marks"
                        ).value
                    )
            };


            try {

                const response =
                    await fetch(
                        `${API_URL}/quiz/questions`,
                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    `Bearer ${token}`
                            },

                            body:
                                JSON.stringify(
                                    questionData
                                )
                        }
                    );


                const data =
                    await response.json();


                if (response.ok) {

                    successCount++;

                } else {

                    console.error(
                        "Question Error:",
                        data
                    );
                }


            } catch (error) {

                console.error(error);
            }
        }


        document.getElementById(
            "questionMessage"
        ).innerText =
            `${successCount} question(s) added successfully.`;


        // Reset

        document.getElementById(
            "questionList"
        ).innerHTML = "";


        questionNumber = 0;


        // New first question

        addQuestionForm();

    }
);



// ===============================
// GET QUESTIONS
// ===============================

let loadedQuestions = [];


async function getQuestions() {

    const token = getToken();


    if (!token) {

        alert("Please login first.");

        showLogin();

        return;
    }


    const container =
        document.getElementById(
            "questionsContainer"
        );


    container.innerHTML =
        "<p>Loading questions...</p>";


    try {

        const response =
            await fetch(
                `${API_URL}/quiz/get`,
                {

                    method: "GET",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            container.innerHTML =
                `<p>${
                    data.detail ||
                    "Failed to get questions."
                }</p>`;

            return;
        }


        loadedQuestions =
            data.question || [];


        container.innerHTML = "";


        if (loadedQuestions.length === 0) {

            container.innerHTML =
                "<p>No questions found.</p>";

            return;
        }


        loadedQuestions.forEach(
            (item, index) => {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "question-card";


                card.innerHTML = `

                    <h3>
                        Question ${index + 1}
                    </h3>


                    <p>
                        <strong>
                            ${item.question}
                        </strong>
                    </p>


                    <label>

                        <input
                            type="radio"
                            name="question_${item.id}"
                            value="A"
                        >

                        A. ${item.option_a}

                    </label>


                    <label>

                        <input
                            type="radio"
                            name="question_${item.id}"
                            value="B"
                        >

                        B. ${item.option_b}

                    </label>


                    <label>

                        <input
                            type="radio"
                            name="question_${item.id}"
                            value="C"
                        >

                        C. ${item.option_c}

                    </label>


                    <label>

                        <input
                            type="radio"
                            name="question_${item.id}"
                            value="D"
                        >

                        D. ${item.option_d}

                    </label>

                `;


                container.appendChild(
                    card
                );
            }
        );


    } catch (error) {

        container.innerHTML =
            "<p>Backend connection failed.</p>";

        console.error(error);
    }
}



// ===============================
// SUBMIT QUIZ
// ===============================

const quizForm =
    document.getElementById(
        "quizForm"
    );


quizForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const token = getToken();


        if (!token) {

            alert("Please login first.");

            showLogin();

            return;
        }


        const answers = [];


        loadedQuestions.forEach(
            (item) => {

                const selected =
                    document.querySelector(
                        `input[name="question_${item.id}"]:checked`
                    );


                if (selected) {

                    answers.push({

                        question_id:
                            item.id,

                        answer:
                            selected.value
                    });
                }
            }
        );


        if (answers.length === 0) {

            alert(
                "Please select at least one answer."
            );

            return;
        }


        const submitData = {

            answers: answers
        };


        try {

            const response =
                await fetch(
                    `${API_URL}/quiz/submit`,
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`
                        },

                        body:
                            JSON.stringify(
                                submitData
                            )
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                alert(
                    data.detail ||
                    "Quiz submission failed."
                );

                return;
            }


            // REPORT

            document.getElementById(
                "correctCount"
            ).innerText =
                data.correct;


            document.getElementById(
                "wrongCount"
            ).innerText =
                data.wrong;


            document.getElementById(
                "totalMarks"
            ).innerText =
                data.marks;


            document.getElementById(
                "quizResult"
            ).innerText =
                data.result;


            showReport();


        } catch (error) {

            console.error(error);

            alert(
                "Backend connection failed."
            );
        }

    }
);



// ===============================
// DELETE QUESTION
// ===============================

const deleteForm =
    document.getElementById(
        "deleteForm"
    );


deleteForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const token = getToken();


        if (!token) {

            alert("Please login first.");

            showLogin();

            return;
        }


        const questionId =
            document.getElementById(
                "questionId"
            ).value;


        try {

            const response =
                await fetch(
                    `${API_URL}/quiz/delete/${questionId}`,
                    {

                        method: "DELETE",

                        headers: {

                            "Authorization":
                                `Bearer ${token}`
                        }
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                document.getElementById(
                    "deleteMessage"
                ).innerText =
                    data.detail ||
                    "Delete failed";

                return;
            }


            document.getElementById(
                "deleteMessage"
            ).innerText =
                data.message;


            deleteForm.reset();


        } catch (error) {

            document.getElementById(
                "deleteMessage"
            ).innerText =
                "Backend connection failed.";

            console.error(error);
        }

    }
);



// ===============================
// LOGOUT
// ===============================

function logout() {

    localStorage.removeItem(
        "access_token"
    );

    localStorage.removeItem(
        "role"
    );


    showLogin();
}


// ===============================
// START
// ===============================

// जर आधी login केलेला असेल तर
// direct dashboard

if (getToken() && getRole()) {

    showDashboard();

} else {

    showRegister();

}

