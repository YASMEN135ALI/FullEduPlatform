// استخراج ID الوظيفة من الرابط
const urlParams = new URLSearchParams(window.location.search);
const jobId = urlParams.get("id");

const JOB_API = `http://127.0.0.1:8000/api/accounts/jobs/${jobId}/`;
const CHECK_APPLY_API = `http://127.0.0.1:8000/api/accounts/jobs/${jobId}/is_applied/`;

document.addEventListener("DOMContentLoaded", () => {
    loadJobDetails();
});

// جلب تفاصيل الوظيفة
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
                `<p class="text-danger text-center">حدث خطأ أثناء تحميل الوظيفة</p>`;
            return;
        }

        const job = await response.json();

        // تعبئة البيانات في الصفحة
        document.getElementById("jobTitle").textContent = job.title;
        document.getElementById("jobCompany").textContent = job.company_name;
        document.getElementById("jobType").textContent = job.job_type;
        document.getElementById("jobDescription").textContent = job.description;

        // المتطلبات (نفصلها حسب السطر)
        const reqList = document.getElementById("jobRequirements");
reqList.innerHTML = "";

// 1) إذا الـ API يرجّع requirements كسطر نصي
if (typeof job.requirements === "string") {
    job.requirements.split("\n").forEach(req => {
        reqList.innerHTML += `<li class="list-group-item">${req.trim()}</li>`;
    });
}

// 2) إذا الـ API يرجّع requirements كـ Array
else if (Array.isArray(job.requirements)) {
    job.requirements.forEach(req => {
        reqList.innerHTML += `<li class="list-group-item">${req}</li>`;
    });
}

// 3) إذا اسم الحقل مختلف (مثلاً required_skills)
else if (typeof job.required_skills === "string") {
    job.required_skills.split("\n").forEach(req => {
        reqList.innerHTML += `<li class="list-group-item">${req.trim()}</li>`;
    });
}

// 4) إذا ما في متطلبات نهائيًا
else {
    reqList.innerHTML = `<li class="list-group-item text-muted">لا توجد متطلبات محددة</li>`;
}

        // فحص إذا الطالب قدّم مسبقًا
        checkIfApplied();

    } catch (error) {
        console.error("Error loading job details:", error);
    }
}


// ===============================
// فحص إذا الطالب قدّم على الوظيفة
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

    if (data.applied === true) {
        // إخفاء زر التقديم
        applyBtn.style.display = "none";

        // إنشاء زر عرض الطلب
        const viewBtn = document.createElement("button");
        viewBtn.className = "btn btn-primary w-100 mt-3";
        viewBtn.textContent = "عرض الطلب";

        // عند الضغط → نذهب لصفحة الطلبات
        viewBtn.onclick = () => {
            window.location.href = `applications.html?app_id=${data.application_id}`;
        };

        // إضافته مكان زر التقديم
        applyBtn.parentNode.appendChild(viewBtn);

    } else {
        // إذا لم يقدّم → زر التقديم يعمل طبيعي
        applyBtn.onclick = () => {
            window.location.href = `job-apply.html?id=${jobId}`;
        };
    }
}
