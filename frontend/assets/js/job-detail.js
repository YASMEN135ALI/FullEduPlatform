// استخراج ID الوظيفة من الرابط
const urlParams = new URLSearchParams(window.location.search);
const jobId = urlParams.get("id");

const JOB_API = `http://127.0.0.1:8000/api/accounts/jobs/${jobId}/`;

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

        if (job.requirements) {
            job.requirements.split("\n").forEach(req => {
                reqList.innerHTML += `<li class="list-group-item">${req}</li>`;
            });
        }

        // زر التقديم
        document.getElementById("applyBtn").onclick = () => {
            window.location.href = `job-apply.html?id=${jobId}`;
        };

    } catch (error) {
        console.error("Error loading job details:", error);
    }
}
