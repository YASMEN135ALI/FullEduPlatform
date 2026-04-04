const token = localStorage.getItem("token");
const BASE_URL = "http://127.0.0.1:8000";

async function loadNotifications() {
  const res = await fetch(`${BASE_URL}/api/accounts/teacher/notifications/`, {
    headers: { "Authorization": "Token " + token }
  });

  const data = await res.json();
  const container = document.getElementById("notificationsList");
  container.innerHTML = "";

  if (data.length === 0) {
    container.innerHTML = `<p class="text-muted">لا توجد إشعارات حالياً</p>`;
    return;
  }

  data.forEach(n => {
    container.innerHTML += `
      <div class="notification-box">
        <div class="fw-bold">${n.title}</div>
        <div>${n.message}</div>
        <div class="notification-time mt-2">${n.created_at}</div>
      </div>
    `;
  });
}

async function clearNotifications() {
  if (!confirm("هل تريد مسح جميع الإشعارات؟")) return;

  await fetch(`${BASE_URL}/api/accounts/teacher/notifications/clear/`, {
    method: "DELETE",
    headers: { "Authorization": "Token " + token }
  });

  loadNotifications();
}

loadNotifications();
