from django.urls import path
from .views import live_search

from .views import (
    # AUTH & ADMIN
    RegisterView, ApproveUserView, LoginView,


    # STUDENT
    StudentRegisterView, StudentProfileView, UpdateStudentProfile,
    MyCoursesView, StudentCoursesView, EnrollCourseView,
    AddCourseReviewView, AddSkillView, AddExperienceView,
    AddProjectView, AddLanguageView, UpdateObjectiveView,
    ProfileDataView, JobMatchView,CheckAppliedView,

    # STUDENT NOTIFICATIONS
    StudentNotificationsView, StudentMarkAllReadView,
    StudentDeleteNotificationView, StudentNotificationSettingsView,

    # TEACHER
    TeacherRegisterView, TeacherDashboardView, TeacherProfileView,
    UpdateTeacherProfileView, TeacherSettingsView,

    # TEACHER COURSES
    TeacherCoursesListView, CreateCourseView, TeacherCourseDetailView,
    UpdateCourseView, DeleteCourseView, StudentLessonDetailView,

    # TEACHER LESSONS
    TeacherLessonsListView, CreateLessonView, LessonDetailView,
    UpdateLessonView, DeleteLessonView,

    # TEACHER NOTIFICATIONS
    TeacherNotificationsView, ClearTeacherNotificationsView,
    TeacherNotificationSettingsView,

    # STUDENT MANAGEMENT (الجديد)
    TeacherStudentsListView, StudentProgressView, SendMessageView,

    # COURSES & LESSONS
    CourseListView, CourseDetailsView, CourseLessonsView,
    CompleteLessonView, ai_lesson_assistant,

    # CERTIFICATES
    GenerateCertificateView, CertificateDetailAPI, CertificateVerifyView,
    StudentCertificatesAPIView, CertificatesCountAPIView,

    # QUIZ SYSTEM (Teacher)
    CreateQuizView, GetQuizForTeacherView, UpdateQuizView,
    DeleteQuizView, TeacherCourseQuizzesView,
    CreateQuestionView, GetQuestionView, UpdateQuestionView,
    DeleteQuestionView, CreateChoiceView, UpdateChoiceView,
    DeleteChoiceView, SetCorrectChoiceView,

    # QUIZ SYSTEM (Student)
    GetQuizView, SubmitQuizView,

    # COMPANY & JOBS
    CompanyRegisterView, CompanyDashboardView, CompanyProfileView,
    UpdateCompanyProfileView, CreateJobPostView, DeleteJobPostView,
    JobListView, JobDetailView, ApplyJobView, MyJobApplicationsView,
    JobDetailUpdateView, JobDeleteView, JobApplicantsListView,
    JobApplicationStatusUpdateView, CompanyJobsListView,
    CompanyChangePasswordView, CompanyNotificationsView,
    CompanyNotificationSettingsView,JobApplicationDetailView
)




