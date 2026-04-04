const table = document.getElementById("lessons-table");

// استخراج course_id من الرابط
const urlParams = new URLSearchParams(window.location.search);
const courseId = urlParams.get("course");

// زر إضافة درس جديد
document.getElementById("addLessonBtn").href = `create-lesson.html?course=${courseId}`;

// تحميل الدروس الخاصة بالكورس
async function loadCourseLessons() {
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/accounts/course/${courseId}/lessons/`, {
            headers: {
                "Authorization": "Token " + localStorage.getItem("token")
            }
        });

        if (!response.ok) {
            const text = await response.text();
            console.error("Error response:", text);
            alert("تعذر تحميل الدروس");
            return;
        }

        const data = await response.json();

        // عرض عنوان الكورس
        document.getElementById("courseTitle").textContent = `دروس الكورس: ${data.course_title}`;

        const lessons = data.lessons;
        table.innerHTML = "";

        lessons.forEach(lesson => {
            table.innerHTML += `
                <tr>
                    <td>${lesson.title}</td>
                    <td>${lesson.order_index}</td>
                    <td>
                        <a href="lesson_details.html?id=${lesson.id}" class="btn btn-details">عرض</a>
                        <a href="edit-lesson.html?id=${lesson.id}" class="btn btn-edit">تعديل</a>
                        <button onclick="deleteLesson(${lesson.id})" class="btn btn-delete">حذف</button>

                        <!-- 🔥 التعديل هنا -->
                        <a href="create_quiz.html?id=${lesson.id}" class="btn btn-quiz">اختبار</a>
                    </td>
                </tr>
            `;
        });

    } catch (error) {
        console.log("Error loading lessons:", error);
    }
}

async function deleteLesson(id) {
    if (!confirm("هل أنت متأكد من حذف هذا الدرس؟")) return;

    await fetch(`http://127.0.0.1:8000/api/accounts/teacher/lesson/${id}/delete/`, {
        method: "DELETE",
        headers: {
            "Authorization": "Token " + localStorage.getItem("token")
        }
    });

    alert("تم حذف الدرس");
    loadCourseLessons();
}

loadCourseLessons();
