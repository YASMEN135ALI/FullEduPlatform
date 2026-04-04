document.addEventListener("DOMContentLoaded", function () {

    const token = localStorage.getItem("token");

    // تغيير كلمة المرور
    document.getElementById("passwordForm").addEventListener("submit", async function (e) {
        e.preventDefault();

        const oldPass = document.getElementById("oldPassword").value;
        const newPass = document.getElementById("newPassword").value;
        const confirmPass = document.getElementById("confirmPassword").value;

        if (newPass !== confirmPass) {
            alert("كلمة المرور الجديدة غير متطابقة");
            return;
        }

        const response = await fetch("http://127.0.0.1:8000/api/accounts/company/change-password/", {
            method: "PUT",
            headers: {
                "Authorization": "Token " + token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                old_password: oldPass,
                new_password: newPass
            })
        });

        if (response.ok) {
            alert("تم تغيير كلمة المرور بنجاح");
        } else {
            alert("حدث خطأ أثناء تغيير كلمة المرور");
        }
    });

    // إعدادات الإشعارات
    document.getElementById("notificationsForm").addEventListener("submit", async function (e) {
        e.preventDefault();

        const notifyApplicants = document.getElementById("notifyApplicants").checked;
        const notifyStatus = document.getElementById("notifyStatus").checked;

        const response = await fetch("http://127.0.0.1:8000/api/accounts/company/notification-settings/", {
            method: "PUT",
            headers: {
                "Authorization": "Token " + token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                notify_new_applicant: notifyApplicants,
                notify_status_change: notifyStatus
            })
        });

        if (response.ok) {
            alert("تم حفظ إعدادات الإشعارات");
        } else {
            alert("حدث خطأ أثناء حفظ الإعدادات");
        }
    });

});
