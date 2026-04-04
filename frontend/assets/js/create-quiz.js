// استخراج lesson_id من الرابط
const urlParams = new URLSearchParams(window.location.search);
const lessonId = urlParams.get("id");   // 🔥 التعديل هنا

const questionsContainer = document.getElementById("questionsContainer");
const addQuestionBtn = document.getElementById("addQuestionBtn");

let questionCount = 0;

// إضافة سؤال جديد
addQuestionBtn.addEventListener("click", () => {
    questionCount++;

    const questionDiv = document.createElement("div");
    questionDiv.classList.add("border", "p-3", "mt-3", "rounded");
    questionDiv.setAttribute("data-question", questionCount);

    questionDiv.innerHTML = `
        <label class="form-label">نص السؤال</label>
        <input type="text" class="form-control question-text" required>

        <h6 class="mt-3">الخيارات</h6>
        <div class="choices"></div>

        <button type="button" class="btn btn-sm btn-outline-secondary mt-2 addChoiceBtn">+ إضافة خيار</button>
    `;

    questionsContainer.appendChild(questionDiv);

    // زر إضافة خيار
    const addChoiceBtn = questionDiv.querySelector(".addChoiceBtn");
    const choicesDiv = questionDiv.querySelector(".choices");

    addChoiceBtn.addEventListener("click", () => {
        const choiceDiv = document.createElement("div");
        choiceDiv.classList.add("input-group", "mt-2");

        choiceDiv.innerHTML = `
            <input type="text" class="form-control choice-text" placeholder="نص الخيار" required>
            <div class="input-group-text">
                <input type="checkbox" class="form-check-input is-correct">
                <span class="ms-1">صح؟</span>
            </div>
        `;

        choicesDiv.appendChild(choiceDiv);
    });
});


// إرسال الاختبار
document.getElementById("quizForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const quizData = {
        lesson: lessonId,
        title: document.getElementById("quiz_title").value,
        pass_score: document.getElementById("pass_score").value,
        max_attempts: document.getElementById("max_attempts").value,
        questions: []
    };

    // جمع الأسئلة
    const questionDivs = document.querySelectorAll("[data-question]");

    questionDivs.forEach(qDiv => {
        const questionText = qDiv.querySelector(".question-text").value;
        const choices = [];

        qDiv.querySelectorAll(".choice-text").forEach((choiceInput, index) => {
            const isCorrect = qDiv.querySelectorAll(".is-correct")[index].checked;

            choices.push({
                text: choiceInput.value,
                is_correct: isCorrect
            });
        });

        quizData.questions.push({
            text: questionText,
            choices: choices
        });
    });

    // إرسال البيانات للـ backend
    try {
        const response = await fetch("http://127.0.0.1:8000/api/accounts/teacher/quiz/create/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Token " + localStorage.getItem("token")
            },
            body: JSON.stringify(quizData)
        });

        const data = await response.json();

        if (response.ok) {
            alert("تم إنشاء الاختبار بنجاح");
            // 🔥 التعديل هنا أيضًا
            window.location.href = `lesson_details.html?id=${lessonId}`;
        } else {
            console.error(data);
            alert("حدث خطأ أثناء إنشاء الاختبار");
        }

    } catch (error) {
        console.error(error);
        alert("تعذر الاتصال بالسيرفر");
    }
});
