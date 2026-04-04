// الحصول على ID الوظيفة من الرابط (اختياري للربط لاحقًا)
const urlParams = new URLSearchParams(window.location.search);
const jobId = urlParams.get("id");

// عناصر الصفحة
const applyForm = document.getElementById("applyForm");
const errorMsg = document.getElementById("errorMsg");
const successMsg = document.getElementById("successMsg");

applyForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const message = document.getElementById("message").value.trim();
    const cvFile = document.getElementById("cvFile").files[0];

    if (!fullName || !email || !phone || !message) {
        errorMsg.textContent = "يرجى تعبئة جميع الحقول المطلوبة";
        errorMsg.classList.remove("d-none");
        successMsg.classList.add("d-none");
        return;
    }

    if (!cvFile) {
        errorMsg.textContent = "يرجى إرفاق السيرة الذاتية (CV)";
        errorMsg.classList.remove("d-none");
        successMsg.classList.add("d-none");
        return;
    }

    errorMsg.classList.add("d-none");
    successMsg.textContent = "تم تجهيز الطلب للإرسال (جاهز للربط مع الـ API)";
    successMsg.classList.remove("d-none");

    console.log("Job ID:", jobId);
    console.log("Application Data:", { fullName, email, phone, message, cvFile });
});
