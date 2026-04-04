const table = document.getElementById("courses-table");

async function loadCourses() {
    try {
        const response = await fetch("http://127.0.0.1:8000/api/accounts/teacher/courses/", {
            headers: {
                "Authorization": "Token " + localStorage.getItem("token")
            }
        });

        const courses = await response.json();
        table.innerHTML = "";

        courses.forEach(course => {
            table.innerHTML += `
                <tr>
                    <td>
                        <img src="${course.image}" width="80" style="border-radius:6px;">
                    </td>

                    <td>${course.title}</td>

                    <td>${course.price} $</td>

                    <td>${course.lessons_count}</td>

                    <td>
                        <a href="course-detail.html?id=${course.id}" class="btn btn-secondary">عرض</a>

                        <a href="edit-course.html?id=${course.id}" class="btn btn-warning">تعديل</a>

                        <a href="teacher-course-manage.html?id=${course.id}" class="btn btn-manage">إدارة</a>

                        <button onclick="deleteCourse(${course.id})" class="btn btn-danger">حذف</button>

                        <a href="teacher_course_lessons.html?course=${course.id}" class="btn btn-info">الدروس</a>
                    </td>
                </tr>
            `;
        });

    } catch (error) {
        console.log("Error loading courses:", error);
    }
}

async function deleteCourse(id) {
    if (!confirm("هل أنت متأكد من حذف هذا الكورس؟")) return;

    await fetch(`http://127.0.0.1:8000/api/accounts/teacher/course/${id}/delete/`, {
        method: "DELETE",
        headers: {
            "Authorization": "Token " + localStorage.getItem("token")
        }
    });

    alert("تم حذف الكورس");
    loadCourses();
}

loadCourses();
