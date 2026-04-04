
document.addEventListener("DOMContentLoaded", async function () {

    const token = localStorage.getItem("token");

    const listEl = document.getElementById("notificationsList");
    const noMsg = document.getElementById("noNotificationsMsg");
    const notifCount = document.getElementById("notifCount");
    const markAllBtn = document.getElementById("markAllRead");

    try {
        const response = await fetch("http://127.0.0.1:8000/api/accounts/company/notifications/", {
            headers: { "Authorization": "Token " + token }
        });

        const notifications = await response.json();

        if (notifications.length === 0) {
            noMsg.classList.remove("d-none");
            notifCount.textContent = "0";
            return;
        }

        notifCount.textContent = notifications.length;

        notifications.forEach(n => {
            // تحديد اللون حسب نوع الإشعار
            let statusClass = "bg-light";
            let icon = '<i class="bi bi-bell"></i>';

            if (n.type === "accepted") {
                statusClass = "bg-success text-white";
                icon = '<i class="bi bi-check-circle"></i>';
            } else if (n.type === "rejected") {
                statusClass = "bg-danger text-white";
                icon = '<i class="bi bi-x-circle"></i>';
            } else if (n.type === "new_applicant") {
                statusClass = "bg-info text-dark";
                icon = '<i class="bi bi-file-earmark-person"></i>';
            }

            listEl.innerHTML += `
                <li class="list-group-item d-flex justify-content-between align-items-center ${statusClass}">
                    <span>${icon} ${n.message}</span>
                    <small class="text-muted">${n.created_at.substring(0, 10)}</small>
                </li>
            `;
        });

    } catch (error) {
        console.error(error);
        alert("حدث خطأ أثناء تحميل الإشعارات");
    }

    // تحديد الكل كمقروء
    markAllBtn.addEventListener("click", async function () {
        try {
            const response = await fetch("http://127.0.0.1:8000/api/accounts/company/notifications/mark-read/", {
                method: "PUT",
                headers: { "Authorization": "Token " + token }
            });

            if (response.ok) {
                alert("تم تحديد كل الإشعارات كمقروءة");
                location.reload();
            } else {
                alert("حدث خطأ أثناء تحديث الإشعارات");
            }
        } catch (error) {
            console.error(error);
            alert("تعذر الاتصال بالخادم");
        }
    });

});
