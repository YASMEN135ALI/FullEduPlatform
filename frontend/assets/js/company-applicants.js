document.addEventListener("DOMContentLoaded", async function () {

    const token = localStorage.getItem("token");
    const userType = localStorage.getItem("user_type");

    if (!token || userType !== "company") {
        window.location.href = "login.html";
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const jobId = urlParams.get("job_id");

    const tableBody = document.getElementById("applicantsTable");
    const noApplicantsMsg = document.getElementById("noApplicantsMsg");

    // جلب المتقدمين
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/accounts/company/job/${jobId}/applicants/`, {
            method: "GET",
            headers: {
                "Authorization": "Token " + token
            }
        });

        const applicants = await response.json();

        if (applicants.length === 0) {
            noApplicantsMsg.classList.remove("d-none");
            return;
        }

        tableBody.innerHTML = "";

        applicants.forEach(app => {
            tableBody.innerHTML += `
                <tr>
                    <td>${app.student_name}</td>
                    <td>${app.student_email}</td>
                    <td>
                        ${app.cv_url 
                            ? `<a href="${app.cv_url}" target="_blank" class="btn btn-sm btn-outline-primary">عرض CV</a>` 
                            : "لا يوجد"}
                    </td>
                    <td>
                        <span class="badge ${
                            app.status === "accepted" ? "bg-success" :
                            app.status === "rejected" ? "bg-danger" :
                            "bg-secondary"
                        }">
                            ${
                                app.status === "accepted" ? "مقبول" :
                                app.status === "rejected" ? "مرفوض" :
                                "قيد المراجعة"
                            }
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-success btn-sm" onclick="updateStatus(${app.id}, 'accepted')">قبول</button>
                        <button class="btn btn-danger btn-sm" onclick="updateStatus(${app.id}, 'rejected')">رفض</button>
                    </td>
                </tr>
            `;
        });

    } catch (error) {
        console.error(error);
        alert("حدث خطأ أثناء تحميل المتقدمين");
    }

});

// تغيير حالة المتقدم
async function updateStatus(applicantId, newStatus) {
    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`http://127.0.0.1:8000/api/accounts/company/applicant/${applicantId}/status/`, {
            method: "PUT",
            headers: {
                "Authorization": "Token " + token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            alert("تم تحديث حالة المتقدم");
            location.reload();
        } else {
            alert("حدث خطأ أثناء تحديث الحالة");
        }

    } catch (error) {
        console.error(error);
        alert("تعذر الاتصال بالخادم");
    }
}
