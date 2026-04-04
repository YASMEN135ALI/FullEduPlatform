const form = document.getElementById("editLessonForm");

// استخراج lesson_id من الرابط
const urlParams = new URLSearchParams(window.location.search);
const lessonId = urlParams.get("id");

// تحميل بيانات الدرس
async function loadLesson() {
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/accounts/teacher/lesson/${lessonId}/`, {
            headers: {
                "Authorization": "Token " + localStorage.getItem("token")
            }
        });

        if (!response.ok) {
            const text = await response.text();
            console.error("Error response:", text);
            alert("تعذر تحميل بيانات الدرس");
            return;
        }

        const lesson = await response.json();

        document.getElementById("title").value = lesson.title;
        document.getElementById("order_index").value = lesson.order_index;

        // عرض الفيديو الحالي إذا موجود
        if (lesson.video) {
            document.getElementById("currentVideo").src = lesson.video;
        }

    } catch (error) {
        console.error("Error loading lesson:", error);
        alert("حدث خطأ أثناء تحميل الدرس");
    }
}

loadLesson();

// إرسال التعديلات
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("title", document.getElementById("title").value);
    data.append("order_index", document.getElementById("order_index").value);

    const videoFile = document.getElementById("video").files[0];
    if (videoFile) {
        data.append("video", videoFile);
    }

    try {
        const response = await fetch(`http://127.0.0.1:8000/api/accounts/teacher/lesson/${lessonId}/update/`, {
            method: "PATCH",   // 🔥 مهم جدًا — تعديل جزئي وليس PUT
            headers: {
                "Authorization": "Token " + localStorage.getItem("token")
            },
            body: data
        });

        if (response.ok) {
            alert("تم تعديل الدرس بنجاح");
            window.history.back();
        } else {
            const errorData = await response.json();
            console.error("Error:", errorData);
            alert("حدث خطأ أثناء تعديل الدرس");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("تعذر الاتصال بالسيرفر");
    }
});
