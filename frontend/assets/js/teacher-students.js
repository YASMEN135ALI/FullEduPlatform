const table = document.getElementById("students-table");
let selectedStudentId = null;

async function loadStudents() {
    try {
        const response = await fetch("http://127.0.0.1:8000/api/accounts/teacher/students/", {
            headers: {
                "Authorization": "Token " + localStorage.getItem("token")
            }
        });

        const students = await response.json();
        table.innerHTML = "";
        if (students.length === 0) {
    table.innerHTML = `
        <tr>
            <td colspan="5" class="text-center py-3">
                لا يوجد طلاب مسجّلين حتى الآن
            </td>
        </tr>
    `;
    return;
}

        students.forEach(student => {
            table.innerHTML += `
                <tr>
                    <td>${student.student_name}</td>
                    <td>${student.student_email}</td>
                    <td>${student.course_title}</td>
                    <td>${new Date(student.date_enrolled).toLocaleDateString()}</td>
                    <td>
                        <button class="btn btn-info" onclick="viewProgress(${student.id}, '${student.course_title}')">عرض التقدّم</button>
                        <button class="btn btn-primary" onclick="openMessageModal(${student.id})">إرسال رسالة</button>
                    </td>
                </tr>
            `;
        });

    } catch (error) {
        console.log("Error loading students:", error);
    }
}

function openMessageModal(studentId) {
    selectedStudentId = studentId;
    const modal = new bootstrap.Modal(document.getElementById("sendMessageModal"));
    modal.show();
}

document.getElementById("sendMessageBtn").addEventListener("click", async () => {
    const message = document.getElementById("messageText").value;

    await fetch(`http://127.0.0.1:8000/api/accounts/teacher/student/${selectedStudentId}/message/`, {
        method: "POST",
        headers: {
            "Authorization": "Token " + localStorage.getItem("token"),
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ message })
    });

    alert("تم إرسال الرسالة");
    document.getElementById("messageText").value = "";
    bootstrap.Modal.getInstance(document.getElementById("sendMessageModal")).hide();
});

async function viewProgress(studentId, courseTitle) {
    const response = await fetch(`http://127.0.0.1:8000/api/accounts/teacher/student/${studentId}/progress/`, {
        headers: {
            "Authorization": "Token " + localStorage.getItem("token")
        }
    });

    const progress = await response.json();

    document.getElementById("progressContent").innerHTML = `
        <p>الدروس المكتملة: ${progress.lessons_completed} / ${progress.total_lessons}</p>
        <p>الاختبارات المجتازة: ${progress.quizzes_passed} / ${progress.total_quizzes}</p>
        <p>النسبة: ${progress.percentage}%</p>
    `;

    const modal = new bootstrap.Modal(document.getElementById("progressModal"));
    modal.show();
}

loadStudents();
