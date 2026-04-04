const token = localStorage.getItem("token");
const BASE_URL = "http://127.0.0.1:8000";

async function loadSettings() {
  const res = await fetch(`${BASE_URL}/api/accounts/teacher/settings/`, {
    headers: { "Authorization": "Token " + token }
  });

  const data = await res.json();

  document.getElementById("teacherName").value = data.teacher_name || "";
  document.getElementById("teacherEmail").value = data.teacher_email || "";

  document.getElementById("notifyStudents").checked = data.notify_students;
  document.getElementById("notifyLessons").checked = data.notify_lessons;
  document.getElementById("notifyQuizzes").checked = data.notify_quizzes;

  document.getElementById("darkMode").checked = data.dark_mode;
  document.getElementById("soundEnabled").checked = data.sound_enabled;
}

async function saveSettings() {
  const body = {
    notify_students: document.getElementById("notifyStudents").checked,
    notify_lessons: document.getElementById("notifyLessons").checked,
    notify_quizzes: document.getElementById("notifyQuizzes").checked,
    dark_mode: document.getElementById("darkMode").checked,
    sound_enabled: document.getElementById("soundEnabled").checked
  };

  const res = await fetch(`${BASE_URL}/api/accounts/teacher/settings/`, {
    method: "PUT",
    headers: {
      "Authorization": "Token " + token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (res.ok) {
    alert("تم حفظ الإعدادات بنجاح");
  } else {
    alert("فشل حفظ الإعدادات");
  }
}

loadSettings();
