const jobsContainer = document.getElementById("jobsContainer");
const jobSearch = document.getElementById("jobSearch");
const jobTypeFilter = document.getElementById("jobTypeFilter");

// بيانات تجريبية
let jobs = [
    { id: 1, title: "مبرمج Python", company: "TechCorp", type: "full-time", description: "مطلوب مبرمج Python بخبرة سنة." },
    { id: 2, title: "مصمم UI/UX", company: "DesignPro", type: "remote", description: "وظيفة عن بُعد لمصمم واجهات." },
    { id: 3, title: "محلل بيانات", company: "DataPlus", type: "part-time", description: "دوام جزئي لتحليل البيانات." },
    { id: 4, title: "متدرب تطوير ويب", company: "WebStart", type: "internship", description: "فرصة تدريب لمطورين مبتدئين." }
];

// عرض الوظائف
function displayJobs(list) {
    jobsContainer.innerHTML = "";

    if (list.length === 0) {
        jobsContainer.innerHTML = `<p class="text-center text-muted">لا توجد وظائف مطابقة</p>`;
        return;
    }

    list.forEach(job => {
        jobsContainer.innerHTML += `
            <div class="col-md-4 mb-4">
                <div class="card job-card shadow-sm">
                    <div class="card-body">
                        <h5 class="card-title fw-bold">${job.title}</h5>
                        <p class="text-muted mb-1">${job.company}</p>
                        <span class="badge bg-primary mb-3">${translateType(job.type)}</span>
                        <p class="card-text">${job.description}</p>
                        <a href="job-detail.html?id=${job.id}" class="btn btn-success w-100">عرض التفاصيل</a>
                    </div>
                </div>
            </div>
        `;
    });
}

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

// بحث + فلترة
function filterJobs() {
    const searchText = jobSearch.value.toLowerCase();
    const selectedType = jobTypeFilter.value;

    const filtered = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchText);
        const matchesType = selectedType ? job.type === selectedType : true;
        return matchesSearch && matchesType;
    });

    displayJobs(filtered);
}

jobSearch.addEventListener("input", filterJobs);
jobTypeFilter.addEventListener("change", filterJobs);

// عرض أولي
displayJobs(jobs);
