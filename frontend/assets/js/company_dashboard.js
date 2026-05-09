document.addEventListener("DOMContentLoaded", async function () {

    // 1) التحقق من أن المستخدم شركة
    const token = localStorage.getItem("token");
    const userType = localStorage.getItem("user_type");

    if (!token || userType !== "company") {
        window.location.href = "login.html";
        return;
    }

    // عناصر الصفحة
    const companyNameEl = document.getElementById("companyName");
    const companyIndustryEl = document.getElementById("companyIndustry");

    const jobsCountEl = document.getElementById("jobsCount");
    const applicantsCountEl = document.getElementById("applicantsCount");
    const acceptedCountEl = document.getElementById("acceptedCount");

    const jobsListEl = document.getElementById("jobsList");

    // ⭐ دالة عرض الوظائف
    function renderJobs(jobs) {
        jobsListEl.innerHTML = "";

        if (jobs.length === 0) {
            jobsListEl.innerHTML = `
                <p class="text-muted text-center">لا توجد وظائف.</p>
            `;
            return;
        }

        jobs.forEach(job => {
            jobsListEl.innerHTML += `
                <div class="job-card">
                    <h5>${job.title}</h5>
                    <p class="text-muted">نوع الوظيفة: ${job.job_type}</p>
                    <p class="text-muted">الراتب: ${job.salary || "غير محدد"}</p>
                    <p class="text-muted">تاريخ النشر: ${job.created_at.substring(0, 10)}</p>

                    <a href="company_applicants.html?job_id=${job.id}" class="btn btn-primary mt-2">
                        عرض المتقدمين
                    </a>
                </div>
            `;
        });
    }

    // ⭐ دالة جلب الوظائف حسب الحالة
    async function loadJobs(status = "all") {
        let url = "http://127.0.0.1:8000/api/accounts/company/jobs/";

        if (status !== "all") {
            url += `?status=${status}`;
        }

        const response = await fetch(url, {
            headers: {
                "Authorization": "Token " + token
            }
        });

        const jobs = await response.json();
        renderJobs(jobs);
    }

    // ⭐ تشغيل الفلترة عند الضغط على الأزرار
    document.querySelectorAll(".filter-buttons button").forEach(btn => {
        btn.addEventListener("click", function () {
            const status = this.getAttribute("data-status");
            loadJobs(status);
        });
    });

    try {
        // ⭐ جلب بيانات الشركة + الإحصائيات
        const response = await fetch("http://127.0.0.1:8000/api/accounts/company/dashboard/", {
            method: "GET",
            headers: {
                "Authorization": "Token " + token
            }
        });

        const data = await response.json();
        console.log("Dashboard Data:", data);

        // عرض بيانات الشركة
        const company = data.company;

        companyNameEl.textContent = company.company_name;
        companyIndustryEl.textContent = company.industry || "غير محدد";

        // عرض الإحصائيات
        const jobs = data.jobs;

        jobsCountEl.textContent = jobs.length;

        let totalApplicants = 0;
        let totalAccepted = 0;

        jobs.forEach(job => {
            totalApplicants += job.applicants_count || 0;
            totalAccepted += job.accepted_count || 0;
        });

        applicantsCountEl.textContent = totalApplicants;
        acceptedCountEl.textContent = totalAccepted;

        // ⭐ تحميل كل الوظائف عند فتح الصفحة
        loadJobs("all");

    } catch (error) {
        console.error("Error loading dashboard:", error);
        alert("حدث خطأ أثناء تحميل لوحة التحكم.");
    }

});
