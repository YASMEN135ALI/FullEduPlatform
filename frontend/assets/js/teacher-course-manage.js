// ===============================
//  المتغيرات الأساسية
// ===============================
const token = localStorage.getItem("token");
const urlParams = new URLSearchParams(window.location.search);
const courseId = urlParams.get("id");
const BASE_URL = "http://127.0.0.1:8000";

if (!courseId) alert("لا يوجد معرف كورس في الرابط");

// نخزن رقم الكورس لاستخدامه في صفحة الدرس
localStorage.setItem("currentCourseId", courseId);

// ===============================
//  تبديل التبويبات
// ===============================
document.querySelectorAll("#courseTabs .nav-link").forEach(link => {
  link.addEventListener("click", () => {
    document.querySelectorAll("#courseTabs .nav-link").forEach(l => l.classList.remove("active"));
    link.classList.add("active");

    const tab = link.getAttribute("data-tab");
    document.querySelectorAll("#tabContent > div").forEach(div => div.classList.add("d-none"));
    document.getElementById("tab-" + tab).classList.remove("d-none");
  });
});

// ===============================
//  تحميل بيانات الكورس
// ===============================
async function loadCourseInfo() {
  const res = await fetch(`${BASE_URL}/api/accounts/teacher/course/${courseId}/`, {
    headers: { "Authorization": "Token " + token }
  });

  const text = await res.text();
  console.log("COURSE RAW:", text);

  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    console.error("❌ الرد ليس JSON — السيرفر رجّع:", text);
    return;
  }

  document.getElementById("courseTitleHeader").innerText = data.title;
  document.getElementById("courseTitle").value = data.title;
  document.getElementById("courseDescription").value = data.description;
  document.getElementById("courseLevel").value = data.level;
  document.getElementById("coursePrice").value = data.price;

  if (document.getElementById("metaLevel"))
    document.getElementById("metaLevel").innerText = data.level;
  if (document.getElementById("metaPrice"))
    document.getElementById("metaPrice").innerText = data.price + " $";
}

// ===============================
//  حفظ بيانات الكورس
// ===============================
async function saveCourseInfo() {
  const formData = new FormData();
  formData.append("title", document.getElementById("courseTitle").value);
  formData.append("description", document.getElementById("courseDescription").value);
  formData.append("level", document.getElementById("courseLevel").value);
  formData.append("price", document.getElementById("coursePrice").value);

  const image = document.getElementById("courseImage")?.files[0];
  if (image) formData.append("image", image);

  const res = await fetch(`${BASE_URL}/api/accounts/teacher/course/${courseId}/update/`, {
    method: "PUT",
    headers: { "Authorization": "Token " + token },
    body: formData
  });

  if (res.ok) {
    alert("تم حفظ التعديلات");
    loadCourseInfo();
  } else {
    alert("خطأ أثناء الحفظ");
  }
}

// ===============================
//  تحميل الدروس
// ===============================
async function loadLessons() {
  const res = await fetch(`${BASE_URL}/api/accounts/course/${courseId}/lessons/`, {
    headers: { "Authorization": "Token " + token }
  });

  const text = await res.text();
  console.log("LESSONS RAW:", text);

  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    console.error("❌ الرد ليس JSON — السيرفر رجّع:", text);
    return;
  }

  const container = document.getElementById("lessonsList");
  const quizLessonSelect = document.getElementById("quizLesson");

  if (!container) return;

  container.innerHTML = "";
  if (quizLessonSelect) quizLessonSelect.innerHTML = "";

  // API يرجّع { course_id, course_title, lessons: [...] }
  (data.lessons || []).forEach(lesson => {
    container.innerHTML += `
      <div class="item-box">
        <div>
          <div class="item-title">${lesson.order_index}. ${lesson.title}</div>
          <div class="item-sub">${lesson.content_type}</div>
        </div>
        <div class="item-actions">
          <button class="btn btn-sm btn-outline-primary"
                  onclick="window.location.href='lesson-manage.html?id=${lesson.id}'">
            تعديل
          </button>
          <button class="btn btn-sm btn-outline-danger"
                  onclick="deleteLesson(${lesson.id})">
            حذف
          </button>
        </div>
      </div>
    `;

    if (quizLessonSelect)
      quizLessonSelect.innerHTML += `<option value="${lesson.id}">${lesson.title}</option>`;
  });
}

