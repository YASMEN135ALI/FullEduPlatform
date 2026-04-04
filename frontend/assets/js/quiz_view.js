let QUIZ_ID = null;
let COURSE_ID = null;
let answers = {};

document.addEventListener("DOMContentLoaded", async function () {

    const token = localStorage.getItem("token");
    const userType = localStorage.getItem("user_type");

    if (!token || userType !== "student") {
        window.location.href = "login.html";
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const lessonId = urlParams.get("lesson");

    if (!lessonId) {
        alert("لا يوجد اختبار مرتبط بهذا الدرس.");
        return;
    }

    await loadQuiz(lessonId);

    document.getElementById("submitBtn").onclick = () => {
        submitQuiz();
    };
});


// ======================================================
// 1) تحميل بيانات الاختبار
// ======================================================
async function loadQuiz(lessonId) {
    const token = localStorage.getItem("token");

    try {
        const res = await fetch(`http://127.0.0.1:8000/api/accounts/quiz/${lessonId}/`, {
            headers: { "Authorization": "Token " + token }
        });

        if (!res.ok) {
            throw new Error("فشل تحميل الاختبار");
        }

        const quiz = await res.json();

        // حفظ quiz_id الصحيح
        QUIZ_ID = quiz.quiz_id;

        // حفظ course_id من أول سؤال (لأن الـ API لا ترجع course مباشرة)
        if (quiz.questions.length > 0) {
            COURSE_ID = quiz.questions[0].course;
        }

        document.getElementById("quizTitle").textContent = quiz.title;

        const container = document.getElementById("questionsContainer");
        container.innerHTML = "";

        quiz.questions.forEach((q, index) => {
            let html = `
                <div class="question-box">
                    <h5 class="fw-bold">السؤال ${index + 1}:</h5>
                    <p>${q.text}</p>
            `;

            q.choices.forEach(choice => {
                html += `
                    <div class="choice-item" onclick="selectChoice(${q.id}, ${choice.id}, this)">
                        ${choice.text}
                    </div>
                `;
            });

            html += `</div>`;
            container.innerHTML += html;
        });

    } catch (error) {
        console.error(error);
        alert("حدث خطأ أثناء تحميل الاختبار.");
    }
}


// ======================================================
// 2) اختيار الإجابة
// ======================================================
function selectChoice(questionId, choiceId, element) {

    answers[questionId] = choiceId;

    const siblings = element.parentElement.querySelectorAll(".choice-item");
    siblings.forEach(el => el.classList.remove("choice-selected"));

    element.classList.add("choice-selected");
}


// ======================================================
// 3) إرسال الإجابات
// ======================================================
async function submitQuiz() {
    const token = localStorage.getItem("token");

    if (!QUIZ_ID) {
        alert("لا يمكن إرسال الاختبار: لا يوجد Quiz ID.");
        return;
    }

    const formattedAnswers = Object.keys(answers).map(qId => {
        return {
            question: parseInt(qId),
            choice: answers[qId]
        };
    });

    try {
        const res = await fetch(`http://127.0.0.1:8000/api/accounts/quiz/${QUIZ_ID}/submit/`, {
            method: "POST",
            headers: {
                "Authorization": "Token " + token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ answers: formattedAnswers })
        });

        const data = await res.json();

        if (res.ok) {
            alert(`تم إرسال الاختبار بنجاح! نتيجتك: ${data.score}`);

            // الرجوع للكورس
            window.location.href = `course-detail.html?id=${COURSE_ID}`;

        } else {
            alert(data.detail || "فشل إرسال الاختبار");
        }

    } catch (error) {
        console.error(error);
        alert("حدث خطأ أثناء إرسال الاختبار.");
    }
}
