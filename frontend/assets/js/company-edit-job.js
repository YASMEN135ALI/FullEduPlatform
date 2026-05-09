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

    // عناصر النموذج
    const titleEl = document.getElementById("jobTitle");
    const descEl = document.getElementById("jobDescription");
    const typeEl = document.getElementById("jobType");
    const salaryEl = document.getElementById("jobSalary");
    const skillsEl = document.getElementById("jobSkills");
    const locationEl = document.getElementById("jobLocation");
    const requirementsEl = document.getElementById("jobRequirements");
    const statusEl = document.getElementById("jobStatus");

    // 1) جلب بيانات الوظيفة
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/accounts/company/job/${jobId}/`, {
            method: "GET",
            headers: {
                "Authorization": "Token " + token
            }
        });

        const job = await response.json();

        // تعبئة النموذج
        titleEl.value = job.title;
        descEl.value = job.description;
        typeEl.value = job.job_type;
        salaryEl.value = job.salary || "";
        skillsEl.value = job.skills || "";
        locationEl.value = job.location || "";
        requirementsEl.value = job.requirements || "";

        // ⭐ تحديد حالة الوظيفة
        if (job.is_archived) {
            statusEl.value = "archived";
        } else if (!job.is_active) {
            statusEl.value = "closed";
        } else {
            statusEl.value = "active";
        }

    } catch (error) {
        console.error(error);
        alert("حدث خطأ أثناء تحميل بيانات الوظيفة");
    }

    // 2) إرسال التعديلات
    document.getElementById("editJobForm").addEventListener("submit", async function (e) {
        e.preventDefault();

        // ⭐ تحويل الحالة إلى is_active + is_archived
        let is_active = true;
        let is_archived = false;

        if (statusEl.value === "closed") {
            is_active = false;
        } else if (statusEl.value === "archived") {
            is_active = false;
            is_archived = true;
        }

        const updatedData = {
            title: titleEl.value,
            description: descEl.value,
            job_type: typeEl.value,
            salary: salaryEl.value,
            skills: skillsEl.value,
            location: locationEl.value,
            requirements: requirementsEl.value,

            // ⭐ تحديث الحالة
            is_active: is_active,
            is_archived: is_archived
        };

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/accounts/company/job/${jobId}/`, {
                method: "PUT",
                headers: {
                    "Authorization": "Token " + token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updatedData)
            });

            if (response.ok) {
                alert("تم تعديل الوظيفة بنجاح");
                window.location.href = "company_jobs.html";
            } else {
                alert("حدث خطأ أثناء التعديل");
            }

        } catch (error) {
            console.error(error);
            alert("تعذر الاتصال بالخادم");
        }
    });

});
