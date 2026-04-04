const urlParams = new URLSearchParams(window.location.search);
const courseId = urlParams.get("course_id");
const token = localStorage.getItem("token");

async function loadCertificate() {
    const response = await fetch(
        `http://127.0.0.1:8000/api/accounts/certificate/${courseId}/`,
        {
            headers: { "Authorization": "Token " + token }
        }
    );

    const data = await response.json();

    if (!response.ok) {
        document.querySelector(".certificate").innerHTML =
            `<p class="text-danger">لا توجد شهادة لهذا الكورس</p>`;
        return;
    }

    document.getElementById("studentName").innerText = data.student_name;
    document.getElementById("courseTitle").innerText = data.course_title;
    document.getElementById("verifyCode").innerText = data.verification_code;
    document.getElementById("issuedDate").innerText = data.issued_at;
    document.getElementById("qrImage").src = data.qr_image;
}

window.addEventListener("DOMContentLoaded", function () {

    loadCertificate();

    // زر العودة
    document.getElementById("backBtn").onclick = () => {
        window.history.back();
    };

    // زر تحميل PDF
    document.getElementById("downloadBtn").onclick = () => {
        const element = document.querySelector(".certificate");
        html2pdf().from(element).save("certificate.pdf");
    };
});
