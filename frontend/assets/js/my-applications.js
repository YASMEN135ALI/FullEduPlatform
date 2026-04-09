const APPLICATIONS_API =  "http://127.0.0.1:8000/api/accounts/student/my-applications";

document.addEventListener("DOMContentLoaded", () => {
    loadApplications();
});

async function loadApplications() {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("يجب تسجيل الدخول لعرض طلباتك");
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch(APPLICATIONS_API, {
            method: "GET",
            headers: {
                "Authorization": `Token ${token}`
            }
        });

        const applications = await response.json();
        displayApplications(applications);

    } catch (error) {
        console.error("Error loading applications:", error);
    }
}

function displayApplications(applications) {
    const container = document.getElementById("applicationsContainer");
    const emptyMessage = document.getElementById("emptyMessage");

    container.innerHTML = "";

    if (applications.length === 0) {
        emptyMessage.classList.remove("d-none");
        return;
    }

    emptyMessage.classList.add("d-none");

    applications.forEach(app => {
        const statusBadge = getStatusBadge(app.status);

        container.innerHTML += `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card shadow-sm p-3">

                    <h5 class="fw-bold">${app.job_title}</h5>
                    <p class="text-muted"><strong>الشركة:</strong> ${app.company_name}</p>

                    <p><strong>الحالة:</strong> ${statusBadge}</p>
                    <p><strong>تاريخ التقديم:</strong> ${new Date(app.created_at).toLocaleDateString()}</p>

                    <button class="btn btn-primary w-100 mt-2"
                        onclick="openJob(${app.job_id})">
                        عرض الوظيفة
                    </button>

                </div>
            </div>
        `;
    });
}

function getStatusBadge(status) {
    switch (status) {
        case "pending":
            return `<span class="badge bg-warning text-dark">قيد المراجعة</span>`;
        case "accepted":
            return `<span class="badge bg-success">تم القبول</span>`;
        case "rejected":
            return `<span class="badge bg-danger">تم الرفض</span>`;
        default:
            return `<span class="badge bg-secondary">غير معروف</span>`;
    }
}

function openJob(jobId) {
    window.location.href = `job-detail.html?id=${jobId}`;
}
