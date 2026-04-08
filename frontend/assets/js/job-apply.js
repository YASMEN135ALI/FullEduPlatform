// استخراج ID الوظيفة من الرابط
const urlParams = new URLSearchParams(window.location.search);
const jobId = urlParams.get("id");

const JOB_API = `http://127.0.0.1:8000/api/accounts/jobs/${jobId}/`;
const APPLY_API = `http://127.0.0.1:8000/api/accounts/jobs/${jobId}/apply/`;

document.addEventListener("DOMContentLoaded", () => {
    loadJobTitle();
});

// جلب عنوان الوظيفة
async function loadJobTitle() {
    try {
        const token = localStorage.getItem("token");

        const response = await fetch(JOB_API, {
            method: "GET",
            headers: {
                "Authorization": `Token ${token}`
            }
        });

        const job = await response.json();
        document.getElementById("jobTitleText").textContent = `الوظيفة: ${job.title}`;

    } catch (error) {
        console.error("Error loading job:", error);
    }
}

// إرسال الطلب
document.getElementById("applyForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    const cvFile = document.getElementById("cvFile").files[0];
    const coverLetter = document.getElementById("coverLetter").value;

    const formData = new FormData();
    formData.append("cv", cvFile);
    formData.append("cover_letter", coverLetter);

    try {
        const response = await fetch(APPLY_API, {
            method: "POST",
            headers: {
                "Authorization": `Token ${token}`
            },
            body: formData
        });

        const result = await response.json();

        if (response.ok) {
            document.getElementById("successMsg").classList.remove("d-none");
            document.getElementById("successMsg").textContent = "تم إرسال طلبك بنجاح!";
        } else {
            document.getElementById("errorMsg").classList.remove("d-none");
            document.getElementById("errorMsg").textContent =
                result.error || "حدث خطأ أثناء إرسال الطلب";
        }

    } catch (error) {
        console.error("Error applying:", error);
        document.getElementById("errorMsg").classList.remove("d-none");
        document.getElementById("errorMsg").textContent =
            "حدث خطأ أثناء إرسال الطلب";
    }
});
