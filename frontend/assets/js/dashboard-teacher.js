document.addEventListener("DOMContentLoaded", function () {
    console.log("Teacher Dashboard Loaded");

    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    fetch("http://127.0.0.1:8000/api/accounts/teacher/dashboard/", {
        method: "GET",
        headers: {
            "Authorization": "Token " + token
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);

        document.getElementById("teacherName").textContent = data.teacher.full_name;
        document.getElementById("teacherSpecialization").textContent =
            data.profile.specialization || "غير محدد";

        document.getElementById("coursesCount").textContent = data.courses.length;

        document.getElementById("studentsCount").textContent = 0;
        document.getElementById("viewsCount").textContent = 0;

        const coursesList = document.getElementById("coursesList");
        coursesList.innerHTML = "";

        data.courses.forEach(course => {
            const card = `
                <div class="course-card">
                    <h5>${course.title}</h5>
                    <p>${course.description.substring(0, 120)}...</p>

                    <a href="manage-course.html?course_id=${course.id}" 
                       class="btn btn-primary btn-sm">
                       إدارة الدورة
                    </a>
                </div>
            `;
            coursesList.innerHTML += card;
        });

    })
    .catch(error => {
        console.error("Error:", error);
        alert("حدث خطأ أثناء تحميل البيانات.");
    });

    // 🔥 إصلاح logout
    setTimeout(() => {
        const logoutButton = document.querySelector(".logout-btn");
        if (logoutButton) {
            logoutButton.addEventListener("click", function () {
                localStorage.clear();
                window.location.href = "login.html";
            });
        }
    }, 500);
});
function loadTeacherNotifications() {
    fetch("http://127.0.0.1:8000/api/accounts/teacher/notifications/", {
        headers: {
            "Authorization": "Token " + localStorage.getItem("token")
        }
    })
    .then(res => res.json())
    .then(data => {

        const notifList = document.getElementById("teacherNotifList");
        const notifCount = document.getElementById("teacherNotifCount");

        if (!notifList || !notifCount) return;

        const notifications = data.notifications || [];

        notifList.innerHTML = "";

        if (notifications.length === 0) {
            notifList.innerHTML = `<li class="text-center text-muted py-2">لا توجد إشعارات</li>`;
            notifCount.classList.add("d-none");
            return;
        }

        const unread = notifications.filter(n => !n.is_read).length;

        if (unread > 0) {
            notifCount.textContent = unread;
            notifCount.classList.remove("d-none");
        } else {
            notifCount.classList.add("d-none");
        }

        notifications.slice(0, 5).forEach(n => {
            notifList.innerHTML += `
                <li>
                    <a href="${n.link || '#'}" class="dropdown-item d-flex align-items-start">
                        <i class="bi bi-${n.icon || 'info-circle'} me-2 text-primary"></i>
                        <div>
                            <strong>${n.title}</strong>
                            <div class="small text-muted">${n.message}</div>
                        </div>
                    </a>
                </li>
                <li><hr class="dropdown-divider"></li>
            `;
        });

        notifList.innerHTML += `
            <li><a href="teacher-notifications.html" class="dropdown-item text-center">عرض كل الإشعارات</a></li>
        `;
    });
}

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(loadTeacherNotifications, 500); // مهم جداً
    setInterval(loadTeacherNotifications, 10000);
});
