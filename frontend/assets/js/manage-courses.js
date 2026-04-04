// بيانات تجريبية
const courses = [
    { id: 1, title: "دورة Python", students: 120, lessons: 15 },
    { id: 2, title: "دورة Django", students: 85, lessons: 10 },
    { id: 3, title: "مقدمة في الذكاء الاصطناعي", students: 60, lessons: 12 }
];

// تحميل الكورسات في الجدول
const coursesTable = document.getElementById("coursesTable");

courses.forEach(course => {
    coursesTable.innerHTML += `
        <tr>
            <td>${course.title}</td>
            <td>${course.students}</td>
            <td>${course.lessons}</td>
            <td>
                <a href="course-detail.html?id=${course.id}" class="btn btn-primary btn-sm btn-action">عرض</a>
                <a href="edit-course.html?id=${course.id}" class="btn btn-warning btn-sm btn-action">تعديل</a>
                <a href="manage-lessons.html?course=${course.id}" class="btn btn-info btn-sm btn-action">الدروس</a>
                <button class="btn btn-danger btn-sm btn-action" onclick="deleteCourse(${course.id})">حذف</button>
            </td>
        </tr>
    `;
});

// حذف كورس (تجريبي)
function deleteCourse(id) {
    alert("سيتم حذف الكورس ID: " + id + " عند الربط مع API");
}
