document.addEventListener("DOMContentLoaded", async function () {

    const token = localStorage.getItem("token");
    const userType = localStorage.getItem("user_type");

    // حماية الصفحة
    if (!token || userType !== "student") {
        localStorage.clear();
        window.location.href = "login.html";
        return;
    }

    try {
        // ============================
        // 1) جلب بيانات الطالب
        // ============================
        const response = await fetch("http://127.0.0.1:8000/api/accounts/student/profile/", {
            method: "GET",
            headers: { "Authorization": "Token " + token }
        });

        const data = await response.json();
        const profile = data.profile;

        // تعبئة بيانات الهيدر
        document.getElementById("studentName").textContent = profile.full_name;
        document.getElementById("studentPhoto").src = profile.photo || "assets/img/user.png";

        // ============================
        // 2) جلب كورسات الطالب
        // ============================
        const coursesRes = await fetch("http://127.0.0.1:8000/api/accounts/student/my-courses/", {
            method: "GET",
            headers: { "Authorization": "Token " + token }
        });

        const courses = await coursesRes.json();
        document.getElementById("myCoursesCount").textContent = courses.length;

        const container = document.getElementById("myCoursesContainer");
        container.innerHTML = "";

        if (courses.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-4">
                    <img src="assets/img/empty.png" width="120" class="mb-3">
                    <p class="text-muted">لا توجد كورسات مسجّل بها حتى الآن.</p>
                </div>
            `;
        } else {
            courses.forEach(item => {
                const course = item.course;

                // ============================
                // زر حسب نسبة التقدم
                // ============================
                let actionButton = "";

                if (item.progress_percentage === 100) {
                    actionButton = `
                        <button class="btn btn-success btn-sm w-100" onclick="viewCertificate(${course.id})">
                            عرض الشهادة
                        </button>
                    `;
                } else {
                    actionButton = `
                        <button class="btn btn-primary btn-sm w-100" onclick="openCourse(${course.id})">
                            متابعة
                        </button>
                    `;
                }

                // ============================
                // بطاقة الكورس
                // ============================
                container.innerHTML += `
                    <div class="col-md-4 mb-3">
                        <div class="course-card">

                            <img src="${course.image || 'assets/img/course_default.png'}" 
                                class="w-100 mb-2 rounded">

                            <h5 class="fw-bold">${course.title}</h5>

                            <div class="progress mb-2">
                                <div class="progress-bar bg-primary" style="width: ${item.progress_percentage}%"></div>
                            </div>

                            <p class="text-muted" style="font-size: 13px;">
                                نسبة التقدم: ${item.progress_percentage}%
                            </p>

                            ${actionButton}
                        </div>
                    </div>
                `;
            });
        }

        // ============================
        // 3) جلب عدد الشهادات
        // ============================
        const certCountRes = await fetch("http://127.0.0.1:8000/api/accounts/student/certificates/count/", {
            method: "GET",
            headers: { "Authorization": "Token " + token }
        });

        const certCountData = await certCountRes.json();
        document.getElementById("certificatesCount").textContent = certCountData.count;

    } catch (error) {
        console.error("Error loading student data:", error);
        alert("حدث خطأ أثناء تحميل البيانات.");
    }

    // تسجيل الخروج
    document.getElementById("logoutBtn").addEventListener("click", function () {
        localStorage.clear();
        window.location.href = "login.html";
    });

});

// دالة فتح صفحة الكورس
function openCourse(id) {
    window.location.href = "student_course_view.html?id=" + id;
}

// دالة عرض الشهادة
function viewCertificate(courseId) {
    window.location.href = "certificate_view.html?course_id=" + courseId;
}
