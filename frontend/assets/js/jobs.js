const JOBS_API = "http://127.0.0.1:8000/api/accounts/jobs/";

document.addEventListener("DOMContentLoaded", () => {
    loadJobs();
});

// تحميل الوظائف
async function loadJobs() {
    try {
        const token = localStorage.getItem("token");

        const response = await fetch(JOBS_API, {
            method: "GET",
            headers: {
                "Authorization": `Token ${token}`
            }
        });

        const jobs = await response.json();
        displayJobs(jobs);

    } catch (error) {
        console.error("Error loading jobs:", error);
    }
}

// عرض الوظائف
function displayJobs(jobs) {
    const container = document.getElementById("jobsContainer");
    container.innerHTML = "";

    jobs.forEach(job => {
        container.innerHTML += `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card shadow-sm p-3 job-card">
                    <h5>${job.title}</h5>
                    <p class="text-muted"><strong>الشركة:</strong> ${job.company_name}</p>
                    <p>${job.description.substring(0, 120)}...</p>

                    <button class="btn btn-primary w-100 mt-2"
                        onclick="openJobDetails(${job.id})">
                        عرض التفاصيل
                    </button>
                </div>
            </div>
        `;
    });
}

// فتح صفحة التفاصيل
function openJobDetails(jobId) {
    window.location.href = `job-detail.html?id=${jobId}`;
}
