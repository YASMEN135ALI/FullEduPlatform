document.addEventListener("DOMContentLoaded", async function () {

    const token = localStorage.getItem("token");
    const userType = localStorage.getItem("user_type");

    if (!token || userType !== "company") {
        window.location.href = "login.html";
        return;
    }

    // عناصر النموذج
    const nameInput = document.getElementById("companyName");
    const taglineInput = document.getElementById("companyTagline");
    const bioInput = document.getElementById("companyBio");

    const industryInput = document.getElementById("companyIndustry");
    const sizeInput = document.getElementById("companySize");
    const phoneInput = document.getElementById("companyPhone");
    const emailInput = document.getElementById("companyEmail");

    const locationInput = document.getElementById("companyLocation");
    const addressInput = document.getElementById("companyAddress");
    const websiteInput = document.getElementById("companyWebsite");

    const logoInput = document.getElementById("companyLogo");
    const certificateInput = document.getElementById("companyCertificate");
    const licenseInput = document.getElementById("companyLicense");

    // ============================================================
    // تحميل بيانات الشركة
    // ============================================================
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

            nameInput.value = company.company_name || "";
            taglineInput.value = company.tagline || "";
            bioInput.value = company.bio || "";

            industryInput.value = company.industry || "";
            sizeInput.value = company.size || "";
            phoneInput.value = company.phone || "";
            emailInput.value = company.email || "";

            locationInput.value = company.location || "";
            addressInput.value = company.address || "";
            websiteInput.value = company.website || "";

        } catch (error) {
            console.error(error);
            alert("خطأ أثناء تحميل بيانات الشركة");
        }
    }

    // ============================================================
    // حفظ التعديلات
    // ============================================================
    document.getElementById("editCompanyForm").addEventListener("submit", async function (e) {
        e.preventDefault();

        const formData = new FormData();

        formData.append("company_name", nameInput.value);
        formData.append("tagline", taglineInput.value);
        formData.append("bio", bioInput.value);

        formData.append("industry", industryInput.value);
        formData.append("size", sizeInput.value);
        formData.append("phone", phoneInput.value);
        formData.append("email", emailInput.value);

        formData.append("location", locationInput.value);
        formData.append("address", addressInput.value);
        formData.append("website", websiteInput.value);

        if (logoInput.files.length > 0) {
            formData.append("logo", logoInput.files[0]);
        }

        if (certificateInput.files.length > 0) {
            formData.append("certificate", certificateInput.files[0]);
        }

        if (licenseInput.files.length > 0) {
            formData.append("license", licenseInput.files[0]);
        }

        try {
            const response = await fetch("http://127.0.0.1:8000/api/accounts/company/profile/update/", {
                method: "PUT",
                headers: {
                    "Authorization": "Token " + token
                },
                body: formData
            });

            const result = await response.json();

            if (!response.ok) {
                alert("فشل في حفظ التعديلات");
                return;
            }

            alert("تم تحديث الملف بنجاح");
            window.location.href = "company-profile.html";

        } catch (error) {
            console.error(error);
            alert("حدث خطأ أثناء حفظ التعديلات");
        }
    });

    await loadCompanyProfile();

});
