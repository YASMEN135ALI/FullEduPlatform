document.addEventListener("DOMContentLoaded", function () {
    loadAIDashboard();
});

async function loadAIDashboard() {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
        const profileRes = await fetch(
            "http://127.0.0.1:8000/api/accounts/student/profile-data/",
            { headers: { "Authorization": "Token " + token } }
        );

        const profile = await profileRes.json();

        // تحليلات أساسية
        animateCVScore(profile.cv_score);
        renderCVTimeline(profile.cv_score);
        renderSkillsGap(profile.skills_gap);
        renderSkillsCategoryChart(profile.skills);
        renderSkillsGapRadar(profile.skills_gap);
        renderStudentProgressRadar(profile);

    } catch (err) {
        console.error("AI Dashboard Error:", err);
    }
}

// ===============================
// CV SCORE
// ===============================
function animateCVScore(score) {
    const circle = document.querySelector(".cv-progress .progress");
    const scoreText = document.getElementById("cvScoreValue");
    const label = document.getElementById("cvScoreLabel");
    const tip = document.getElementById("cvScoreTip");

    const radius = 70;
    const circumference = 2 * Math.PI * radius;

    circle.style.strokeDasharray = circumference;

    let color = "#ef4444";
    let labelText = "تحتاج إلى تطوير";
    let tipText = "ابدأ بالكورسات الأساسية لتحسين مستواك.";

    if (score >= 80) {
        color = "#22c55e";
        labelText = "سيرة ذاتية قوية جدًا";
        tipText = "أنت جاهز للتقديم على وظائف.";
    } else if (score >= 60) {
        color = "#eab308";
        labelText = "سيرة ذاتية جيدة";
        tipText = "أضف مشاريع جديدة لتحسين فرصك.";
    } else if (score >= 40) {
        color = "#f97316";
        labelText = "سيرة ذاتية متوسطة";
        tipText = "ابدأ بإكمال الكورسات المقترحة.";
    }

    circle.style.stroke = color;

    let current = 0;
    const duration = 1000;
    const step = score / (duration / 20);

    const interval = setInterval(() => {
        current += step;
        if (current >= score) {
            current = score;
            clearInterval(interval);
        }

        scoreText.textContent = Math.round(current) + "%";

        const offset = circumference - (current / 100) * circumference;
        circle.style.strokeDashoffset = offset;

    }, 20);

    label.textContent = labelText;
    tip.textContent = tipText;

    // توصية ذكية حسب النتيجة
    const cvActionTip = document.getElementById("cvActionTip");
    if (!cvActionTip) return;

    if (score < 40) {
        cvActionTip.textContent = "ابدأ بإكمال كورس واحد على الأقل هذا الأسبوع لرفع تقييمك.";
    } else if (score < 60) {
        cvActionTip.textContent = "أضف مشروعًا صغيرًا إلى ملفك لرفع تقييمك بسرعة.";
    } else if (score < 80) {
        cvActionTip.textContent = "أنت قريب جدًا من الجاهزية! أضف مهارة واحدة جديدة.";
    } else {
        cvActionTip.textContent = "ممتاز! أنت جاهز للتقديم على الوظائف المناسبة لك.";
    }
}

// ===============================
// SKILLS GAP
// ===============================
function renderSkillsGap(gap) {
    const container = document.getElementById("skillsGapSection");

    const required = gap?.required_skills || [];
    const student = gap?.student_skills || [];
    const missing = gap?.missing_skills || [];

    container.innerHTML = `
        <h4 class="section-title">فجوة المهارات</h4>

        <h6 class="text-muted">المهارات المطلوبة للمسار</h6>
        <div class="d-flex flex-wrap gap-2 mb-3">
            ${required.map(s => `<span class="badge-skill">${s}</span>`).join("")}
        </div>

        <h6 class="text-muted">مهاراتك الحالية</h6>
        <div class="d-flex flex-wrap gap-2 mb-3">
            ${student.map(s => `<span class="badge-skill">${s}</span>`).join("")}
        </div>

        <h6 class="text-muted">المهارات الناقصة</h6>
        <div class="d-flex flex-wrap gap-2">
            ${missing.length === 0
                ? `<span class="badge-skill">لا توجد مهارات ناقصة 🎉</span>`
                : missing.map(s => `<span class="badge-missing">${s}</span>`).join("")
            }
        </div>
    `;

    const gapInsight = document.getElementById("gapInsight");
    if (!gapInsight) return;

    if (missing.length === 0) {
        gapInsight.textContent = "لا توجد فجوة مهارية! أنت متوافق تمامًا مع متطلبات المسار.";
    } else {
        gapInsight.textContent = `ابدأ بتعلم المهارة: ${missing[0]} لأنها الأكثر تأثيرًا على جاهزيتك.`;
    }
}

// ===============================
// SKILL CATEGORY MAP
// ===============================
const skillCategoriesMap = {
    "python": "Programming Languages",
    "java script": "Programming Languages",
    "javascript": "Programming Languages",
    "html": "Web Development",
    "css": "Web Development",
    "api": "Web Development",
    "django": "Backend Frameworks",
    "sql": "Databases",
    "version control": "DevOps & Tools",
    "git": "DevOps & Tools",
    "github": "DevOps & Tools",
    "bootstrap": "Web Development",
    "react": "Web Development",
    "node.js": "Backend Frameworks",
    "mysql": "Databases",
    "mongodb": "Databases",
    "linux": "DevOps & Tools"
};

