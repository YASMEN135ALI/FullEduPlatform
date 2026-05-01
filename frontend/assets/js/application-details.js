document.addEventListener("DOMContentLoaded", loadDetails);

function loadDetails() {
    const params = new URLSearchParams(window.location.search);
    const appId = params.get("app_id");

    const token = localStorage.getItem("token");

    if (!appId) {
        document.getElementById("detailsContainer").innerHTML =
            `<div class="text-danger">رقم الطلب غير موجود.</div>`;
        return;
    }

    fetch(`http://127.0.0.1:8000/api/accounts/student/application/${appId}/`, {
        method: "GET",
        headers: {
            "Authorization": "Token " + token
        }
    })
    .then(res => res.json())
    .then(data => {
        renderDetails(data);
    })
    .catch(() => {
        document.getElementById("detailsContainer").innerHTML =
            `<div class="text-danger">فشل تحميل التفاصيل.</div>`;
    });
}

function renderDetails(app) {
    let html = `
        <h3 class="mb-1">${app.job_title}</h3>
        <p class="text-muted mb-3">${app.company_name}</p>

        <span class="badge-status badge-${app.status}">
            ${translateStatus(app.status)}
        </span>

        <hr>

        <p><strong>تاريخ التقديم:</strong> ${new Date(app.applied_at).toLocaleDateString()}</p>
    `;

    // CV
    if (app.cv) {
        html += `
            <h5 class="mt-4">السيرة الذاتية</h5>
            <a href="${app.cv}" target="_blank" class="btn btn-outline-primary">
                عرض السيرة الذاتية
            </a>
        `;
    }

    // Cover Letter
    if (app.cover_letter) {
        html += `
            <h5 class="mt-4">الرسالة المرفقة</h5>
            <div class="p-3 bg-light rounded border">
                ${app.cover_letter}
            </div>
        `;
    }

    // ================================
    //      أزرار التحكم بالطلب
    // ================================
    html += `<div class="mt-4">`;

    // زر إلغاء الطلب
    if (app.status === "pending") {
        html += `
            <button class="btn btn-danger me-2" onclick="cancelApplication(${app.id})">
                إلغاء الطلب
            </button>
        `;
    }

    // زر إعادة التقديم
    if (app.status === "rejected") {
        html += `
            <button class="btn btn-primary" onclick="reapply(${app.id})">
                إعادة التقديم
            </button>
        `;
    }

    html += `</div>`;

    document.getElementById("detailsContainer").innerHTML = html;
}

function translateStatus(status) {
    switch (status) {
        case "pending": return "قيد المراجعة";
        case "accepted": return "مقبولة";
        case "rejected": return "مرفوضة";
        default: return status;
    }
}

// ===============================
//      إلغاء الطلب
// ===============================
function cancelApplication(id) {
    if (!confirm("هل أنت متأكد من إلغاء الطلب؟")) return;

    const token = localStorage.getItem("token");

    fetch(`http://127.0.0.1:8000/api/accounts/student/application/${id}/cancel/`, {
        method: "POST",
        headers: {
            "Authorization": "Token " + token,
            "Content-Type": "application/json"
        }
    })
    .then(res => res.json())
    .then(() => {
        alert("تم إلغاء الطلب بنجاح");
        location.reload();
    })
    .catch(() => alert("حدث خطأ أثناء إلغاء الطلب"));
}

// ===============================
//      إعادة التقديم
// ===============================
function reapply(id) {
    if (!confirm("هل تريد إعادة التقديم على هذه الوظيفة؟")) return;

    const token = localStorage.getItem("token");

    fetch(`http://127.0.0.1:8000/api/accounts/student/application/${id}/reapply/`, {
        method: "POST",
        headers: {
            "Authorization": "Token " + token,
            "Content-Type": "application/json"
        }
    })
    .then(res => res.json())
    .then(() => {
        alert("تم إعادة التقديم بنجاح");
        location.reload();
    })
    .catch(() => alert("حدث خطأ أثناء إعادة التقديم"));
}
