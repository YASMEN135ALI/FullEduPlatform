// الحصول على ID الشركة من الرابط
const urlParams = new URLSearchParams(window.location.search);
const companyId = urlParams.get("id");

// عناصر الصفحة
const nameEl = document.getElementById("companyName");
const emailEl = document.getElementById("companyEmail");
const industryEl = document.getElementById("companyIndustry");
const bioEl = document.getElementById("companyBio");
const jobsCountEl = document.getElementById("jobsCount");
const applicantsCountEl = document.getElementById("applicantsCount");
const jobsContainer = document.getElementById("companyJobs");

// بيانات تجريبية
const sampleCompany = {
    id: 1,
    name: "TechCorp",
    email: "contact@techcorp.com",
    industry: "تقنية المعلومات",
    bio: "شركة رائدة في تطوير البرمجيات وحلول الذكاء الاصطناعي بخبرة تزيد عن 10 سنوات.",
    jobs: [
        { id: 1, title: "مبرمج Python", applicants: 12 },
        { id: 2, title: "مصمم UI/UX", applicants: 7 },
        { id: 3, title: "محلل بيانات", applicants: 4 }
    ]
};

// تحميل بيانات الشركة
function loadCompanyProfile(company) {
    nameEl.textContent = company.name;
    emailEl.textContent = company.email;
    industryEl.textContent = company.industry;
    bioEl.textContent = company.bio;

    jobsCountEl.textContent = company.jobs.length;
    applicantsCountEl.textContent = company.jobs.reduce((a, b) => a + b.applicants, 0);

    // عرض الوظائف
    jobsContainer.innerHTML = "";
    company.jobs.forEach(job => {
        jobsContainer.innerHTML += `
            <div class="col-md-4 mb-4">
                <div class="card job-card shadow-sm">
                    <div class="card-body">
                        <h5 class="fw-bold">${job.title}</h5>
                        <p class="text-muted">المتقدمون: ${job.applicants}</p>
                        <a href="job-detail.html?id=${job.id}" class="btn btn-primary w-100">عرض الوظيفة</a>
                    </div>
                </div>
            </div>
        `;
    });
}

// تحميل البيانات التجريبية الآن
loadCompanyProfile(sampleCompany);
