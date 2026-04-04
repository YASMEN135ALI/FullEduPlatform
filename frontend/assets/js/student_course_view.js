document.addEventListener("DOMContentLoaded", async function () {

    const token = localStorage.getItem("token");
    const userType = localStorage.getItem("user_type");

    // حماية الصفحة
    if (!token || userType !== "student") {
        window.location.href = "login.html";
        return;
    }

    // جلب ID الكورس من الرابط
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get("id");

    if (!courseId) {
        alert("لا يوجد كورس محدد.");
        return;
    }

    // تحميل البيانات
    await loadCourseDetails(courseId);
    await loadLessons(courseId);
    await checkQuiz(courseId);
});


// ======================================================
// 1) تحميل تفاصيل الكورس
// ======================================================
async function loadCourseDetails(courseId) {
    const token = localStorage.getItem("token");

    try {
        const res = await fetch(`http://127.0.0.1:8000/api/accounts/course/${courseId}/`, {
            headers: { "Authorization": "Token " + token }
        });

        if (!res.ok) {
            throw new Error("فشل تحميل تفاصيل الكورس");
        }

        const data = await res.json();

        // تعبئة البيانات
        document.getElementById("courseTitle").textContent = data.title;
        document.getElementById("courseDescription").textContent = data.description;

        document.getElementById("courseHeader").style.backgroundImage =
            `url('${data.image || "assets/img/course_default.png"}')`;

        document.getElementById("progressBar").style.width = `${data.progress}%`;
        document.getElementById("progressText").textContent = `${data.progress}% مكتمل`;

    } catch (error) {
        console.error(error);
        alert("حدث خطأ أثناء تحميل تفاصيل الكورس.");
    }
}


// ======================================================
// 2) تحميل الدروس (المسار المصحّح)
// ======================================================
async function loadLessons(courseId) {
    const token = localStorage.getItem("token");

    try {
        // 🔥 المسار الصحيح حسب ملف urls.py
        const res = await fetch(`http://127.0.0.1:8000/api/accounts/course/${courseId}/lessons/`, {
            headers: { "Authorization": "Token " + token }
        });

        if (!res.ok) {
            throw new Error("فشل تحميل الدروس");
        }

        const data = await res.json();
        const lessons = data.lessons;

        const container = document.getElementById("lessonsContainer");
        container.innerHTML = "";

        lessons.forEach(lesson => {
            container.innerHTML += `
                <div class="lesson-card d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="fw-bold">${lesson.title}</h6>
                        <span class="lesson-status">
                            ${lesson.completed ? "✔ مكتمل" : "✦ غير مكتمل"}
                        </span>
                    </div>

                    <button class="btn btn-primary btn-sm"
                        onclick="openLesson(${lesson.id})">
                        ${lesson.completed ? "عرض" : "ابدأ"}
                    </button>
                </div>
            `;
        });

    } catch (error) {
        console.error(error);
        alert("حدث خطأ أثناء تحميل الدروس.");
    }
}


// ======================================================
// 3) التحقق من وجود اختبار نهائي
// ======================================================
// ======================================================
// 3) التحقق من وجود اختبار نهائي (النسخة الصحيحة للطالب)
// ======================================================
async function checkQuiz(courseId) {
    const token = localStorage.getItem("token");

    try {
        // أولاً: نجيب الدروس
        const lessonsRes = await fetch(`http://127.0.0.1:8000/api/accounts/course/${courseId}/lessons/`, {
            headers: { "Authorization": "Token " + token }
        });

        const lessonsData = await lessonsRes.json();
        const lessons = lessonsData.lessons;

        // ثانياً: نبحث عن درس فيه اختبار
        for (let lesson of lessons) {

            const quizRes = await fetch(`http://127.0.0.1:8000/api/accounts/quiz/${lesson.id}/`, {
                headers: { "Authorization": "Token " + token }
            });

            // إذا رجع 200 → يعني هذا الدرس فيه اختبار
            if (quizRes.status === 200) {
                document.getElementById("quizSection").style.display = "block";

                document.getElementById("startQuizBtn").onclick = () => {
                    window.location.href = `quiz_view.html?lesson=${lesson.id}`;
                };

                break; // وقف لأننا وجدنا اختبار
            }
        }

    } catch (error) {
        console.error(error);
    }
}


// ======================================================
// فتح صفحة الدرس
// ======================================================
function openLesson(id) {
    window.location.href = `lesson_view.html?id=${id}`;
}
