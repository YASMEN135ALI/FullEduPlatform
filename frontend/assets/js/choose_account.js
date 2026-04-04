document.addEventListener("DOMContentLoaded", function () {
    const studentCard = document.getElementById("choose-student");
    const companyCard = document.getElementById("choose-company");
    const teacherCard = document.getElementById("choose-teacher");

    if (studentCard) {
        studentCard.addEventListener("click", function () {
            window.location.href = "register_student.html";
        });
    }

    if (companyCard) {
        companyCard.addEventListener("click", function () {
            window.location.href = "register_company.html";
        });
    }

    if (teacherCard) {
        teacherCard.addEventListener("click", function () {
            window.location.href = "register_teacher.html";
        });
    }
});
