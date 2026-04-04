// استخراج ID من الرابط
const urlParams = new URLSearchParams(window.location.search);
const courseId = urlParams.get("id");

// عناصر الصفحة
const courseTitle = document.getElementById("courseTitle");
const courseDescription = document.getElementById("courseDescription");
const coursePrice = document.getElementById("coursePrice");
const courseLevel = document.getElementById("courseLevel");
const courseDuration = document.getElementById("courseDuration");
const courseTeacher = document.getElementById("courseTeacher");
const courseImage = document.getElementById("courseImage");

const lessonsList = document.getElementById("lessonsList");
const quizzesList = document.getElementById("quizzesList");
const enrollBtnContainer = document.getElementById("enrollBtnContainer");

const token = localStorage.getItem("token");

let firstLessonId = null;
let nextLessonId = null;

// =======================
// تحميل بيانات الكورس
// =======================
async function loadCourse() {
    const response = await fetch(
        `http://127.0.0.1:8000/api/accounts/course/${courseId}/`,
        {
            headers: {
                "Authorization": "Token " + token
            }
        }
    );

    const course = await response.json();

    // تعبئة البيانات
    courseTitle.innerText = course.title;
    courseDescription.innerText = course.description;
    coursePrice.innerText = course.price == 0 ? "مجاني" : course.price + " $";
    courseLevel.innerText = course.level;
    courseDuration.innerText = course.duration + " ساعة";
    courseTeacher.innerText = course.teacher_name;

    if (course.image) {
        courseImage.src = course.image;
    }

    // حفظ حالة الطالب
    window.courseState = {
        is_enrolled: course.is_enrolled,
        is_completed: course.is_completed,
        has_certificate: course.has_certificate,
        progress: course.progress_percentage
    };

    renderButtons(window.courseState);
}

// =======================
// تنظيم الأزرار حسب حالة الطالب
// =======================
function renderButtons(state) {
    const container = enrollBtnContainer;
    container.innerHTML = "";

    // 1) الطالب غير مسجّل
    if (!state.is_enrolled) {
        container.innerHTML = `
            <button class="btn btn-success w-100" onclick="enroll(${courseId})">
                سجّل في الكورس
            </button>
        `;
        return;
    }

    // 2) الطالب مسجّل ولم يبدأ
    if (state.is_enrolled && state.progress === 0) {
        container.innerHTML = `
            <button class="btn btn-primary w-100" onclick="startCourse()">
                ابدأ الكورس
            </button>
        `;
        return;
    }

    // 3) الطالب بدأ ولم يكمل
    if (state.is_enrolled && !state.is_completed) {
        container.innerHTML = `
            <button class="btn btn-warning w-100" onclick="continueCourse()">
                أكمل الكورس
            </button>
        `;
        return;
    }

    // 4) الطالب أكمل الكورس
    if (state.is_completed) {
        container.innerHTML = `
            <button class="btn btn-success w-100" onclick="showCertificate()">
                عرض الشهادة
            </button>
        `;
    }
}

// =======================
// تحميل الدروس
// =======================
async function loadLessons() {
    const response = await fetch(
        `http://127.0.0.1:8000/api/accounts/course/${courseId}/lessons/`,
        {
            headers: {
                "Authorization": "Token " + token
            }
        }
    );

    const data = await response.json();

    if (data.detail === "أنت لست مسجلاً في هذا الكورس") {
        lessonsList.innerHTML = `<li class="list-group-item text-danger">سجّل أولاً لعرض الدروس</li>`;
        return;
    }

    const lessons = data.lessons;

    lessonsList.innerHTML = "";

    lessons.forEach((lesson, index) => {
        if (index === 0) firstLessonId = lesson.id;
        lessonsList.innerHTML += `
            <a href="student-lesson-details.html?id=${lesson.id}" 
               class="list-group-item list-group-item-action">
                ${lesson.title}
            </a>
        `;
    });

    loadQuizzes(lessons);
}

// =======================
// تحميل الاختبارات
// =======================
async function loadQuizzes(lessons) {
    quizzesList.innerHTML = "";

    for (const lesson of lessons) {
        const quizRes = await fetch(
            `http://127.0.0.1:8000/api/accounts/quiz/${lesson.id}/`,
            {
                headers: {
                    "Authorization": "Token " + token
                }
            }
        );

        if (quizRes.ok) {
            const quiz = await quizRes.json();
            quizzesList.innerHTML += `
                <a href="quiz-details.html?id=${quiz.id}" 
                   class="list-group-item list-group-item-action">
                    اختبار: ${quiz.title}
                </a>
            `;
        }
    }
}

// =======================
// التسجيل في الكورس
// =======================
async function enroll(id) {
    const response = await fetch(
        `http://127.0.0.1:8000/api/accounts/courses/${id}/enroll/`,
        {
            method: "POST",
            headers: {
                "Authorization": "Token " + token
            }
        }
    );

    if (response.ok) {
        alert("تم التسجيل بنجاح!");
        loadCourse();
        loadLessons();
    } else {
        alert("تعذّر التسجيل");
    }
}

// =======================
// أزرار التنقل
// =======================
function startCourse() {
    window.location.href = `student-lesson-details.html?id=${firstLessonId}`;
}

function continueCourse() {
    window.location.href = `student-lesson-details.html?id=${firstLessonId}`;
}

function showCertificate() {
    window.location.href = `certificate_view.html?course_id=${courseId}`;
}

// تشغيل
loadCourse();
loadLessons();
