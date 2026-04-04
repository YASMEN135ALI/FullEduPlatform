const token = localStorage.getItem("token");
const urlParams = new URLSearchParams(window.location.search);
const quizId = urlParams.get("id");
const BASE_URL = "http://127.0.0.1:8000";

if (!quizId) alert("لا يوجد معرف اختبار في الرابط");

// رجوع للكورس
function goBackToCourse() {
  const courseId = localStorage.getItem("currentCourseId");
  window.location.href = "teacher-course-manage.html?id=" + courseId;
}

// تحميل بيانات الاختبار
async function loadQuiz() {
  localStorage.setItem("currentQuizId", quizId);

  const res = await fetch(`${BASE_URL}/api/accounts/teacher/quiz/${quizId}/`, {
    headers: { "Authorization": "Token " + token }
  });

  const text = await res.text();
  console.log("QUIZ RAW:", text);

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    alert("خطأ في تحميل بيانات الاختبار");
    return;
  }

  document.getElementById("quizHeader").innerText = data.title;
  document.getElementById("quizTitle").value = data.title;
  document.getElementById("quizDescription").value = data.description || "";
  document.getElementById("quizPassScore").value = data.pass_score;
  document.getElementById("quizAttempts").value = data.max_attempts;

  renderQuestions(data.questions);
}

// عرض الأسئلة
function renderQuestions(questions) {
  const container = document.getElementById("questionsList");
  container.innerHTML = "";

  questions.forEach(q => {
    container.innerHTML += `
      <div class="question-box">
        <div class="fw-bold">${q.text}</div>
        <div class="text-muted">عدد الخيارات: ${q.choices.length}</div>

        <button class="btn btn-sm btn-outline-primary mt-2"
                onclick="window.location.href='question-manage.html?id=${q.id}'">
          إدارة السؤال
        </button>
      </div>
    `;
  });
}

// حفظ التعديلات
async function saveQuiz() {
  const body = {
    title: document.getElementById("quizTitle").value,
    description: document.getElementById("quizDescription").value,
    pass_score: document.getElementById("quizPassScore").value,
    max_attempts: document.getElementById("quizAttempts").value
  };

  const res = await fetch(`${BASE_URL}/api/accounts/teacher/quiz/${quizId}/update/`, {
    method: "PUT",
    headers: {
      "Authorization": "Token " + token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (res.ok) {
    alert("تم حفظ التعديلات");
    loadQuiz();
  } else {
    alert("فشل حفظ التعديلات");
  }
}

// حذف الاختبار
async function deleteQuiz() {
  if (!confirm("هل أنت متأكد من حذف الاختبار؟")) return;

  const res = await fetch(`${BASE_URL}/api/accounts/teacher/quiz/${quizId}/delete/`, {
    method: "DELETE",
    headers: { "Authorization": "Token " + token }
  });

  if (res.ok) {
    alert("تم حذف الاختبار");
    goBackToCourse();
  } else {
    alert("فشل حذف الاختبار");
  }
}

// إنشاء سؤال جديد
function createQuestion() {
  window.location.href = `question-manage.html?quiz=${quizId}`;
}

// تحميل أولي
loadQuiz();
