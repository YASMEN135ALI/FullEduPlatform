document.addEventListener("DOMContentLoaded", async function () {

    // 1) التحقق من أن المستخدم شركة
    const token = localStorage.getItem("token");
    const userType = localStorage.getItem("user_type");

    if (!token || userType !== "company") {
        window.location.href = "login.html";
        return;
    }

    // 2) عناصر الصفحة
    const companyNameEl = document.getElementById("companyName");
    const companyIndustryEl = document.getElementById("companyIndustry");

    const jobsCountEl = document.getElementById("jobsCount");
    const applicantsCountEl = document.getElementById("applicantsCount");
    const acceptedCountEl = document.getElementById("acceptedCount");

    const jobsListEl = document.getElementById("jobsList");

    try {
        // 3) جلب بيانات الشركة + الوظائف من API
        const response = await fetch("http://127.0.0.1:8000/api/accounts/company/dashboard/", {
            method: "GET",
            headers: {
                "Authorization": "Token " + token
            }
        });

        const data = await response.json();
        console.log("Dashboard Data:", data);

        // 4) عرض بيانات الشركة
        const company = data.company;

        companyNameEl.textContent = company.company_name;
        companyIndustryEl.textContent = company.industry || "غير محدد";

        // 5) عرض الوظائف
        const jobs = data.jobs;

        jobsCountEl.textContent = jobs.length;

        let totalApplicants = 0;
        let totalAccepted = 0;

        jobsListEl.innerHTML = "";

        if (jobs.length === 0) {
            jobsListEl.innerHTML = `
                <p class="text-muted text-center">لا توجد وظائف منشورة حتى الآن.</p>
            `;
        }

        jobs.forEach(job => {

            // حساب المتقدمين والمقبولين (إذا أضفتهم لاحقًا في الـ API)
            totalApplicants += job.applicants_count || 0;
            totalAccepted += job.accepted_count || 0;

            // عرض الوظيفة
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

        applicantsCountEl.textContent = totalApplicants;
        acceptedCountEl.textContent = totalAccepted;

    } catch (error) {
        console.error("Error loading dashboard:", error);
        alert("حدث خطأ أثناء تحميل لوحة التحكم.");
    }

});
