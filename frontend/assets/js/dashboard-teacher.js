document.addEventListener("DOMContentLoaded", function () {
    console.log("Teacher Dashboard Loaded");

    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    fetch("http://127.0.0.1:8000/api/accounts/teacher/dashboard/", {
        method: "GET",
        headers: {
            "Authorization": "Token " + token
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);

        // اسم المدرّس
        document.getElementById("teacherName").textContent =
            data.teacher.first_name + " " + data.teacher.last_name;

        // التخصص
        document.getElementById("teacherSpecialization").textContent =
            data.profile.specialization || "غير محدد";

        // عدد الدورات
        document.getElementById("coursesCount").textContent = data.courses.length;

        // الطلاب والمشاهدات (لاحقًا)
        document.getElementById("studentsCount").textContent = 0;
        document.getElementById("viewsCount").textContent = 0;

        // عرض الدورات
        const coursesList = document.getElementById("coursesList");
        coursesList.innerHTML = "";

        data.courses.forEach(course => {
            const card = `
                <div class="course-card">
                    <h5>${course.title}</h5>
                    <p>${course.description.substring(0, 120)}...</p>
                    <button class="btn btn-primary btn-sm">إدارة الدورة</button>
                </div>
            `;
            coursesList.innerHTML += card;
        });

    })
    .catch(error => {
        console.error("Error:", error);
        alert("حدث خطأ أثناء تحميل البيانات.");
    });

    document.getElementById("logoutBtn").addEventListener("click", function () {
        localStorage.clear();
        window.location.href = "login.html";
    });
});
