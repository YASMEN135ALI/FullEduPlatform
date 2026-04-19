
document.addEventListener("DOMContentLoaded", loadAllNotifications);

async function loadAllNotifications() {
    const token = localStorage.getItem("token");
    if (!token) return;

    const response = await fetch("http://127.0.0.1:8000/api/accounts/notifications/student/", {
        headers: { "Authorization": "Token " + token }
    });

    const data = await response.json();
    const list = document.getElementById("all-notifs");
    const count = document.getElementById("notifCount");
    const emptyMsg = document.getElementById("noNotificationsMsg");

    list.innerHTML = "";

    // unread count
    const unread = data.filter(n => !n.is_read).length;
    count.textContent = unread;

    if (data.length === 0) {
        emptyMsg.classList.remove("d-none");
        return;
    }

    emptyMsg.classList.add("d-none");

    data.forEach(n => {
        list.innerHTML += `
            <div class="card p-3 mb-2 notification-card ${n.is_read ? '' : 'unread'}">

                <div class="d-flex align-items-start">

                    <i class="bi bi-${n.icon || 'bell'} notif-icon me-3"></i>

                    <div class="flex-grow-1">
                        <strong>${n.title}</strong>
                        <p class="small text-muted mb-1">${n.message}</p>

                        ${n.link ? `<a href="${n.link}" class="small text-primary">عرض التفاصيل</a>` : ""}
                    </div>

                    <button class="btn btn-sm btn-danger" onclick="deleteNotif(${n.id})">
                        حذف
                    </button>

                </div>

            </div>
        `;
    });
}

async function markAllRead() {
    const token = localStorage.getItem("token");

    await fetch("http://127.0.0.1:8000/api/accounts/notifications/student/mark-read/", {
        method: "POST",
        headers: { "Authorization": "Token " + token }
    });

    loadAllNotifications();
}

async function deleteNotif(id) {
    const token = localStorage.getItem("token");

    await fetch(`http://127.0.0.1:8000/api/accounts/notifications/student/delete/${id}/`, {
        method: "DELETE",
        headers: { "Authorization": "Token " + token }
    });

    loadAllNotifications();
}
