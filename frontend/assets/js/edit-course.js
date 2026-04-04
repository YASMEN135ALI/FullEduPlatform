const form = document.getElementById("editCourseForm");

// استخراج ID من الرابط
const urlParams = new URLSearchParams(window.location.search);
const courseId = urlParams.get("id");

// تحميل بيانات الكورس
async function loadCourse() {
    const response = await fetch(`http://127.0.0.1:8000/api/accounts/teacher/course/${courseId}/`, {
        headers: {
            "Authorization": "Token " + localStorage.getItem("token")
        }
    });

    const course = await response.json();

    document.getElementById("title").value = course.title;
    document.getElementById("description").value = course.description;
    document.getElementById("price").value = course.price;
    document.getElementById("level").value = course.level;
    document.getElementById("duration").value = course.duration;

    document.getElementById("currentImage").src = course.image;
}

loadCourse();

// إرسال التعديلات
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("title", document.getElementById("title").value);
    data.append("description", document.getElementById("description").value);
    data.append("price", document.getElementById("price").value);
    data.append("level", document.getElementById("level").value);
    data.append("duration", document.getElementById("duration").value);

    const imageFile = document.getElementById("image").files[0];
    if (imageFile) {
        data.append("image", imageFile);
    }

    const response = await fetch(`http://127.0.0.1:8000/api/accounts/teacher/course/${courseId}/update/`, {
        method: "PUT",
        headers: {
            "Authorization": "Token " + localStorage.getItem("token")
        },
        body: data
    });

    if (response.ok) {
        alert("تم تعديل الكورس بنجاح");
        window.location.href = "teacher_courses.html";
    } else {
        alert("حدث خطأ أثناء تعديل الكورس");
    }
});
