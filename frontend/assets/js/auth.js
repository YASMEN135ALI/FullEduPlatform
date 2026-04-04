document.addEventListener("DOMContentLoaded", function () {
    console.log("Login JS Loaded");

    const form = document.getElementById("loginForm");

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {
            const response = await fetch("http://127.0.0.1:8000/api/accounts/login/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const result = await response.json();
            console.log(result);

            if (result.token) {

                // حفظ البيانات
                localStorage.setItem("token", result.token);
                localStorage.setItem("user_type", result.user_type);

                // التوجيه حسب نوع المستخدم
                if (result.user_type === "student") {
                    window.location.href = "student_dashboard.html";

                } else if (result.user_type === "teacher") {

                    // 🔥 التحقق من الموافقة
                    if (result.is_approved === true) {
                        window.location.href = "dashboard-teacher.html";
                    } else {
                        window.location.href = "teacher_pending.html";
                    }

                } else if (result.user_type === "company") {

                    // نفس الفكرة للشركة
                    if (result.is_approved === true) {
                        window.location.href = "dashboard-company.html";
                    } else {
                        window.location.href = "company_pending.html";
                    }
                }

            } else {
                alert("بيانات الدخول غير صحيحة.");
            }

        } catch (error) {
            console.error("Error:", error);
            alert("تعذر الاتصال بالخادم.");
        }
    });
});
