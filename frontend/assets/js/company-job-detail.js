document.addEventListener("DOMContentLoaded", async function () {

    const token = localStorage.getItem("token");
    const userType = localStorage.getItem("user_type");

    if (!token || userType !== "company") {
        window.location.href = "login.html";
        return;
    }

    // الحصول على job_id من الرابط
    const urlParams = new URLSearchParams(window.location.search);
    const jobId = urlParams.get("job_id");

    // عناصر الصفحة
    const titleEl = document.getElementById("jobTitle");
    const descEl = document.getElementById("jobDescription");
    const typeEl = document.getElementById("jobType");
    const salaryEl = document.getElementById("jobSalary");
    const skillsEl = document.getElementById("jobSkills");
    const locationEl = document.getElementById("jobLocation");
    const dateEl = document.getElementById("jobDate");

    const editBtn = document.getElementById("editBtn");
    const deleteBtn = document.getElementById("deleteBtn");
    const applicantsBtn = document.getElementById("applicantsBtn");

    // 1) جلب بيانات الوظيفة
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/accounts/company/job/${jobId}/`, {
            method: "GET",
            headers: {
                "Authorization": "Token " + token
            }
        });

        const job = await response.json();

        // تعبئة الصفحة
        titleEl.textContent = job.title;
        descEl.textContent = job.description;
        typeEl.textContent = job.job_type;
        salaryEl.textContent = job.salary || "غير محدد";
        skillsEl.textContent = job.skills || "غير محدد";
        locationEl.textContent = job.location || "غير محدد";
        dateEl.textContent = job.created_at.substring(0, 10);

        // روابط الأزرار
        editBtn.href = `company_edit_job.html?job_id=${jobId}`;
        applicantsBtn.href = `company_applicants.html?job_id=${jobId}`;

    } catch (error) {
        console.error(error);
        alert("حدث خطأ أثناء تحميل بيانات الوظيفة");
    }

    // 2) حذف الوظيفة
    deleteBtn.addEventListener("click", async function () {

        const confirmDelete = confirm("هل أنت متأكد من حذف هذه الوظيفة؟");

        if (!confirmDelete) return;

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/accounts/company/job/${jobId}/delete/`, {
                method: "DELETE",
                headers: {
                    "Authorization": "Token " + token
                }
            });

            if (response.ok) {
                alert("تم حذف الوظيفة بنجاح");
                window.location.href = "company_jobs.html";
            } else {
                alert("حدث خطأ أثناء الحذف");
            }

        } catch (error) {
            console.error(error);
            alert("تعذر الاتصال بالخادم");
        }

    });

});
