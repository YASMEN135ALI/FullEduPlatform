// ===============================
//  تحميل الطلبات عند فتح الصفحة
// ===============================
document.addEventListener("DOMContentLoaded", function () {
    loadApplications();
});

// ===============================
//  جلب الطلبات من الـ API
// ===============================
let allApplications = []; // نخزن كل الطلبات هنا

function loadApplications() {
    const token = localStorage.getItem("token");

    if (!token) {
        document.getElementById("applicationsContainer").innerHTML =
            `<div class="text-center py-5 text-danger">يجب تسجيل الدخول أولاً.</div>`;
        return;
    }

    fetch("http://127.0.0.1:8000/api/accounts/student/my-applications/", {
        method: "GET",
        headers: {
            "Authorization": "Token " + token
        }
    })
    .then(response => {
        if (response.status === 401) {
            document.getElementById("applicationsContainer").innerHTML =
                `<div class="text-center py-5 text-danger">غير مصرح. سجّلي دخول من جديد.</div>`;
            return [];
        }
        return response.json();
    })
    .then(data => {
        allApplications = data; // نخزن الطلبات الأصلية
        renderApplications(data); // نعرض الطلبات
    })
    .catch(error => {
        document.getElementById("applicationsContainer").innerHTML =
            `<div class="text-center py-5 text-danger">حدث خطأ أثناء تحميل الطلبات.</div>`;
    });
}

// ===============================
//  عرض الطلبات في الصفحة
// ===============================
function renderApplications(applications) {
    const container = document.getElementById("applicationsContainer");
    container.innerHTML = "";

    if (!applications || applications.length === 0) {
        container.innerHTML =
            `<div class="text-center py-5 text-muted">لا يوجد أي طلبات.</div>`;
        updateSummary(0, 0, 0, 0);
        return;
    }

    // عدّاد الحالات
    let total = applications.length;
    let pending = applications.filter(a => a.status === "pending").length;
    let accepted = applications.filter(a => a.status === "accepted").length;
    let rejected = applications.filter(a => a.status === "rejected").length;

    updateSummary(total, pending, accepted, rejected);

    // إنشاء البطاقات
    applications.forEach(app => {
        const card = document.createElement("div");
        card.className = "app-card";

        card.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <div>
                    <div class="app-title">${app.job_title}</div>
                    <div class="app-company">${app.company_name}</div>
                </div>
                <span class="badge-status badge-${app.status}">
                    ${translateStatus(app.status)}
                </span>
            </div>

            <button class="btn btn-primary btn-view" onclick="viewApplication(${app.id})">
                عرض التفاصيل
            </button>
        `;

        container.appendChild(card);
    });
}

// ===============================
//  تحديث العدادات
// ===============================
function updateSummary(total, pending, accepted, rejected) {
    document.getElementById("totalApplications").innerText = total;
    document.getElementById("pendingApplications").innerText = pending;
    document.getElementById("acceptedApplications").innerText = accepted;
    document.getElementById("rejectedApplications").innerText = rejected;
}

// ===============================
//  ترجمة الحالات للعربي
// ===============================
function translateStatus(status) {
    switch (status) {
        case "pending": return "قيد المراجعة";
        case "accepted": return "مقبولة";
        case "rejected": return "مرفوضة";
        default: return status;
    }
}

// ===============================
//  الفلترة حسب الحالة
// ===============================
document.querySelectorAll(".filter-pill").forEach(btn => {
    btn.addEventListener("click", function () {

        // إزالة active من الكل
        document.querySelectorAll(".filter-pill").forEach(b => b.classList.remove("active"));

        // إضافة active للزر الحالي
        this.classList.add("active");

        const status = this.getAttribute("data-status");

        if (status === "all") {
            renderApplications(allApplications);
        } else {
            const filtered = allApplications.filter(app => app.status === status);
            renderApplications(filtered);
        }
    });
});

// ===============================
//  زر عرض التفاصيل
// ===============================
function viewApplication(id) {
    window.location.href = `application-details.html?app_id=${id}`;
}
