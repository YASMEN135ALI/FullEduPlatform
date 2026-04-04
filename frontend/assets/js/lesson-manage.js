const token = localStorage.getItem("token");
const urlParams = new URLSearchParams(window.location.search);
const lessonId = urlParams.get("id");
const BASE_URL = "http://127.0.0.1:8000";

if (!lessonId) alert("لا يوجد معرف درس في الرابط");

// رجوع للكورس
function goBackToCourse() {
  const courseId = localStorage.getItem("currentCourseId");
  if (courseId) {
    window.location.href = "teacher-course-manage.html?id=" + courseId;
  } else {
    history.back();
  }
}

// تحميل بيانات الدرس
async function loadLesson() {
  const res = await fetch(`${BASE_URL}/api/accounts/teacher/lesson/${lessonId}/`, {
    headers: { "Authorization": "Token " + token }
  });

  const text = await res.text();
  console.log("LESSON RAW:", text);

  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    console.error("❌ الرد ليس JSON — السيرفر رجّع:", text);
    return;
  }

  document.getElementById("lessonHeader").innerText = data.title;
  document.getElementById("lessonTitle").value = data.title;
  document.getElementById("lessonContentType").value = data.content_type;
  document.getElementById("lessonOrder").value = data.order_index;

  toggleContentInputs();

  if (data.content_type === "text") {
    document.getElementById("lessonContent").value = data.content || "";
  }

  if (data.content_type === "video") {
    document.getElementById("lessonVideo").value = data.video || "";
  }

  if (data.content_type === "file") {
    if (data.file) {
      document.getElementById("currentFileContainer").innerHTML = `
        <a href="${data.file}" target="_blank" class="btn btn-sm btn-outline-primary">
          عرض الملف الحالي
        </a>
      `;
    }
  }

  if (data.content_type === "link") {
    document.getElementById("lessonExternalUrl").value = data.external_url || "";
  }

  renderPreview();
}

// إظهار/إخفاء الحقول حسب نوع المحتوى
function toggleContentInputs() {
  const type = document.getElementById("lessonContentType").value;

  document.getElementById("contentTextBox").classList.add("d-none");
  document.getElementById("contentVideoBox").classList.add("d-none");
  document.getElementById("contentFileBox").classList.add("d-none");
  document.getElementById("contentLinkBox").classList.add("d-none");

  if (type === "text") document.getElementById("contentTextBox").classList.remove("d-none");
  if (type === "video") document.getElementById("contentVideoBox").classList.remove("d-none");
  if (type === "file") document.getElementById("contentFileBox").classList.remove("d-none");
  if (type === "link") document.getElementById("contentLinkBox").classList.remove("d-none");
}

// معاينة المحتوى
function renderPreview() {
  const type = document.getElementById("lessonContentType").value;
  const preview = document.getElementById("lessonPreview");

  if (type === "text") {
    const text = document.getElementById("lessonContent").value;
    preview.innerText = text || "لا يوجد محتوى نصي بعد.";
    return;
  }

  if (type === "video") {
    const url = document.getElementById("lessonVideo").value;
    if (!url) {
      preview.innerText = "ضع رابط فيديو لعرض المعاينة.";
      return;
    }
    preview.innerHTML = `
      <video src="${url}" controls style="max-width:100%; border-radius:10px;"></video>
    `;
    return;
  }

  if (type === "file") {
    const fileInput = document.getElementById("lessonFile");
    if (fileInput.files.length > 0) {
      preview.innerText = "سيتم رفع الملف: " + fileInput.files[0].name;
    } else {
      preview.innerText = "يمكنك رفع ملف جديد أو استخدام الملف الحالي.";
    }
    return;
  }

  if (type === "link") {
    const link = document.getElementById("lessonExternalUrl").value;
    if (!link) {
      preview.innerText = "ضع رابط خارجي لعرضه هنا.";
      return;
    }
    preview.innerHTML = `
      <a href="${link}" target="_blank">${link}</a>
    `;
    return;
  }

  if (type === "quiz") {
    preview.innerText = "هذا الدرس مرتبط باختبار. سيتم إدارة الأسئلة من صفحة الاختبارات.";
    return;
  }

  preview.innerText = "لا يوجد محتوى بعد.";
}

// حفظ التعديلات
async function saveLesson() {
  const type = document.getElementById("lessonContentType").value;

  const formData = new FormData();
  formData.append("title", document.getElementById("lessonTitle").value);
  formData.append("content_type", type);
  formData.append("order_index", document.getElementById("lessonOrder").value);

  if (type === "text") {
    formData.append("content", document.getElementById("lessonContent").value);
  }

  if (type === "video") {
    formData.append("video", document.getElementById("lessonVideo").value);
  }

  if (type === "file") {
    const file = document.getElementById("lessonFile").files[0];
    if (file) formData.append("file", file);
  }

  if (type === "link") {
    formData.append("external_url", document.getElementById("lessonExternalUrl").value);
  }

  const res = await fetch(`${BASE_URL}/api/accounts/teacher/lesson/${lessonId}/update/`, {
    method: "PUT",
    headers: { "Authorization": "Token " + token },
    body: formData
  });

  if (res.ok) {
    alert("تم حفظ التعديلات");
    loadLesson();
  } else {
    alert("فشل حفظ التعديلات");
  }
}

// حذف الدرس
async function deleteLesson() {
  if (!confirm("هل أنت متأكد من حذف هذا الدرس؟")) return;

  const res = await fetch(`${BASE_URL}/api/accounts/teacher/lesson/${lessonId}/delete/`, {
    method: "DELETE",
    headers: { "Authorization": "Token " + token }
  });

  if (res.ok) {
    alert("تم حذف الدرس");
    goBackToCourse();
  } else {
    alert("فشل حذف الدرس");
  }
}

// تحميل أولي
loadLesson();
