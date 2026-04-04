// الحصول على ID الكورس من الرابط
const urlParams = new URLSearchParams(window.location.search);
const courseId = urlParams.get("course");

// بيانات تجريبية
const students = [
    { id: 1, name: "محمد أحمد", email: "m.ahmed@example.com", progress: "70%" },
    { id: 2, name: "سارة خالد", email: "sara.k@example.com", progress: "45%" },
    { id: 3, name: "علي محمود", email: "ali.m@example.com", progress: "90%" }
];

// تحميل الطلاب في الجدول
const studentsTable = document.getElementById("studentsTable");

students.forEach(student => {
    studentsTable.innerHTML += `
        <tr>
            <td>${student.name}</td>
            <td>${student.email}</td>
            <td>${student.progress}</td>
            <td>
                <button class="btn btn-primary btn-sm btn-action" onclick="viewStudent(${student.id})">عرض</button>
                <button class="btn btn-danger btn-sm btn-action" onclick="removeStudent(${student.id})">إزالة</button>
            </td>
        </tr>
    `;
});

// عرض ملف الطالب (تجريبي)
function viewStudent(id) {
    alert("عرض ملف الطالب ID: " + id);
}

// إزالة طالب (تجريبي)
function removeStudent(id) {
    alert("سيتم إزالة الطالب ID: " + id + " عند الربط مع API");
}
ظظ