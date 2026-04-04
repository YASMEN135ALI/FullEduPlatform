// استخراج lesson_id من الرابط
const urlParams = new URLSearchParams(window.location.search);
const lessonId = urlParams.get("id");

async function loadLessonDetails() {
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/accounts/teacher/lesson/${lessonId}/`, {
            headers: {
                "Authorization": "Token " + localStorage.getItem("token")
            }
        });

        if (!response.ok) {
            alert("تعذر تحميل بيانات الدرس");
            return;
        }

        const lesson = await response.json();

        // تعبئة البيانات العامة
        document.getElementById("lessonTitle").textContent = lesson.title;
        document.getElementById("lessonOrder").textContent = lesson.order_index;

        // إخفاء كل أنواع المحتوى أولاً
        document.getElementById("videoContainer").style.display = "none";
        document.getElementById("textContainer").style.display = "none";
        document.getElementById("fileContainer").style.display = "none";
        document.getElementById("externalContainer").style.display = "none";

        // 🔥 عرض المحتوى حسب نوعه
        if (lesson.content_type === "video") {
            document.getElementById("videoContainer").style.display = "block";
            document.getElementById("lessonVideo").src = lesson.video_url;
        }

        else if (lesson.content_type === "text") {
            document.getElementById("textContainer").style.display = "block";
            document.getElementById("lessonText").innerHTML = lesson.content;
        }

        else if (lesson.content_type === "file") {
            document.getElementById("fileContainer").style.display = "block";
            document.getElementById("lessonFile").href = lesson.file_url;
        }

        else if (lesson.content_type === "external") {
            document.getElementById("externalContainer").style.display = "block";
            document.getElementById("lessonExternal").href = lesson.external_url;
        }

        // روابط التعديل والرجوع
        document.getElementById("editLink").href = `edit_lesson.html?id=${lesson.id}`;
        document.getElementById("backLink").href = `teacher_course_lessons.html?course=${lesson.course}`;

    } catch (error) {
        console.error("Error loading lesson:", error);
        alert("حدث خطأ أثناء تحميل الدرس");
    }
}

loadLessonDetails();
