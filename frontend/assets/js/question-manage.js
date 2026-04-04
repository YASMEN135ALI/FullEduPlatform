const token = localStorage.getItem("token");
const urlParams = new URLSearchParams(window.location.search);
const questionId = urlParams.get("id");
const quizId = urlParams.get("quiz");
const BASE_URL = "http://127.0.0.1:8000";

if (!questionId && !quizId) alert("لا يوجد معرف سؤال أو اختبار");

// رجوع للاختبار
function goBackToQuiz() {
  const id = quizId || localStorage.getItem("currentQuizId");
  window.location.href = "quiz-manage.html?id=" + id;
}

// تحميل بيانات السؤال
async function loadQuestion() {
  if (!questionId) {
    document.getElementById("questionHeader").innerText = "سؤال جديد";
    return;
  }

  const res = await fetch(`${BASE_URL}/api/accounts/teacher/question/${questionId}/`, {
    headers: { "Authorization": "Token " + token }
  });

  const text = await res.text();
  console.log("QUESTION RAW:", text);

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    alert("خطأ في تحميل بيانات السؤال");
    return;
  }

  // حفظ quizId في حال لم يكن موجودًا
  if (!quizId && data.quiz_id) {
    localStorage.setItem("currentQuizId", data.quiz_id);
  }

  document.getElementById("questionHeader").innerText = data.text;
  document.getElementById("questionText").value = data.text;

  renderChoices(data.choices);
}

// عرض الخيارات
function renderChoices(choices) {
  const container = document.getElementById("choicesList");
  container.innerHTML = "";

  choices.forEach(choice => {
    container.innerHTML += `
      <div class="choice-box">
        <input type="text" class="form-control mb-2" value="${choice.text}"
               onchange="updateChoice(${choice.id}, this.value)">
        
        <label class="mt-2">
          <input type="radio" name="correctChoice" ${choice.is_correct ? "checked" : ""}
                 onclick="setCorrectChoice(${choice.id})">
          الإجابة الصحيحة
        </label>

        <button class="btn btn-sm btn-outline-danger mt-2"
                onclick="deleteChoice(${choice.id})">
          حذف الخيار
        </button>
      </div>
    `;
  });
}

// إضافة خيار جديد
async function addChoice() {
  const body = {
    question_id: questionId,
    text: "خيار جديد"
  };

  const res = await fetch(`${BASE_URL}/api/accounts/teacher/choice/create/`, {
    method: "POST",
    headers: {
      "Authorization": "Token " + token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (res.ok) loadQuestion();
  else alert("فشل إضافة الخيار");
}

// تعديل نص خيار
async function updateChoice(choiceId, newText) {
  const body = { text: newText };

  await fetch(`${BASE_URL}/api/accounts/teacher/choice/${choiceId}/update/`, {
    method: "PUT",
    headers: {
      "Authorization": "Token " + token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
}

// تحديد الإجابة الصحيحة
async function setCorrectChoice(choiceId) {
  await fetch(`${BASE_URL}/api/accounts/teacher/choice/${choiceId}/set-correct/`, {
    method: "POST",
    headers: { "Authorization": "Token " + token }
  });

  loadQuestion();
}

// حذف خيار
async function deleteChoice(choiceId) {
  if (!confirm("هل تريد حذف هذا الخيار؟")) return;

  const res = await fetch(`${BASE_URL}/api/accounts/teacher/choice/${choiceId}/delete/`, {
    method: "DELETE",
    headers: { "Authorization": "Token " + token }
  });

  if (res.ok) loadQuestion();
  else alert("فشل حذف الخيار");
}

// حفظ السؤال
async function saveQuestion() {
  const body = {
    text: document.getElementById("questionText").value,
    quiz_id: quizId
  };

  const url = questionId
    ? `${BASE_URL}/api/accounts/teacher/question/${questionId}/update/`
    : `${BASE_URL}/api/accounts/teacher/question/create/`;

  const method = questionId ? "PUT" : "POST";

  const res = await fetch(url, {
    method: method,
    headers: {
      "Authorization": "Token " + token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (res.ok) {
    alert("تم حفظ السؤال");
    goBackToQuiz();
  } else {
    alert("فشل حفظ السؤال");
  }
}

// حذف السؤال
async function deleteQuestion() {
  if (!questionId) return;

  if (!confirm("هل تريد حذف هذا السؤال؟")) return;

  const res = await fetch(`${BASE_URL}/api/accounts/teacher/question/${questionId}/delete/`, {
    method: "DELETE",
    headers: { "Authorization": "Token " + token }
  });

  if (res.ok) {
    alert("تم حذف السؤال");
    goBackToQuiz();
  } else {
    alert("فشل حذف السؤال");
  }
}

// تحميل أولي
loadQuestion();
