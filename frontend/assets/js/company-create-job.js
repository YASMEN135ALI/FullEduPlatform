document.addEventListener("DOMContentLoaded", function () {

    const token = localStorage.getItem("token");
    const userType = localStorage.getItem("user_type");

    if (!token || userType !== "company") {
        window.location.href = "login.html";
        return;
    }

    document.getElementById("createJobForm").addEventListener("submit", async function (e) {
        e.preventDefault();

        const jobData = {
            title: document.getElementById("jobTitle").value,
            description: document.getElementById("jobDescription").value,
            job_type: document.getElementById("jobType").value,
            salary: document.getElementById("jobSalary").value,
            skills: document.getElementById("jobSkills").value,
            location: document.getElementById("jobLocation").value,
        };

        try {
            const response = await fetch("http://127.0.0.1:8000/api/accounts/company/create-job/", {
                method: "POST",
                headers: {
                    "Authorization": "Token " + token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(jobData)
            });

            const result = await response.json();
            console.log(result);

            alert("تم نشر الوظيفة بنجاح");
            window.location.href = "company_jobs.html";

        } catch (error) {
            console.error(error);
            alert("حدث خطأ أثناء نشر الوظيفة");
        }
    });

});
