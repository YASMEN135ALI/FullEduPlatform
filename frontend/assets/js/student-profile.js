// ===============================
// API ENDPOINTS
// ===============================
const BASE_URL = "http://127.0.0.1:8000/api/accounts/student/";

const PROFILE_API = BASE_URL + "profile/";
const UPDATE_PROFILE_API = BASE_URL + "profile/update/";
const ADD_SKILL_API = BASE_URL + "add-skill/";
const ADD_EXPERIENCE_API = BASE_URL + "add-experience/";
const ADD_PROJECT_API = BASE_URL + "add-project/";
const ADD_LANGUAGE_API = BASE_URL + "add-language/";

const token = localStorage.getItem("token");

// ===============================
// LOAD PROFILE ON PAGE LOAD
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    if (!token) {
        alert("يجب تسجيل الدخول أولاً");
        window.location.href = "login.html";
        return;
    }

    loadProfile();
});

// ===============================
// 1) LOAD PROFILE DATA
// ===============================
async function loadProfile() {
    try {
        const response = await fetch(PROFILE_API, {
            headers: { "Authorization": `Token ${token}` }
        });

        const data = await response.json();
        const profile = data.profile;

        fillBasicInfo(profile);
        fillSkills(profile.skills || []);
        fillExperience(profile.experience || []);
        fillProjects(profile.projects || []);
        fillLanguages(profile.languages || []);

        calculateCVScore(profile);

    } catch (error) {
        console.error("Error loading profile:", error);
    }
}

// ===============================
// 2) FILL BASIC INFO
// ===============================
function fillBasicInfo(profile) {
    document.getElementById("studentName").textContent = profile.full_name;
    document.getElementById("studentTitle").textContent = profile.objective || "—";
    document.getElementById("age").textContent = profile.age || "—";
    document.getElementById("country").textContent = profile.country || "—";
    document.getElementById("education").textContent = profile.education_level || "—";
    document.getElementById("phone").textContent = profile.phone || "—";
    document.getElementById("email").textContent = profile.email || "—";

    if (profile.photo) {
        document.getElementById("profileImage").src = profile.photo;
    }

    // Fill edit modal
    document.getElementById("editFullName").value = profile.full_name;
    document.getElementById("editAge").value = profile.age || "";
    document.getElementById("editCountry").value = profile.country || "";
    document.getElementById("editPhone").value = profile.phone || "";
    document.getElementById("editEducation").value = profile.education_level || "";
    document.getElementById("editObjective").value = profile.objective || "";
}

// ===============================
// 3) SKILLS
// ===============================
function fillSkills(skills) {
    const container = document.getElementById("skillsContainer");
    container.innerHTML = "";

    skills.forEach(skill => {
        container.innerHTML += `
            <span class="skill-badge">
                ${skill}
            </span>
        `;
    });
}

async function addSkill() {
    const skill = document.getElementById("skillInput").value;

    if (!skill) return alert("أدخل المهارة");

    await fetch(ADD_SKILL_API, {
        method: "POST",
        headers: {
            "Authorization": `Token ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ skill })
    });

    document.getElementById("skillInput").value = "";
    loadProfile();
}

// ===============================
// 4) EXPERIENCE
// ===============================
function fillExperience(experiences) {
    const container = document.getElementById("experienceContainer");
    container.innerHTML = "";

    experiences.forEach(exp => {
        container.innerHTML += `
            <div class="mb-3 p-3 border rounded">
                <h5>${exp.title}</h5>
                <p class="text-muted">${exp.company} — ${exp.years} سنوات</p>
                <p>${exp.description}</p>
            </div>
        `;
    });
}

async function addExperience() {
    const title = document.getElementById("expTitle").value;
    const company = document.getElementById("expCompany").value;
    const years = document.getElementById("expYears").value;
    const description = document.getElementById("expDesc").value;

    await fetch(ADD_EXPERIENCE_API, {
        method: "POST",
        headers: {
            "Authorization": `Token ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ title, company, years, description })
    });

    loadProfile();
}

// ===============================
// 5) PROJECTS
// ===============================
function fillProjects(projects) {
    const container = document.getElementById("projectsContainer");
    container.innerHTML = "";

    projects.forEach(proj => {
        container.innerHTML += `
            <div class="mb-3 p-3 border rounded">
                <h5>${proj.name}</h5>
                <p>${proj.description}</p>
                <p><strong>التقنيات:</strong> ${proj.tech}</p>
                ${proj.link ? `<a href="${proj.link}" target="_blank">رابط المشروع</a>` : ""}
            </div>
        `;
    });
}

async function addProject() {
    const name = document.getElementById("projName").value;
    const description = document.getElementById("projDesc").value;
    const tech = document.getElementById("projTech").value;
    const link = document.getElementById("projLink").value;

    await fetch(ADD_PROJECT_API, {
        method: "POST",
        headers: {
            "Authorization": `Token ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, description, tech, link })
    });

    loadProfile();
}

// ===============================
// 6) LANGUAGES
// ===============================
function fillLanguages(languages) {
    const container = document.getElementById("languagesContainer");
    container.innerHTML = "";

    languages.forEach(lang => {
        container.innerHTML += `
            <p><strong>${lang.name}:</strong> ${lang.level}</p>
        `;
    });
}

async function addLanguage() {
    const name = document.getElementById("langName").value;
    const level = document.getElementById("langLevel").value;

    await fetch(ADD_LANGUAGE_API, {
        method: "POST",
        headers: {
            "Authorization": `Token ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, level })
    });

    loadProfile();
}

// ===============================
// 7) UPDATE BASIC PROFILE INFO
// ===============================
async function updateCV() {
    const formData = new FormData();

    formData.append("full_name", document.getElementById("editFullName").value);
    formData.append("age", document.getElementById("editAge").value);
    formData.append("country", document.getElementById("editCountry").value);
    formData.append("phone", document.getElementById("editPhone").value);
    formData.append("education_level", document.getElementById("editEducation").value);
    formData.append("objective", document.getElementById("editObjective").value);

    const photo = document.getElementById("editPhoto").files[0];
    if (photo) formData.append("photo", photo);

    await fetch(UPDATE_PROFILE_API, {
        method: "POST",
        headers: { "Authorization": `Token ${token}` },
        body: formData
    });

    loadProfile();
}

// ===============================
// 8) CV SCORE
// ===============================
function calculateCVScore(profile) {
    let score = 0;

    if (profile.skills?.length >= 5) score += 20;
    if (profile.experience?.length >= 1) score += 20;
    if (profile.projects?.length >= 1) score += 20;
    if (profile.certifications?.length >= 1) score += 10;
    if (profile.objective?.length >= 20) score += 10;

    if (profile.languages?.length >= 1) score += 10;

    if (profile.photo) score += 10;

    document.getElementById("cvScoreText").textContent = score + "%";
    document.getElementById("cvScoreCircle").style.setProperty("--percent", score + "%");
}