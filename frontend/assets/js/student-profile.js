document.addEventListener("DOMContentLoaded", function () {

    const token = localStorage.getItem("token");

    if (!token) {
        alert("يجب تسجيل الدخول أولاً");
        window.location.href = "login.html";
        return;
    }

    const nameEl = document.getElementById("studentName");
    const emailEl = document.getElementById("studentEmail");
    const progressEl = document.getElementById("progressBadge");

    // حقول التعديل
    const fullNameInput = document.getElementById("fullNameInput");
    const ageInput = document.getElementById("ageInput");
    const educationInput = document.getElementById("educationInput");
    const countryInput = document.getElementById("countryInput");
    const phoneInput = document.getElementById("phoneInput");

    // ============================
    // 1) جلب بيانات الطالب
    // ============================

    fetch("http://127.0.0.1:8000/api/accounts/student/profile/", {
        method: "GET",
        headers: {
            "Authorization": "Token " + token
        }
    })
    .then(res => res.json())
    .then(data => {
        const profile = data.profile;

        // عرض البيانات
        nameEl.textContent = profile.full_name;
        emailEl.textContent = localStorage.getItem("email") || "";
        progressEl.textContent = "المستوى: " + profile.education_level;

        // تعبئة الفورم
        fullNameInput.value = profile.full_name;
        ageInput.value = profile.age;
        educationInput.value = profile.education_level;
        countryInput.value = profile.country;
        phoneInput.value = profile.phone || "";
    })
    .catch(err => console.log(err));


    // ============================
    // 2) إرسال التعديلات
    // ============================

    document.getElementById("editStudentForm").addEventListener("submit", function (e) {
        e.preventDefault();

        const updatedData = {
            full_name: fullNameInput.value,
            age: ageInput.value,
            education_level: educationInput.value,
            country: countryInput.value,
            phone: phoneInput.value
        };

        fetch("http://127.0.0.1:8000/api/student/profile/update/", {
            method: "PUT",
            headers: {
                "Authorization": "Token " + token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedData)
        })
        .then(res => res.json())
        .then(data => {
            alert("تم تحديث البيانات بنجاح!");

            // تحديث العرض مباشرة
            nameEl.textContent = updatedData.full_name;
            progressEl.textContent = "المستوى: " + updatedData.education_level;
        })
        .catch(err => console.log(err));
    });

});
