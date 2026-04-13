document.addEventListener("DOMContentLoaded", function () {
    loadNavbarAndFooter(); // إذا عندك هذا في main.js
    loadApplications();
});

async function loadApplications() {
    const token = localStorage.getItem("token");
    const container = document.getElementById("applicationsContainer");
    const loadingState = document.getElementById("loadingState");

    if (!token) {
        container.innerHTML = `<p class="text-muted">الرجاء تسجيل الدخول لعرض طلباتك.</p>`;
        return;
    }

    try {
        const res = await fetch(
            "http://127.0.0.1:8000/api/accounts/student/my-applications/",

            { headers: { "Authorization": "Token " + token } }
        );

        const data = await res.json();
        loadingState?.remove();

        const applications = data || [];

        updateSummary(applications);
        renderApplications(applications);
        setupFilters(applications);

    } catch (err) {
        console.error("Applications Error:", err);
        container.innerHTML = `<p class="text-danger">حدث خطأ أثناء تحميل الطلبات.</p>`;
    }
}

function updateSummary(apps) {
    const total = apps.length;
    const pending = apps.filter(a => a.status === "pending").length;
    const accepted = apps.filter(a => a.status === "accepted").length;
    const rejected = apps.filter(a => a.status === "rejected").length;

    document.getElementById("totalApplications").textContent = total;
    document.getElementById("pendingApplications").textContent = pending;
    document.getElementById("acceptedApplications").textContent = accepted;
    document.getElementById("rejectedApplications").textContent = rejected;
}

function renderApplications(apps, filterStatus = "all") {
    const container = document.getElementById("applicationsContainer");
    container.innerHTML = "";

    const filtered = filterStatus === "all"
        ? apps
        : apps.filter(a => a.status === filterStatus);

    if (filtered.length === 0) {
        container.innerHTML = `<p class="text-muted mt-3">لا توجد طلبات مطابقة لهذا الفلتر.</p>`;
        return;
    }

    filtered.forEach(app => {
        const card = document.createElement("div");
        card.className = "app-card";

        const statusBadge = getStatusBadge(app.status);
        const matchScore = app.match_score || 0;
        const missingSkills = app.missing_skills || [];
        const appliedAt = app.applied_at || "";
        const jobUrl = `job-details.html?id=${app.job_id}`;

        const insightText = generateInsight(app);

        card.innerHTML = `
            <div class="d-flex justify-content-between align-items-start mb-2">
                <div>
                    <div class="app-title">${app.job_title}</div>
                    <div class="app-company">${app.company_name}</div>
                </div>
                <div>${statusBadge}</div>
            </div>

            <div class="d-flex justify-content-between align-items-center mb-2">
                <div>
                    <div class="match-score">نسبة التطابق: ${matchScore}%</div>
                    <div class="match-bar mt-1">
                        <div class="match-bar-inner" style="width:${matchScore}%;"></div>
                    </div>
                </div>
                <div class="text-end meta-text">
                    <div>تاريخ التقديم: ${formatDate(appliedAt)}</div>
                </div>
            </div>

            <div class="mb-2">
                <span class="meta-text">المهارات الناقصة:</span>
                ${
                    missingSkills.length === 0
                        ? `<span class="skills-badge">لا توجد مهارات ناقصة 🎉</span>`
                        : missingSkills.map(s => `<span class="skills-badge">${s}</span>`).join("")
                }
            </div>

            <div class="insight-box">
                <div class="insight-title">💡 ملاحظة ذكية</div>
                <p class="insight-text">${insightText}</p>
            </div>

            <div class="mt-3 d-flex justify-content-between align-items-center">
                <button class="btn btn-outline-primary btn-view" onclick="goToJob('${jobUrl}')">
                    عرض تفاصيل الوظيفة
                </button>
            </div>
        `;

        container.appendChild(card);
    });
}

function setupFilters(apps) {
    const pills = document.querySelectorAll(".filter-pill");
    pills.forEach(pill => {
        pill.addEventListener("click", () => {
            pills.forEach(p => p.classList.remove("active"));
            pill.classList.add("active");

            const status = pill.getAttribute("data-status");
            renderApplications(apps, status);
        });
    });
}

function getStatusBadge(status) {
    if (status === "pending") {
        return `<span class="badge-status badge-pending">قيد المراجعة</span>`;
    }
    if (status === "accepted") {
        return `<span class="badge-status badge-accepted">مقبولة</span>`;
    }
    if (status === "rejected") {
        return `<span class="badge-status badge-rejected">مرفوضة</span>`;
    }
    return `<span class="badge-status badge-pending">غير محدد</span>`;
}

function generateInsight(app) {
    const status = app.status;
    const match = app.match_score || 0;
    const missing = app.missing_skills || [];

    if (status === "pending") {
        if (match >= 70) {
            return "طلبك قوي ونسبة التطابق عالية. تابع بريدك الإلكتروني بانتظام لأي رد من الشركة.";
        } else {
            return "طلبك قيد المراجعة، لكن نسبة التطابق متوسطة. حاول تحسين مهاراتك في المهارات الناقصة لفرص أفضل لاحقًا.";
        }
    }

    if (status === "accepted") {
        return "ممتاز! تم قبول طلبك. تأكد من تجهيز سيرتك الذاتية ومعلوماتك جيدًا لأي مقابلة قادمة.";
    }

    if (status === "rejected") {
        if (match < 50) {
            return "نسبة التطابق كانت منخفضة. حاول التقديم على وظائف أقرب لمهاراتك الحالية، وطور مهاراتك الناقصة.";
        } else {
            return "رغم أن نسبة التطابق جيدة، تم رفض الطلب. قد يكون السبب المنافسة العالية. لا تتوقف عن التقديم.";
        }
    }

    return "هذا الطلب لا يحتوي على حالة واضحة بعد. تابع لاحقًا لمزيد من التحديثات.";
}

function formatDate(dateStr) {
    if (!dateStr) return "غير متوفر";
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString("ar-EG");
}

function goToJob(url) {
    window.location.href = url;
}
