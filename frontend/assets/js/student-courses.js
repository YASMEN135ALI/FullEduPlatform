document.addEventListener("DOMContentLoaded", () => {

    // ============================
    // 1) التحقق من وجود التوكن
    // ============================
    const token = localStorage.getItem("token");
    if (!token) {
        alert("يجب تسجيل الدخول أولاً");
        window.location.href = "login.html";
        return;
    }

    // ============================
    // 2) عناصر الصفحة
    // ============================
    const coursesList = document.getElementById("coursesList");
    const noMsg = document.getElementById("noCoursesMsg");
    const searchForm = document.getElementById("searchForm");

    // ============================
    // 3) دالة تحميل الكورسات
    // ============================
    async function loadCourses(filters = {}) {

        // تنظيف الواجهة
        coursesList.innerHTML = "";
        noMsg.classList.add("d-none");

        // تجهيز رابط API مع الفلاتر
        let query = new URLSearchParams(filters).toString();
        let url = "http://127.0.0.1:8000/api/accounts/student/courses/";
        if (query) url += "?" + query;

        try {
            const response = await fetch(url, {
                headers: { "Authorization": "Token " + token }
            });

            if (!response.ok) {
                throw new Error("خطأ في الاتصال بالسيرفر");
            }

            const courses = await response.json();

            // لا يوجد كورسات
            if (!Array.isArray(courses) || courses.length === 0) {
                noMsg.classList.remove("d-none");
                return;
            }

            // عرض الكورسات
            courses.forEach(course => {
                coursesList.innerHTML += createCourseCard(course);
            });

        } catch (error) {
            console.error(error);
            alert("حدث خطأ أثناء تحميل الكورسات");
        }
    }

    // ============================
    // 4) قالب كارت الكورس
    // ============================
    function createCourseCard(c) {
        return `
            <div class="col-md-4 mb-4">
                <div class="card h-100 shadow-sm">

                    <img src="${c.image || 'assets/img/course-placeholder.jpg'}" 
                         class="card-img-top" alt="Course Image">

                    <div class="card-body">

                        <h5 class="card-title">${c.title}</h5>

                        <p class="card-text">
                            ${c.description?.substring(0, 100) || ""}...
                        </p>

                        <p><strong>السعر:</strong> 
                            ${c.price == 0 ? "مجاني" : c.price + " $"}
                        </p>

                        <p><strong>المستوى:</strong> 
                            ${c.level || "غير محدد"}
                        </p>

                        <p><strong>المدة:</strong> 
                            ${c.duration || "غير محدد"} ساعات
                        </p>

                        <a href="student-course-detail.html?id=${c.id}" 
                           class="btn btn-primary w-100">
                           تفاصيل الكورس
                        </a>

                    </div>
                </div>
            </div>
        `;
    }

    // ============================
    // 5) تشغيل أولي
    // ============================
    loadCourses();

    // ============================
    // 6) البحث والفلاتر
    // ============================
    searchForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const keyword = document.getElementById("keyword").value.trim();
        const price = document.getElementById("priceFilter").value;
        const level = document.getElementById("levelFilter").value;

        loadCourses({ keyword, price, level });
    });

});
