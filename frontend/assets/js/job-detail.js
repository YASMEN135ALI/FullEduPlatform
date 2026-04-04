// الحصول على ID من الرابط
const urlParams = new URLSearchParams(window.location.search);
const jobId = urlParams.get("id");

// عناصر الصفحة
const titleEl = document.getElementById("jobTitle");
const companyEl = document.getElementById("jobCompany");
const typeEl = document.getElementById("jobType");
const descEl = document.getElementById("jobDescription");
const reqEl = document.getElementById("jobRequirements");

// بيانات تجريبية
const sampleJob = {
    id: 1,
    title: "مبرمج Python",
    company: "TechCorp",
    type: "full-time",
    description: "مطلوب مبرمج Python بخبرة سنة على الأقل للعمل ضمن فريق تطوير.",
    requirements: [
        "خبرة في Python لمدة سنة على الأقل",
        "معرفة بـ Django أو Flask",
        "قدرة على العمل ضمن فريق",
        "مهارات تحليل وحل المشكلات"
    ]
};

// ترجمة نوع الوظيفة
function translateType(type) {
    const types = {
        "full-time": "دوام كامل",
        "part-time": "دوام جزئي",
        "remote": "عن بُعد",
        "internship": "تدريب"
    };
    return types[type] || "غير محدد";
}

// عرض البيانات
function loadJobDetails(job) {
    titleEl.textContent = job.title;
    companyEl.textContent = job.company;
    typeEl.textContent = translateType(job.type);
    descEl.textContent = job.description;

    reqEl.innerHTML = "";
    job.requirements.forEach(req => {
        reqEl.innerHTML += `<li class="list-group-item">${req}</li>`;
    });
}

// تحميل البيانات التجريبية الآن
loadJobDetails(sampleJob);
