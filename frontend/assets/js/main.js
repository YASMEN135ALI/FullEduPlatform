function loadNavbar() {
  const userType = localStorage.getItem("user_type");
  let navbarFile = "";

  if (!userType) {
    navbarFile = "components/navbar-public.html";   // زائر
  } 
  else if (userType === "student") {
    navbarFile = "components/navbar-student.html";  // طالب
  } 
  else if (userType === "teacher") {
    navbarFile = "components/navbar-instructor.html"; // أستاذ
  } 
  else if (userType === "company") {
    navbarFile = "components/navbar-company.html"; // شركة
  }

  fetch(navbarFile)
    .then(res => res.text())
    .then(data => document.getElementById("navbar").innerHTML = data)
    .catch(err => console.error("Navbar Load Error:", err));
}

function loadFooter() {
  fetch("components/footer.html")
    .then(res => res.text())
    .then(data => document.getElementById("footer").innerHTML = data)
    .catch(err => console.error("Footer Load Error:", err));
}
function logout() {
    // حذف التوكن
    localStorage.removeItem("token");

    // حذف أي بيانات مستخدم مخزنة
    localStorage.removeItem("user_type");
    localStorage.removeItem("username");

    // إعادة التوجيه للصفحة الرئيسية
    window.location.href = "index.html";
}


loadNavbar();
loadFooter();
