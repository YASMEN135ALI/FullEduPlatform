alert("JS LOADED!");

document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("studentForm");

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const full_name = document.getElementById("full_name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        const age = document.getElementById("age").value.trim();
        const education_level = document.getElementById("education_level").value;
        const country = document.getElementById("country").value.trim();
        const phone = document.getElementById("phone").value.trim();

        if (!full_name || !email || !password || !age || !education_level || !country) {
            alert("يرجى ملء جميع الحقول المطلوبة");
            return;
        }

        const studentData = {
            full_name,
            email,
            password,
            age,
            education_level,
            country,
            phone
        };

        try {
            const response = await fetch("http://127.0.0.1:8000/api/accounts/register/student/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(studentData)
            });

            const result = await response.json();

            if (response.ok) {
                alert("تم تسجيل الطالب بنجاح!");
                console.log("Success:", result);

                // 🔥 التوجيه الصحيح لصفحة تسجيل الدخول
                window.location.href = "login.html";
            } else {
                alert("حدث خطأ: " + (result.error || "يرجى المحاولة لاحقًا"));
                console.error("Error:", result);
            }

        } catch (error) {
            alert("تعذر الاتصال بالخادم");
            console.error("Network Error:", error);
        }
    });
});