urlpatterns = [

    # -----------------------------------------------------
    # AUTH & ADMIN
    # -----------------------------------------------------
    path('register/', RegisterView.as_view(), name='register'),
    path('approve/<int:user_id>/', ApproveUserView.as_view(), name='approve-user'),
    path('login/', LoginView.as_view(), name='login'),

    # -----------------------------------------------------
    # STUDENT
    # -----------------------------------------------------
    path('register/student/', StudentRegisterView.as_view(), name='register-student'),
    path('student/profile/', StudentProfileView.as_view(), name='student-profile'),
   path('student/profile/update/', UpdateStudentProfile.as_view(), name='student-profile-update'),

    path('student/my-courses/', MyCoursesView.as_view(), name='my-courses'),
    path('student/courses/', StudentCoursesView.as_view(), name='student-courses'),
    path('courses/<int:course_id>/review/add/', AddCourseReviewView.as_view(), name='course-review'),
    path("student/lesson/<int:lesson_id>/", StudentLessonDetailView.as_view(), name="student-lesson-detail"),
    path('student/my-applications/', MyJobApplicationsView.as_view(), name='my-job-applications'),
    path("student/add-skill/", AddSkillView.as_view()),
    path("student/add-experience/", AddExperienceView.as_view()),
    path("student/add-project/", AddProjectView.as_view()),
    path("student/add-language/", AddLanguageView.as_view()),
    path("student/update-objective/", UpdateObjectiveView.as_view()),
    
    path("student/profile-data/", ProfileDataView.as_view(), name="profile-data"),
    path("student/job-matching/", JobMatchView.as_view(), name="job-matching"),
    path("jobs/<int:job_id>/is_applied/", CheckAppliedView.as_view()),


# ---------------- Student Notifications ----------------
path("notifications/student/", StudentNotificationsView.as_view(), name="student-notifications"),
path("notifications/student/mark-read/", StudentMarkAllReadView.as_view(), name="student-notifications-mark-read"),
path("notifications/student/delete/<int:pk>/", StudentDeleteNotificationView.as_view(), name="student-notification-delete"),
path("notifications/student/settings/", StudentNotificationSettingsView.as_view(), name="student-notification-settings"),

    # ---------------- Teacher ----------------
    path("teacher/", TeacherNotificationsView.as_view(), name="teacher-notifications"),
    path("teacher/clear/", ClearTeacherNotificationsView.as_view(), name="teacher-notifications-clear"),
    path("teacher/settings/", TeacherNotificationSettingsView.as_view(), name="teacher-notification-settings"),

    # ---------------- Company ----------------
    path("company/", CompanyNotificationsView.as_view(), name="company-notifications"),
    path("company/settings/", CompanyNotificationSettingsView.as_view(), name="company-notification-settings"),

    # -----------------------------------------------------
    # TEACHER
    # -----------------------------------------------------
    path('register/teacher/', TeacherRegisterView.as_view(), name='register-teacher'),
    path('teacher/dashboard/', TeacherDashboardView.as_view(), name='teacher-dashboard'),
    path('teacher/profile/', TeacherProfileView.as_view(), name='teacher-profile'),
    path('teacher/profile/update/', UpdateTeacherProfileView.as_view(), name='teacher-profile-update'),

    # Teacher Courses
    path("teacher/courses/", TeacherCoursesListView.as_view(), name="teacher-courses"),
    path("teacher/course/create/", CreateCourseView.as_view(), name="teacher-course-create"),
    path("teacher/course/<int:id>/", TeacherCourseDetailView.as_view(), name="teacher-course-detail"),
    path("teacher/course/<int:id>/update/", UpdateCourseView.as_view(), name="teacher-course-update"),
    path("teacher/course/<int:id>/delete/", DeleteCourseView.as_view(), name="teacher-course-delete"),

    # Teacher Lessons
    path("teacher/lessons/", TeacherLessonsListView.as_view(), name="teacher-lessons"),
    path("teacher/lesson/create/", CreateLessonView.as_view(), name="lesson-create"),
    path("teacher/lesson/<int:id>/", LessonDetailView.as_view(), name="lesson-detail"),
    path("teacher/lesson/<int:id>/update/", UpdateLessonView.as_view(), name="lesson-update"),
    path("teacher/lesson/<int:id>/delete/", DeleteLessonView.as_view(), name="lesson-delete"),
    
    path("teacher/notifications/", TeacherNotificationsView.as_view(), name="teacher-notifications"),
    path("teacher/notifications/clear/", ClearTeacherNotificationsView.as_view(), name="teacher-notifications-clear"),
    path("teacher/notification-settings/", TeacherNotificationSettingsView.as_view(), name="teacher-notification-settings"),
    path("teacher/settings/", TeacherSettingsView.as_view(), name="teacher-settings"),

    # -----------------------------------------------------
    # COURSES & LESSONS
    # -----------------------------------------------------
    path('courses/', CourseListView.as_view(), name='course-list'),
    path('course/<int:pk>/', CourseDetailsView.as_view(), name='course-details'),
    path('courses/<int:course_id>/enroll/', EnrollCourseView.as_view(), name='course-enroll'),
    path('course/<int:course_id>/lessons/', CourseLessonsView.as_view(), name='course-lessons'),
    path('lesson/<int:lesson_id>/complete/', CompleteLessonView.as_view(), name='lesson-complete'),
     path("ai/lesson/", ai_lesson_assistant),
    path('search/live/', live_search, name='live-search'),


    # -----------------------------------------------------
    # CERTIFICATES
    # -----------------------------------------------------
    path('courses/<int:course_id>/certificate/', GenerateCertificateView.as_view(), name='generate-certificate'),
    path("api/certificate/<int:course_id>/", CertificateDetailAPI.as_view()),
    path("verify/<uuid:code>/", CertificateVerifyView.as_view()),
    path("student/my-certificates/", StudentCertificatesAPIView.as_view()),
    path("student/certificates/count/", CertificatesCountAPIView.as_view()),
    path("certificate/<int:course_id>/", CertificateDetailAPI.as_view(), name="certificate-detail"),
 

    # -----------------------------------------------------
    # QUIZ SYSTEM (Teacher)
    # -----------------------------------------------------
    path("teacher/quiz/create/", CreateQuizView.as_view(), name="quiz-create"),
    path("teacher/quiz/<int:quiz_id>/", GetQuizForTeacherView.as_view(), name="teacher-quiz-detail"),
    path("teacher/quiz/<int:quiz_id>/update/", UpdateQuizView.as_view(), name="teacher-quiz-update"),
    path("teacher/quiz/<int:quiz_id>/delete/", DeleteQuizView.as_view(), name="teacher-quiz-delete"),
    path("teacher/course/<int:course_id>/quizzes/", TeacherCourseQuizzesView.as_view(), name="course-quizzes"),

    # Questions
    path("teacher/question/create/", CreateQuestionView.as_view(), name="question-create"),
    path("teacher/question/<int:question_id>/", GetQuestionView.as_view(), name="question-detail"),
    path("teacher/question/<int:question_id>/update/", UpdateQuestionView.as_view(), name="question-update"),
    path("teacher/question/<int:question_id>/delete/", DeleteQuestionView.as_view(), name="question-delete"),

    # Choices
    path("teacher/choice/create/", CreateChoiceView.as_view(), name="choice-create"),
    path("teacher/choice/<int:choice_id>/update/", UpdateChoiceView.as_view(), name="choice-update"),
    path("teacher/choice/<int:choice_id>/delete/", DeleteChoiceView.as_view(), name="choice-delete"),
    path("teacher/choice/<int:choice_id>/set-correct/", SetCorrectChoiceView.as_view(), name="choice-set-correct"),

    # -----------------------------------------------------
    # QUIZ SYSTEM (Student)
    # -----------------------------------------------------
    path("quiz/<int:lesson_id>/", GetQuizView.as_view(), name="get-quiz"),
    path("quiz/<int:quiz_id>/submit/", SubmitQuizView.as_view(), name="submit-quiz"),

    # -----------------------------------------------------
    # COMPANY & JOBS
    # -----------------------------------------------------
    path('register/company/', CompanyRegisterView.as_view(), name='register-company'),
    path('company/dashboard/', CompanyDashboardView.as_view(), name='company-dashboard'),
   path("company/profile/", CompanyProfileView.as_view(), name="company-profile"),
path("company/profile/update/", UpdateCompanyProfileView.as_view(), name="company-profile-update"),

    path('company/create-job/', CreateJobPostView.as_view(), name='create-job'),
    path('jobs/', JobListView.as_view(), name='job-list'),
    path('jobs/<int:id>/', JobDetailView.as_view(), name='job-detail'),
    path('jobs/<int:job_id>/apply/', ApplyJobView.as_view(), name='job-apply'),
path("company/jobs/<int:pk>/delete/", DeleteJobPostView.as_view(), name="delete-job"),
path("company/jobs/", CompanyJobsListView.as_view(), name="company-jobs"),

    path('student/my-applications/', MyJobApplicationsView.as_view(), name='my-job-applications'),
    path('company/job/<int:id>/', JobDetailUpdateView.as_view(), name='company-job-update'),
    path('company/job/<int:id>/delete/', JobDeleteView.as_view(), name='company-job-delete'),
    path('company/job/<int:job_id>/applicants/', JobApplicantsListView.as_view(), name='job-applicants'),
    path('company/applicant/<int:id>/status/', JobApplicationStatusUpdateView.as_view(), name='applicant-status'),
   path("student/application/<int:pk>/", JobApplicationDetailView.as_view()),

    path('company/change-password/', CompanyChangePasswordView.as_view(), name='company-change-password'),
    path('company/notification-settings/', CompanyNotificationSettingsView.as_view(), name='company-notification-settings'),
    path('company/notifications/', CompanyNotificationsView.as_view(), name='company-notifications'),
    
    # قائمة الطلاب المسجّلين في كورسات المدرّس
    path(
        "teacher/students/",
        TeacherStudentsListView.as_view(),
        name="teacher-students"
    ),

    # تقدّم الطالب في كورس معيّن
    path(
        "teacher/student/<int:student_id>/course/<int:course_id>/progress/",
        StudentProgressView.as_view(),
        name="student-progress"
    ),

    # إرسال رسالة للطالب
    path(
        "teacher/student/<int:student_id>/message/",
        SendMessageView.as_view(),
        name="send-message"
    ),
]

