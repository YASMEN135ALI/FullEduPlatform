document.addEventListener("DOMContentLoaded", function () {

    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    // 1) جلب بيانات البروفايل
    fetch("http://127.0.0.1:8000/api/accounts/teacher/profile/", {
        method: "GET",
        headers: {
            "Authorization": "Token " + token
        }
    })
    .then(res => res.json())
    .then(data => {
        const profile = data.profile;
        const user = data.user;

        document.getElementById("teacherName").textContent = user.first_name + " " + user.last_name;
        document.getElementById("teacherSpecialization").textContent = profile.specialization || "غير محدد";
        document.getElementById("teacherRating").textContent = profile.rating_avg;
        document.getElementById("teacherBalance").textContent = profile.balance;

        document.getElementById("experienceYears").textContent = profile.experience_years || 0;
        document.getElementById("teacherBio").textContent = profile.bio || "لا توجد نبذة.";

        if (profile.photo) {
            document.getElementById("teacherPhoto").src = profile.photo;
        }

        if (profile.cv) {
            document.getElementById("cvLink").href = profile.cv;
        }

        if (profile.certificate) {
            document.getElementById("certificateLink").href = profile.certificate;
        }

        // تعبئة النموذج
        document.getElementById("specialization").value = profile.specialization || "";
        document.getElementById("experience_years").value = profile.experience_years || "";
        document.getElementById("bio").value = profile.bio || "";
    });

    // 2) تحديث البيانات
    document.getElementById("updateProfileForm").addEventListener("submit", function (e) {
        e.preventDefault();

        const formData = new FormData();

        formData.append("specialization", document.getElementById("specialization").value);
        formData.append("experience_years", document.getElementById("experience_years").value);
        formData.append("bio", document.getElementById("bio").value);

        const photo = document.getElementById("photo").files[0];
        const cv = document.getElementById("cv").files[0];
        const certificate = document.getElementById("certificate").files[0];

        if (photo) formData.append("photo", photo);
        if (cv) formData.append("cv", cv);
        if (certificate) formData.append("certificate", certificate);

        fetch("http://127.0.0.1:8000/api/accounts/teacher/profile/update/", {
            method: "POST",
            headers: {
                "Authorization": "Token " + token
            },
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            alert("تم تحديث البروفايل بنجاح");
            location.reload();
        })
        .catch(err => {
            console.error(err);
            alert("حدث خطأ أثناء التحديث");
        });
    });

});
