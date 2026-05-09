document.addEventListener("DOMContentLoaded", function () {
    loadRecommended();
});

async function loadRecommended() {

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
        // جلب بيانات الذكاء
        const profileRes = await fetch(
            "http://127.0.0.1:8000/api/accounts/student/profile-data/",
            { headers: { "Authorization": "Token " + token } }
        );

        const profile = await profileRes.json();

        // جلب الوظائف
        const jobsRes = await fetch(
            "http://127.0.0.1:8000/api/accounts/student/job-matching/",
            { headers: { "Authorization": "Token " + token } }
        );

        const jobs = await jobsRes.json();

        // عرض البيانات
        renderRecommendedCourses(profile.course_recommendations);
        renderCareerPath(profile.career_path_recommendation);
        renderMissingSkills(profile.skills_gap);
        renderJobMatching(jobs);

    } catch (err) {
        console.error("Recommended Page Error:", err);
    }
}

//
// ===============================
//  Recommended Courses
// ===============================
function renderRecommendedCourses(courses) {
    const box = document.getElementById("recommendedCourses");

    if (!courses || courses.length === 0) {
        box.innerHTML = `<li class="text-muted">لا توجد كورسات مقترحة حالياً.</li>`;
        return;
    }

    box.innerHTML = courses.map(c => `
        <li>
            <a href="student-course-detail.html?id=${c.id}" class="text-primary fw-bold">
                ${c.title}
            </a>
        </li>
    `).join("");
}


//
// ===============================
//  Career Path
// ===============================
function renderCareerPath(cp) {
    const box = document.getElementById("careerPathBox");

    if (!cp) {
        box.innerHTML = `<p class="text-muted">لم يتم تحديد مسار وظيفي بعد.</p>`;
        return;
    }

    box.innerHTML = `
        <h5>${cp.career_path}</h5>
        <p class="text-muted">${cp.description}</p>

        <h6 class="mt-3">مشاريع مقترحة:</h6>
        <ul>${cp.recommended_projects.map(p => `<li>${p}</li>`).join("")}</ul>

        <h6>كورسات أساسية:</h6>
        <ul>${cp.recommended_courses.map(c => `<li>${c}</li>`).join("")}</ul>
    `;
}

//
// ===============================
//  Missing Skills
// ===============================
function renderMissingSkills(gap) {
    const box = document.getElementById("missingSkillsBox");

    if (!gap || gap.missing_skills.length === 0) {
        box.innerHTML = `<span class="badge-skill">لا توجد مهارات ناقصة 🎉</span>`;
        return;
    }

    box.innerHTML = gap.missing_skills
        .map(s => `<span class="badge-missing">${s}</span>`)
        .join(" ");
}

//
// ===============================
//  Job Matching
// ===============================
function renderJobMatching(jobs) {
    const box = document.getElementById("jobMatchingBox");

    if (!jobs || jobs.length === 0) {
        box.innerHTML = `<p class="text-muted">لا توجد وظائف مناسبة حالياً.</p>`;
        return;
    }

    box.innerHTML = jobs.map(job => `
        <div class="job-box">

            <h4 class="fw-bold">${job.title}</h4>
            <p class="text-muted">${job.company}</p>

            <p><strong>📍 الموقع:</strong> ${job.location}</p>
            <p><strong>💼 نوع الدوام:</strong> ${job.job_type}</p>
            <p><strong>💰 الراتب:</strong> ${job.salary || "غير محدد"}</p>

            <p><strong>📝 الوصف:</strong><br>${job.description}</p>

            ${job.requirements ? `
                <p><strong>📌 المتطلبات:</strong><br>${job.requirements}</p>
            ` : ""}

            <p><strong>🔧 المهارات المطلوبة:</strong> ${job.required_skills.join("، ")}</p>

            <p><strong>❗ المهارات الناقصة لديك:</strong> 
                ${job.missing_skills.length === 0 ? "لا يوجد" : job.missing_skills.join("، ")}
            </p>

            <p><strong>🔥 نسبة التطابق:</strong> ${job.match_score}%</p>

            <button class="btn btn-primary btn-sm mt-2" onclick="goToApply(${job.job_id})">
                قدّم الآن
            </button>

        </div>
    `).join("");
}

function goToApply(id) {
    window.location.href = `job-apply.html?id=${id}`;
}