// ===============================
//  فتح مودال إنشاء درس
// ===============================
function openCreateLessonModal() {
  if (document.getElementById("lessonTitle")) document.getElementById("lessonTitle").value = "";
  if (document.getElementById("lessonDescription")) document.getElementById("lessonDescription").value = "";
  if (document.getElementById("lessonOrder")) document.getElementById("lessonOrder").value = 1;
  const modalEl = document.getElementById("lessonModal");
  if (modalEl) new bootstrap.Modal(modalEl).show();
}

// ===============================
//  إنشاء درس جديد
// ===============================
async function createLesson() {
  const body = {
    course: courseId,
    title: document.getElementById("lessonTitle").value,
    description: document.getElementById("lessonDescription")?.value || "",
    content_type: document.getElementById("lessonContentType").value,
    order_index: document.getElementById("lessonOrder").value
  };

  const res = await fetch(`${BASE_URL}/api/accounts/teacher/lesson/create/`, {
    method: "POST",
    headers: {
      "Authorization": "Token " + token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (res.ok) {
    const modalEl = document.getElementById("lessonModal");
    if (modalEl) bootstrap.Modal.getInstance(modalEl).hide();
    loadLessons();
  } else {
    alert("فشل إنشاء الدرس");
  }
}

// ===============================
//  حذف درس من صفحة الكورس
// ===============================
async function deleteLesson(id) {
  if (!confirm("هل أنت متأكد من حذف هذا الدرس؟")) return;

  const res = await fetch(`${BASE_URL}/api/accounts/teacher/lesson/${id}/delete/`, {
    method: "DELETE",
    headers: { "Authorization": "Token " + token }
  });

  if (res.ok) {
    loadLessons();
  } else {
    alert("فشل حذف الدرس");
  }
}

// ===============================
//  الاختبارات
// ===============================
// ===============================
//  تحميل الاختبارات
// ===============================
async function loadQuizzes() {
  const res = await fetch(`${BASE_URL}/api/accounts/teacher/course/${courseId}/quizzes/`, {
    headers: { "Authorization": "Token " + token }
  });

  const text = await res.text();
  console.log("QUIZZES RAW:", text);

  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    const container = document.getElementById("quizzesList");
    if (container) {
      container.innerHTML = `<div class="alert alert-info">لا يوجد اختبارات لهذا الكورس</div>`;
    }
    return;
  }

  const container = document.getElementById("quizzesList");
  if (!container) return;

  container.innerHTML = "";

  data.forEach(q => {
    container.innerHTML += `
      <div class="item-box">
        <div>
          <div class="item-title">${q.title}</div>
          <div class="item-sub">عدد الأسئلة: ${q.questions.length}</div>
        </div>
        <div class="item-actions">
          <button class="btn btn-sm btn-outline-primary"
                  onclick="window.location.href='quiz-manage.html?id=${q.id}'">
            إدارة الاختبار
          </button>
        </div>
      </div>
    `;
  });
}

// ===============================
//  فتح مودال إنشاء اختبار
// ===============================
function openCreateQuizModal() {
  const modalEl = document.getElementById("quizModal");
  if (modalEl) new bootstrap.Modal(modalEl).show();
}

// ===============================
//  إنشاء اختبار جديد
// ===============================
async function createQuiz() {
  const body = {
    title: document.getElementById("quizTitle").value,
    description: document.getElementById("quizDescription").value,
    lesson: document.getElementById("quizLesson").value
  };

  const res = await fetch(`${BASE_URL}/api/accounts/teacher/quiz/create/`, {
    method: "POST",
    headers: {
      "Authorization": "Token " + token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (res.ok) {
    const modalEl = document.getElementById("quizModal");
    if (modalEl) bootstrap.Modal.getInstance(modalEl).hide();
    loadQuizzes();
  } else {
    alert("فشل إنشاء الاختبار");
  }
}


// ===============================
//  الطلاب (Placeholder)
// ===============================
async function loadStudents() {
  const container = document.getElementById("studentsList");
  if (!container) return;

  container.innerHTML = `
    <div class="alert alert-info">لا يوجد Endpoint لجلب الطلاب بعد</div>
  `;
}

// ===============================
//  حذف الكورس
// ===============================
async function deleteCourse() {
  if (!confirm("هل أنت متأكد من حذف الكورس نهائيًا؟")) return;

  const res = await fetch(`${BASE_URL}/api/accounts/teacher/course/${courseId}/delete/`, {
    method: "DELETE",
    headers: { "Authorization": "Token " + token }
  });

  if (res.ok) {
    alert("تم حذف الكورس");
    window.location.href = "teacher-courses.html";
  } else {
    alert("فشل الحذف");
  }
}


// ===============================
//  تحميل أولي
// ===============================
loadCourseInfo();
loadLessons();
loadQuizzes();
loadStudents();
