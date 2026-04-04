// الحصول على ID الكورس من الرابط
const urlParams = new URLSearchParams(window.location.search);
const courseId = urlParams.get("course");

// بيانات تجريبية
const lessons = [
    { id: 1, title: "مقدمة في Python", video: "https://youtube.com/1", order: 1 },
    { id: 2, title: "المتغيرات والأنواع", video: "https://youtube.com/2", order: 2 },
    { id: 3, title: "الحلقات Loops", video: "https://youtube.com/3", order: 3 }
];

// تحميل الدروس في الجدول
const lessonsTable = document.getElementById("lessonsTable");

lessons.forEach(lesson => {
    lessonsTable.innerHTML += `
        <tr>
            <td>${lesson.order}</td>
            <td>${lesson.title}</td>
            <td><a href="${lesson.video}" target="_blank">مشاهدة</a></td>
            <td>
                <a href="edit-lesson.html?id=${lesson.id}" class="btn btn-warning btn-sm btn-action">تعديل</a>
                <button class="btn btn-danger btn-sm btn-action" onclick="deleteLesson(${lesson.id})">حذف</button>
            </td>
        </tr>
    `;
});

// حذف درس (تجريبي)
function deleteLesson(id) {
    alert("سيتم حذف الدرس ID: " + id + " عند الربط مع API");
}
