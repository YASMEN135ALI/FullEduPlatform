document.addEventListener("DOMContentLoaded", async function () {

    const token = localStorage.getItem("token");
    const userType = localStorage.getItem("user_type");

    // حماية الصفحة
    if (!token || userType !== "student") {
        window.location.href = "login.html";
        return;
    }

    // جلب ID الدرس من الرابط
    const urlParams = new URLSearchParams(window.location.search);
    const lessonId = urlParams.get("id");

    if (!lessonId) {
        alert("لا يوجد درس محدد.");
        return;
    }

    await loadLesson(lessonId);

    document.getElementById("completeBtn").onclick = () => {
        completeLesson(lessonId);
    };
});

let COURSE_ID = null;

// ======================================================
// 1) تحميل بيانات الدرس
// ======================================================
async function loadLesson(lessonId) {
    const token = localStorage.getItem("token");

    try {
        const res = await fetch(`http://127.0.0.1:8000/api/accounts/student/lesson/${lessonId}/`, {
            headers: { "Authorization": "Token " + token }
        });

        if (!res.ok) {
            throw new Error("فشل تحميل بيانات الدرس");
        }

        const data = await res.json();

        // حفظ course_id للرجوع للكورس
        COURSE_ID = data.course;

        // تعبئة العنوان
        document.getElementById("lessonTitle").textContent = data.title;

        // حالة الدرس
        document.getElementById("lessonStatus").textContent =
            data.completed ? "✔ مكتمل" : "✦ غير مكتمل";

        // عرض المحتوى
        renderLessonContent(data);

    } catch (error) {
        console.error(error);
        alert("حدث خطأ أثناء تحميل الدرس.");
    }
}


// ======================================================
// 2) عرض محتوى الدرس
// ======================================================
function renderLessonContent(lesson) {
    const container = document.getElementById("lessonContent");
    container.innerHTML = "";

    const text = lesson.content || "";
    const video = lesson.video || null;
    const file = lesson.file || null;
    const external = lesson.external_url || null;

    // نص
    if (text.trim() !== "") {
        container.innerHTML = `
            <div class="content-box">
                <p style="white-space: pre-line; font-size: 18px;">${text}</p>
            </div>
        `;
    }

    // فيديو
    if (video) {
        container.innerHTML += `
            <div class="video-container">
                <video controls>
                    <source src="${video}" type="video/mp4">
                    المتصفح لا يدعم تشغيل الفيديو.
                </video>
            </div>
        `;
    }

    // ملف
    if (file) {
        container.innerHTML += `
            <div class="file-box">
                <h5>📄 ملف الدرس</h5>
                <a href="${file}" download class="btn btn-primary mt-2">تحميل الملف</a>
            </div>
        `;
    }

    // رابط خارجي
    if (external) {
        container.innerHTML += `
            <div class="external-link">
                <h5>🌐 رابط خارجي</h5>
                <a href="${external}" target="_blank" class="btn btn-info mt-2">
                    فتح الرابط
                </a>
            </div>
        `;
    }

    if (!text && !video && !file && !external) {
        container.innerHTML = `<p class="text-danger">لا يوجد محتوى متاح لهذا الدرس.</p>`;
    }
}


// ======================================================
// 3) إكمال الدرس
// ======================================================
async function completeLesson(lessonId) {
    const token = localStorage.getItem("token");

    try {
        const res = await fetch(`http://127.0.0.1:8000/api/accounts/lesson/${lessonId}/complete/`, {
            method: "POST",
            headers: {
                "Authorization": "Token " + token
            }
        });

        if (!res.ok) {
            throw new Error("فشل إكمال الدرس");
        }

        alert("تم إكمال الدرس بنجاح!");

        // الرجوع للكورس
        window.location.href = `course-detail.html?id=${COURSE_ID}`;

    } catch (error) {
        console.error(error);
        alert("حدث خطأ أثناء إكمال الدرس.");
    }
}