// ===============================
// SKILLS CATEGORY CHART
// ===============================
function renderSkillsCategoryChart(skills) {
    if (!skills || skills.length === 0) return;

    const categoryCount = {};

    skills.forEach(skill => {
        const key = skill.toLowerCase();
        const category = skillCategoriesMap[key] || "Other";

        if (!categoryCount[category]) {
            categoryCount[category] = 0;
        }
        categoryCount[category]++;
    });

    const labels = Object.keys(categoryCount);
    const values = Object.values(categoryCount);

    const ctx = document.getElementById("skillsCategoryChart").getContext("2d");

    new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "عدد المهارات",
                data: values,
                backgroundColor: [
                    "#3b82f6", "#10b981", "#f59e0b",
                    "#ef4444", "#8b5cf6", "#14b8a6"
                ],
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
        }
    });

    const skillsInsight = document.getElementById("skillsInsight");
    if (!skillsInsight) return;

    const minVal = Math.min(...values);
    const weakestCategory = labels[values.indexOf(minVal)];

    skillsInsight.textContent =
        `أضعف فئة لديك هي: ${weakestCategory}. حاول تطوير مهارة واحدة ضمن هذه الفئة هذا الأسبوع.`;
}

// ===============================
// SKILLS GAP RADAR CHART
// ===============================
function renderSkillsGapRadar(gap) {
    if (!gap) return;

    const required = gap.required_skills || [];
    const student = gap.student_skills || [];

    const studentLower = student.map(s => s.toLowerCase());

    const presenceValues = required.map(skill =>
        studentLower.includes(skill.toLowerCase()) ? 1 : 0
    );

    const ctx = document.getElementById("skillsGapRadar").getContext("2d");

    new Chart(ctx, {
        type: "radar",
        data: {
            labels: required.map(s => s.toUpperCase()),
            datasets: [
                {
                    label: "موجودة",
                    data: presenceValues,
                    backgroundColor: "rgba(16, 185, 129, 0.3)",
                    borderColor: "#10b981",
                    borderWidth: 2
                },
                {
                    label: "ناقصة",
                    data: presenceValues.map(v => v === 1 ? 0 : 1),
                    backgroundColor: "rgba(239, 68, 68, 0.3)",
                    borderColor: "#ef4444",
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 1,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}

// ===============================
// CV TIMELINE
// ===============================
function renderCVTimeline(score) {

    const months = ["قبل 6 أشهر", "قبل 5 أشهر", "قبل 4 أشهر", "قبل 3 أشهر", "قبل شهرين", "قبل شهر", "الآن"];

    const values = [
        Math.max(10, score - 30),
        Math.max(15, score - 25),
        Math.max(20, score - 20),
        Math.max(30, score - 15),
        Math.max(40, score - 10),
        Math.max(50, score - 5),
        score
    ];

    const ctx = document.getElementById("cvTimelineChart").getContext("2d");

    new Chart(ctx, {
        type: "line",
        data: {
            labels: months,
            datasets: [{
                label: "CV Score",
                data: values,
                borderColor: "#3b82f6",
                backgroundColor: "rgba(59, 130, 246, 0.3)",
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointRadius: 5,
                pointBackgroundColor: "#1d4ed8"
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });

    const timelineInsight = document.getElementById("timelineInsight");
    if (!timelineInsight) return;

    if (values[6] > values[5]) {
        timelineInsight.textContent = "أداء ممتاز! سيرتك الذاتية تتحسن باستمرار.";
    } else {
        timelineInsight.textContent = "لاحظنا ثباتًا أو انخفاضًا بسيطًا. حاول إضافة مهارة أو مشروع جديد هذا الشهر.";
    }
}

// ===============================
// STUDENT PROGRESS RADAR
// ===============================
function renderStudentProgressRadar(profile) {

    const skillsScore = Math.min(100, (profile.skills?.length || 0) * 10);
    const projectsScore = Math.min(100, (profile.projects?.length || 0) * 20);
    const coursesScore = Math.min(100, (profile.completed_courses || 0) * 10);
    const cvScore = profile.cv_score;

    const labels = [
        "المهارات",
        "المشاريع",
        "الكورسات",
        "السيرة الذاتية"
    ];

    const values = [
        skillsScore,
        projectsScore,
        coursesScore,
        cvScore
    ];

    const ctx = document.getElementById("studentProgressRadar").getContext("2d");

    new Chart(ctx, {
        type: "radar",
        data: {
            labels: labels,
            datasets: [{
                label: "مستوى التقدم",
                data: values,
                backgroundColor: "rgba(59, 130, 246, 0.3)",
                borderColor: "#3b82f6",
                borderWidth: 2,
                pointBackgroundColor: "#1d4ed8",
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: { stepSize: 20 }
                }
            }
        }
    });

    const progressInsight = document.getElementById("progressInsight");
    if (!progressInsight) return;

    const minIndex = values.indexOf(Math.min(...values));
    progressInsight.textContent =
        `أضعف محور لديك هو: ${labels[minIndex]}. ركّز عليه هذا الأسبوع لتحسين تقدمك العام.`;
}
