document.addEventListener("DOMContentLoaded", async function () {

    const token = localStorage.getItem("token");
    const userType = localStorage.getItem("user_type");

    if (!token || userType !== "company") {
        window.location.href = "login.html";
        return;
    }

    const jobsListEl = document.getElementById("jobsList");
    const noJobsMsg = document.getElementById("noJobsMsg");

    try {
        const response = await fetch("http://127.0.0.1:8000/api/accounts/company/jobs/", {
            method: "GET",
            headers: {
                "Authorization": "Token " + token
            }
        });

        const jobs = await response.json();

        if (jobs.length === 0) {
            noJobsMsg.classList.remove("d-none");
            return;
        }

        jobsListEl.innerHTML = "";

        jobs.forEach(job => {
            jobsListEl.innerHTML += `
                <div class="col-md-6">
                    <div class="card shadow-sm p-3">

                        <h5>${job.title}</h5>
                        <p class="text-muted">نوع الوظيفة: ${job.job_type}</p>
                        <p class="text-muted">تاريخ النشر: ${job.created_at.substring(0, 10)}</p>

                        <div class="d-flex gap-2 mt-3">

                            <a href="company_job_detail.html?job_id=${job.id}" 
                               class="btn btn-secondary w-100">
                               عرض
                            </a>

                            <a href="company_applicants.html?job_id=${job.id}" 
                               class="btn btn-primary w-100">
                               المتقدمين
                            </a>

                            <a href="company_edit_job.html?job_id=${job.id}" 
                               class="btn btn-warning w-100">
                               تعديل
                            </a>

                            <button class="btn btn-danger w-100" onclick="deleteJob(${job.id})">
                                حذف
                            </button>

                        </div>

                    </div>
                </div>
            `;
        });

    } catch (error) {
        console.error(error);
        alert("حدث خطأ أثناء تحميل الوظائف");
    }

});

// حذف وظيفة
async function deleteJob(jobId) {
    const confirmDelete = confirm("هل أنت متأكد من حذف هذه الوظيفة؟");

    if (!confirmDelete) return;

    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`http://127.0.0.1:8000/api/accounts/company/jobs/${jobId}/delete/`, {
            method: "DELETE",
            headers: {
                "Authorization": "Token " + token
            }
        });

        if (response.ok) {
            alert("تم حذف الوظيفة بنجاح");
            location.reload();
        } else {
            alert("حدث خطأ أثناء الحذف");
        }

    } catch (error) {
        console.error(error);
        alert("تعذر الاتصال بالخادم");
    }
}
