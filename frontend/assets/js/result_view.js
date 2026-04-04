document.addEventListener("DOMContentLoaded", function () {

    const urlParams = new URLSearchParams(window.location.search);

    const score = Number(urlParams.get("score"));
    const passed = urlParams.get("passed") === "true";
    const remaining = Number(urlParams.get("remaining"));
    const lessonId = urlParams.get("lesson");
    const courseId = urlParams.get("course");

    const scoreCircle = document.getElementById("scoreCircle");
    const resultTitle = document.getElementById("resultTitle");
    const resultMessage = document.getElementById("resultMessage");
    const retryBtn = document.getElementById("retryBtn");
    const backBtn = document.getElementById("backBtn");

    scoreCircle.textContent = `${score}%`;

    if (passed) {
        scoreCircle.classList.add("success");
        resultTitle.textContent = "🎉 مبروك! لقد اجتزت الاختبار";
        resultMessage.textContent = "أحسنت! يمكنك الآن متابعة الدروس.";
    } else {
        scoreCircle.classList.add("fail");
        resultTitle.textContent = "❌ لم تجتز الاختبار";
        resultMessage.textContent = "يمكنك المحاولة مرة أخرى لتحسين نتيجتك.";
    }

    if (remaining > 0) {
        retryBtn.style.display = "block";
        retryBtn.onclick = () => {
            window.location.href = `quiz_view.html?lesson=${lessonId}`;
        };
    } else {
        retryBtn.style.display = "none";
    }

    backBtn.onclick = () => {
        window.location.href = `lesson_view.html?id=${lessonId}`;
    };
});
