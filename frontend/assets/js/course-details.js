// =======================
// استخراج ID من الرابط
// =======================
const urlParams = new URLSearchParams(window.location.search);
const courseId = urlParams.get("id");

const token = localStorage.getItem("token");
const userType = localStorage.getItem("user_type");

// حماية الصفحة
if (!token || userType !== "student") {
    window.location.href = "login.html";
}

// =======================
// تحميل بيانات الكورس
// =======================
async function loadCourse() {
    try {
        const response = await fetch(
            `http://127.0.0.1:8000/api/accounts/course/${courseId}/`,
            { headers: { "Authorization": "Token " + token } }
        );

        const course = await response.json();

        document.getElementById("courseTitle").innerText = course.title;
        document.getElementById("courseDescription").innerText = course.description;
        document.getElementById("coursePrice").innerText = `${course.price} $`;
        document.getElementById("courseLevel").innerText = course.level;
        document.getElementById("courseDuration").innerText = `${course.duration} ساعة`;
        document.getElementById("courseTeacher").innerText = course.teacher_name;

        if (course.image) {
            document.getElementById("courseImage").src = course.image;
        }

        // إذا الطالب مسجّل
        if (course.is_enrolled) {
            document.getElementById("enrollBtn").classList.add("d-none");

            document.getElementById("progressSection").classList.remove("d-none");
            document.getElementById("progressBar").style.width = `${course.progress_percentage}%`;
            document.getElementById("progressBar").innerText = `${course.progress_percentage}%`;

            // 🔥 أهم سطر: إظهار زر الشهادة
            if (course.has_certificate === true || course.is_completed === true) {
                document.getElementById("certificateSection").classList.remove("d-none");
            }
        }

    } catch (error) {
        console.error("Error loading course:", error);
    }
}


// =======================
// التسجيل في الكورس
// =======================
document.getElementById("enrollBtn").onclick = async () => {
    try {
        const res = await fetch(
            `http://127.0.0.1:8000/api/accounts/courses/${courseId}/enroll/`,
            {
                method: "POST",
                headers: { "Authorization": "Token " + token }
            }
        );

        if (res.ok) {
            alert("تم التسجيل بنجاح!");
            location.reload();
        } else {
            alert("فشل التسجيل");
        }

    } catch (error) {
        console.error(error);
    }
};

// =======================
// تحميل الدروس
// =======================
async function loadLessons() {
    try {
        const response = await fetch(
            `http://127.0.0.1:8000/api/accounts/course/${courseId}/lessons/`,
            { headers: { "Authorization": "Token " + token } }
        );

        const data = await response.json();
        const lessons = data.lessons; // ← مهم جدًا

        const list = document.getElementById("lessonsList");
        list.innerHTML = "";

        if (!Array.isArray(lessons)) {
            list.innerHTML = `<div class="list-group-item text-danger">لا توجد دروس</div>`;
            return;
        }

        lessons.forEach(lesson => {
            list.innerHTML += `
                <a href="lesson_view.html?id=${lesson.id}" 
                   class="list-group-item list-group-item-action">
                    ${lesson.title}
                </a>
            `;
        });

        loadQuizzes(lessons);

    } catch (error) {
        console.error("Error loading lessons:", error);
    }
}

// =======================
// تحميل الاختبارات
// =======================
async function loadQuizzes(lessons) {
    const list = document.getElementById("quizzesList");
    list.innerHTML = "";

    for (const lesson of lessons) {
        try {
            const quizRes = await fetch(
                `http://127.0.0.1:8000/api/accounts/quiz/${lesson.id}/`,
                { headers: { "Authorization": "Token " + token } }
            );

            if (quizRes.ok) {
                const quiz = await quizRes.json();
                list.innerHTML += `
                    <a href="quiz_view.html?lesson=${lesson.id}" 
                       class="list-group-item list-group-item-action">
                        اختبار: ${quiz.title}
                    </a>
                `;
            }

        } catch (error) {
            console.error("Error loading quiz:", error);
        }
    }
}

// =======================
// زر عرض الشهادة
// =======================
document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("certificateBtn");
    if (btn) {
        btn.onclick = () => {
            window.location.href = `certificate_view.html?course_id=${courseId}`;
        };
    }
});

// =======================
// تشغيل كل شيء
// =======================
loadCourse();
loadLessons();
