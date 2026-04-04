document.addEventListener("DOMContentLoaded", function () {
    console.log("Teacher JS Loaded");

    const form = document.getElementById("teacherForm");

    form.addEventListener("submit", async function (e) {
        e.preventDefault();
        console.log("Submitting teacher form...");

        // Collect text fields
        const full_name = document.getElementById("full_name").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const specialization = document.getElementById("specialization").value;
        const experience_years = document.getElementById("experience_years").value;
        const bio = document.getElementById("bio").value;

        // Collect files
        const certificate = document.getElementById("certificate").files[0];
        const cv = document.getElementById("cv").files[0];
        const photo = document.getElementById("photo").files[0];

        // Build FormData
        const formData = new FormData();
        formData.append("full_name", full_name);
        formData.append("email", email);
        formData.append("password", password);
        formData.append("specialization", specialization);
        formData.append("experience_years", experience_years);
        formData.append("bio", bio);

        formData.append("certificate", certificate);
        formData.append("cv", cv);
        if (photo) {
            formData.append("photo", photo);
        }

        try {
            const response = await fetch("http://127.0.0.1:8000/api/accounts/register/teacher/", {
                method: "POST",
                body: formData
            });

            const result = await response.json();
            console.log(result);

            if (result.status === "success") {
                alert("تم تسجيل المدرّس بنجاح! حسابك الآن قيد المراجعة من قبل الإدارة.");
                form.reset();

                // 🔥 التوجيه لصفحة انتظار الموافقة
                window.location.href = "teacher_pending.html";
            } else {
                alert("حدث خطأ أثناء التسجيل. يرجى التحقق من البيانات.");
            }

        } catch (error) {
            console.error("Error:", error);
            alert("تعذر الاتصال بالخادم. تأكد أن السيرفر يعمل.");
        }
    });
});
