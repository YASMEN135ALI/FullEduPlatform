const form = document.getElementById("courseForm");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
        alert("يجب تسجيل الدخول أولاً");
        return;
    }

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

    try {
        const response = await fetch("http://127.0.0.1:8000/api/accounts/teacher/course/create/", {
            method: "POST",
            headers: {
                "Authorization": "Token " + token
            },
            body: data
        });

        const result = await response.json();
        console.log(result);

        if (response.ok) {
            alert("تم إضافة الكورس بنجاح");
            window.location.href = "teacher_courses.html";
        } else {
            alert("حدث خطأ أثناء إضافة الكورس");
        }

    } catch (error) {
        console.error(error);
        alert("تعذر الاتصال بالسيرفر");
    }
});
