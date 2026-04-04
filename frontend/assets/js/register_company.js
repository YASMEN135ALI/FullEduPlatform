document.addEventListener("DOMContentLoaded", function () {
    console.log("Company JS Loaded");

    const form = document.getElementById("companyForm");

    form.addEventListener("submit", async function (e) {
        e.preventDefault();
        console.log("Submitting company form...");

        // Collect text fields
        const company_name = document.getElementById("company_name").value;
        const industry = document.getElementById("industry").value;
        const size = document.getElementById("size").value;
        const phone = document.getElementById("phone").value;
        const location = document.getElementById("location").value;
        const website = document.getElementById("website").value;

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        // Collect files
        const license = document.getElementById("license").files[0];
        const certificate = document.getElementById("certificate").files[0];
        const logo = document.getElementById("logo").files[0];

        // Build FormData
        const formData = new FormData();
        formData.append("company_name", company_name);
        formData.append("industry", industry);
        formData.append("size", size);
        formData.append("phone", phone);
        formData.append("location", location);
        formData.append("website", website);

        formData.append("email", email);
        formData.append("password", password);

        formData.append("license", license);
        formData.append("certificate", certificate);
        if (logo) {
            formData.append("logo", logo);
        }

        try {
            const response = await fetch("http://127.0.0.1:8000/api/accounts/register/company/", {
                method: "POST",
                body: formData
            });

            const result = await response.json();
            console.log(result);

            if (result.status === "success") {
                alert("تم تسجيل الشركة بنجاح! حسابكم الآن قيد المراجعة من قبل الإدارة.");
                form.reset();

                // 🔥 التوجيه لصفحة انتظار الموافقة
                window.location.href = "company_pending.html";
            } else {
                alert("حدث خطأ أثناء التسجيل. يرجى التحقق من البيانات.");
            }

        } catch (error) {
            console.error("Error:", error);
            alert("تعذر الاتصال بالخادم. تأكد أن السيرفر يعمل.");
        }
    });
});
