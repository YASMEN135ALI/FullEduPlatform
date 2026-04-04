// استخراج course_id من الرابط
const urlParams = new URLSearchParams(window.location.search);
const courseId = urlParams.get("course");

// عناصر الحقول
const contentTypeSelect = document.getElementById("content_type");
const textGroup = document.getElementById("textContentGroup");
const videoGroup = document.getElementById("videoGroup");
const fileGroup = document.getElementById("fileGroup");

// تغيير الحقول حسب نوع الدرس
contentTypeSelect.addEventListener("change", () => {
    const type = contentTypeSelect.value;

    textGroup.style.display = "none";
    videoGroup.style.display = "none";
    fileGroup.style.display = "none";

    if (type === "text") textGroup.style.display = "block";
    if (type === "video") videoGroup.style.display = "block";
    if (type === "file") fileGroup.style.display = "block";
});

// تشغيل التغيير عند تحميل الصفحة
contentTypeSelect.dispatchEvent(new Event("change"));


// إرسال النموذج
document.getElementById("createLessonForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const type = contentTypeSelect.value;

    // -----------------------------
    // 1) حالة الاختبار (Quiz)
    // -----------------------------
    if (type === "quiz") {

        const formData = new FormData();
        formData.append("title", document.getElementById("title").value);
        formData.append("content_type", "quiz");
        formData.append("course", courseId);

        const response = await fetch("http://127.0.0.1:8000/api/accounts/teacher/lesson/create/", {
            method: "POST",
            headers: {
                "Authorization": "Token " + localStorage.getItem("token")
            },
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            // 🔥 التعديل هنا
            window.location.href = `create_quiz.html?id=${data.id}`;
        } else {
            alert("حدث خطأ أثناء إنشاء درس الاختبار");
        }

        return; // مهم جدًا
    }

    // -----------------------------
    // 2) باقي أنواع الدروس
    // -----------------------------
    const formData = new FormData();
    formData.append("title", document.getElementById("title").value);
    formData.append("content_type", type);
    formData.append("course", courseId);

    if (type === "text") {
        formData.append("content", document.getElementById("content").value);
    }

    if (type === "video") {
        const videoFile = document.getElementById("video").files[0];
        const externalUrl = document.getElementById("external_url").value;

        if (videoFile) formData.append("video", videoFile);
        if (externalUrl.trim() !== "") formData.append("external_url", externalUrl);
    }

    if (type === "file") {
        const file = document.getElementById("file").files[0];
        if (file) formData.append("file", file);
    }

    try {
        const response = await fetch("http://127.0.0.1:8000/api/accounts/teacher/lesson/create/", {
            method: "POST",
            headers: {
                "Authorization": "Token " + localStorage.getItem("token")
            },
            body: formData
        });

        if (response.ok) {
            alert("تم إضافة الدرس بنجاح");
            window.location.href = `teacher_course_lessons.html?course=${courseId}`;
        } else {
            const errorData = await response.json();
            console.error("Error:", errorData);
            alert("حدث خطأ أثناء إضافة الدرس");
        }

    } catch (error) {
        console.error("Error:", error);
        alert("تعذر الاتصال بالسيرفر");
    }
});
