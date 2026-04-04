document.addEventListener("DOMContentLoaded", async function () {

    const token = localStorage.getItem("token");
    const userType = localStorage.getItem("user_type");

    if (!token || userType !== "company") {
        window.location.href = "login.html";
        return;
    }

    try {
        // ============================
        // 1) جلب بيانات الشركة
        // ============================
        const response = await fetch("http://127.0.0.1:8000/api/accounts/company/profile/", {
            method: "GET",
            headers: {
                "Authorization": "Token " + token
            }
        });

        const data = await response.json();
        console.log("Company Data:", data);

        const profile = data.profile;

        // تعبئة البيانات في الصفحة
        document.getElementById("companyName").textContent = profile.company_name;
        document.getElementById("companyIndustry").textContent = profile.industry;
        document.getElementById("companyLocation").textContent = profile.location;

        if (profile.logo) {
            document.getElementById("companyLogo").src = profile.logo;
        }

        // تعبئة الفورم
        document.getElementById("companyNameInput").value = profile.company_name;
        document.getElementById("industryInput").value = profile.industry;
        document.getElementById("locationInput").value = profile.location;
        document.getElementById("phoneInput").value = profile.phone;
        document.getElementById("websiteInput").value = profile.website;

    } catch (error) {
        console.error("Error loading company data:", error);
        alert("حدث خطأ أثناء تحميل بيانات الشركة.");
    }

    // ============================
    // 2) تحديث بيانات الشركة
    // ============================
    document.getElementById("editCompanyForm").addEventListener("submit", async function (e) {
        e.preventDefault();

        const updatedData = {
            company_name: document.getElementById("companyNameInput").value,
            industry: document.getElementById("industryInput").value,
            location: document.getElementById("locationInput").value,
            phone: document.getElementById("phoneInput").value,
            website: document.getElementById("websiteInput").value
        };

        try {
            const updateRes = await fetch("http://127.0.0.1:8000/api/accounts/company/profile/update/", {
                method: "PUT",
                headers: {
                    "Authorization": "Token " + token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updatedData)
            });

            const result = await updateRes.json();
            console.log("Update Result:", result);

            alert("تم تحديث بيانات الشركة بنجاح!");

        } catch (error) {
            console.error("Error updating company profile:", error);
            alert("حدث خطأ أثناء تحديث البيانات.");
        }
    });

});
