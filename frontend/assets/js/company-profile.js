document.addEventListener("DOMContentLoaded", async function () {

    const token = localStorage.getItem("token");
    const userType = localStorage.getItem("user_type");

    if (!token || userType !== "company") {
        window.location.href = "login.html";
        return;
    }

    // عناصر الصفحة
    const logoEl = document.getElementById("companyLogo");
    const nameEl = document.getElementById("companyName");
    const taglineEl = document.getElementById("companyTagline");
    const industryEl = document.getElementById("companyIndustry");
    const locationEl = document.getElementById("companyLocation");
    const sizeEl = document.getElementById("companySize");

    const bioEl = document.getElementById("companyBio");

    const emailEl = document.getElementById("companyEmail");
    const phoneEl = document.getElementById("companyPhone");
    const websiteEl = document.getElementById("companyWebsite");
    const addressEl = document.getElementById("companyAddress");

    const jobsCountEl = document.getElementById("jobsCount");
    const applicantsCountEl = document.getElementById("applicantsCount");
    const activeJobsCountEl = document.getElementById("activeJobsCount");

    const jobsContainer = document.getElementById("companyJobs");

    const viewCertificateBtn = document.getElementById("viewCertificateBtn");
    const viewLicenseBtn = document.getElementById("viewLicenseBtn");

    // ============ تحميل بيانات الشركة ============
    async function loadCompanyProfile() {
        try {
            const response = await fetch("http://127.0.0.1:8000/api/accounts/company/profile/", {
                method: "GET",
                headers: {
                    "Authorization": "Token " + token
                }
            });

            const data = await response.json();
            const company = data.profile;

            // الهيدر
            nameEl.textContent = company.company_name;
            taglineEl.textContent = company.tagline || "لا يوجد سطر تعريفي بعد.";
            industryEl.textContent = company.industry || "غير محدد";
            locationEl.textContent = company.location || "غير محدد";
            sizeEl.textContent = company.size || "غير محدد";

            if (company.logo) {
                logoEl.src = company.logo;
            }

            // النبذة
            bioEl.textContent = company.bio || "لا توجد نبذة متاحة حالياً.";

            // التواصل
            emailEl.textContent = company.email || "—";
            phoneEl.textContent = company.phone || "—";
            addressEl.textContent = company.address || "—";

            if (company.website) {
                websiteEl.textContent = company.website;
                websiteEl.href = company.website;
            } else {
                websiteEl.textContent = "—";
                websiteEl.removeAttribute("href");
            }

            // المستندات
            if (company.certificate) {
                viewCertificateBtn.disabled = false;
                viewCertificateBtn.addEventListener("click", () => {
                    window.open(company.certificate, "_blank");
                });
            }

            if (company.license) {
                viewLicenseBtn.disabled = false;
                viewLicenseBtn.addEventListener("click", () => {
                    window.open(company.license, "_blank");
                });
            }

        } catch (error) {
            console.error(error);
            alert("حدث خطأ أثناء تحميل بيانات الشركة");
        }
    }

    // ============ تحميل وظائف الشركة ============
    async function loadCompanyJobs() {
        try {
            const response = await fetch("http://127.0.0.1:8000/api/accounts/company/jobs/", {
                method: "GET",
                headers: {
                    "Authorization": "Token " + token
                }
            });

            const jobs = await response.json();

            jobsCountEl.textContent = jobs.length;
            applicantsCountEl.textContent = jobs.reduce((sum, job) => sum + (job.applicants_count || 0), 0);
            activeJobsCountEl.textContent = jobs.filter(job => job.status === "active").length;

            jobsContainer.innerHTML = "";

            if (jobs.length === 0) {
                jobsContainer.innerHTML = `<p class="text-muted">لا توجد وظائف حالياً.</p>`;
                return;
            }

            jobs.forEach(job => {
                jobsContainer.innerHTML += `
                    <div class="job-card">
                        <h3>${job.title}</h3>
                        <p class="job-meta">
                            <span><i class="fa-solid fa-user"></i> المتقدمون: ${job.applicants_count || 0}</span>
                        </p>
                        <span class="job-status ${job.status === "active" ? "active" : "closed"}">
                            ${job.status === "active" ? "نشطة" : "مغلقة"}
                        </span>
                        <a href="job-detail.html?id=${job.id}" class="btn btn-primary btn-sm w-100 mt-2">
                            عرض التفاصيل
                        </a>
                    </div>
                `;
            });

        } catch (error) {
            console.error(error);
            alert("تعذر تحميل وظائف الشركة");
        }
    }

    // زر تعديل الملف
    document.getElementById("editProfileBtn").addEventListener("click", () => {
        window.location.href = "company-edit-profile.html";
    });

    // تشغيل
    await loadCompanyProfile();
    await loadCompanyJobs();

});
