// =======================
// استخراج ID الدرس من الرابط
// =======================
const urlParams = new URLSearchParams(window.location.search);
const lessonId = urlParams.get("id");

const token = localStorage.getItem("token");

// عناصر الصفحة
const lessonTitle = document.getElementById("lessonTitle");
const lessonContent = document.getElementById("lessonContent");
const videoContainer = document.getElementById("videoContainer");
const completeBtn = document.getElementById("completeBtn");
const backToCourse = document.getElementById("backToCourse");

let courseId = null;

// =======================
// تحميل بيانات الدرس (API الطالب)
// =======================
async function loadLesson() {
    try {
        const response = await fetch(
            `http://127.0.0.1:8000/api/accounts/student/lesson/${lessonId}/`,
            {
                headers: {
                    "Authorization": "Token " + token
                }
            }
        );

        const lesson = await response.json();

        // حفظ course id للرجوع
        courseId = lesson.course;

        // عنوان الدرس
        lessonTitle.innerText = lesson.title;

        // عرض المحتوى النصي (HTML)
        lessonContent.innerHTML = lesson.content || "لا يوجد محتوى نصي.";

        // عرض الفيديو إن وجد
        if (lesson.video) {
            videoContainer.innerHTML = `
                <video controls class="w-100 rounded">
                    <source src="${lesson.video}" type="video/mp4">
                </video>
            `;
        } else {
            videoContainer.classList.add("d-none");
        }

        // زر الرجوع للكورس
        backToCourse.href = `course-detail.html?id=${lesson.course}`;

    } catch (error) {
        console.error("Error loading lesson:", error);
    }
}

// =======================
// إكمال الدرس
// =======================
completeBtn.addEventListener("click", async () => {
    try {
        const response = await fetch(
            `http://127.0.0.1:8000/api/accounts/lesson/${lessonId}/complete/`,
            {
                method: "POST",
                headers: {
                    "Authorization": "Token " + token
                }
            }
        );

        if (response.ok) {
            alert("تمّ إكمال الدرس بنجاح!");
            window.location.href = `course-detail.html?id=${courseId}`;
        } else {
            alert("تعذّر إكمال الدرس.");
        }

    } catch (error) {
        console.error(error);
    }
});

// تشغيل
loadLesson();
