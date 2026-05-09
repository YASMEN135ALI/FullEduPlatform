// استخراج ID الوظيفة من الرابط
const urlParams = new URLSearchParams(window.location.search);
const jobId = urlParams.get("id");

// نفترض أن عندك API يعيد تفاصيل وظيفة واحدة من JobPost
// مثلاً: /api/accounts/jobs/<id>/
const JOB_API = `http://127.0.0.1:8000/api/accounts/jobs/${jobId}/`;
const CHECK_APPLY_API = `http://127.0.0.1:8000/api/accounts/jobs/${jobId}/is_applied/`;

document.addEventListener("DOMContentLoaded", () => {
    loadJobDetails();
});

// ===============================
// جلب تفاصيل الوظيفة من JobPost فقط
// ===============================
async function loadJobDetails() {
    try {
        const token = localStorage.getItem("token");

        const response = await fetch(JOB_API, {
            method: "GET",
            headers: {
                "Authorization": `Token ${token}`
            }
        });

        if (!response.ok) {
            document.querySelector(".container").innerHTML =
                `<p class="text-danger text-center">حدث خطأ أثناء تحميل تفاصيل الوظيفة</p>`;
            return;
        }

        const job = await response.json();

        // تعبئة البيانات الأساسية من JobPost
        document.getElementById("jobTitle").textContent = job.title;
        document.getElementById("jobCompany").textContent = job.company_name || job.company || "";
        document.getElementById("jobType").textContent = job.job_type_display || job.job_type || "";
        document.getElementById("jobDescription").textContent = job.description;

        // المتطلبات (من حقل requirements في JobPost)
        const reqList = document.getElementById("jobRequirements");
        reqList.innerHTML = "";

        if (job.requirements) {
            // نفصلها حسب السطر
            job.requirements.split("\n").forEach(req => {
                if (req.trim() !== "") {
                    reqList.innerHTML += `<li class="list-group-item">${req.trim()}</li>`;
                }
            });
        } else {
            reqList.innerHTML = `<li class="list-group-item text-muted">لا توجد متطلبات محددة</li>`;
        }

        // عرض تفاصيل إضافية من JobPost (الموقع، الراتب، المهارات)
        renderExtraDetailsFromJobPost(job);

        // فحص إذا الطالب قدّم مسبقًا
        checkIfApplied();

    } catch (error) {
        console.error("Error loading job details:", error);
    }
}

// ===============================
// عرض تفاصيل إضافية من JobPost فقط
// ===============================
function renderExtraDetailsFromJobPost(job) {
    const box = document.getElementById("extraDetails");

    // skills من JobPost (نص مفصول بفواصل)
    let skillsText = "غير محدد";
    if (job.skills) {
        skillsText = job.skills;
    }

    box.innerHTML = `
        <div class="card shadow-sm mb-4">
            <div class="card-body">

                <h4 class="fw-bold mb-3">تفاصيل الوظيفة</h4>

                <p><strong>📍 الموقع:</strong> ${job.location || "غير محدد"}</p>

                <p><strong>💰 الراتب:</strong> ${job.salary || "غير محدد"}</p>

                <p><strong>🔧 المهارات المطلوبة:</strong> ${skillsText}</p>

            </div>
        </div>
    `;
}

// ===============================
// فحص إذا الطالب قدّم على الوظيفة
// (هذا الجزء خاص بالطالب لكن لا يغيّر تفاصيل الوظيفة)
// ===============================
async function checkIfApplied() {
    const token = localStorage.getItem("token");

    const res = await fetch(CHECK_APPLY_API, {
        headers: {
            "Authorization": `Token ${token}`
        }
    });

    const data = await res.json();

    const applyBtn = document.getElementById("applyBtn");
    const viewBtn = document.getElementById("viewApplicationBtn");

    if (data.applied === true) {
        applyBtn.style.display = "none";
        viewBtn.style.display = "block";

        viewBtn.onclick = () => {
            window.location.href = `applications.html?app_id=${data.application_id}`;
        };

    } else {
        applyBtn.onclick = () => {
            window.location.href = `job-apply.html?id=${jobId}`;
        };
    }
}
