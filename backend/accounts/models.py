from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings
from django.contrib.auth import get_user_model

# =========================================================
#                       USER MODEL
# =========================================================

class User(AbstractUser):
    USER_TYPES = (
        ('student', 'Student'),
        ('teacher', 'Teacher'),
        ('company', 'Company'),
        ('admin', 'Platform Admin'),
    )

    user_type = models.CharField(max_length=20, choices=USER_TYPES)
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.username} ({self.user_type})"


# =========================================================
#                     STUDENT PROFILE
# =========================================================

class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="student_profile")

    full_name = models.CharField(max_length=255)
    age = models.IntegerField(null=True, blank=True)
    education_level = models.CharField(max_length=255, blank=True, null=True)
    country = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=50, blank=True, null=True)
    photo = models.ImageField(upload_to="students/photos/", blank=True, null=True)

    # 🔥 حقول السيرة الذاتية الجديدة
    objective = models.TextField(blank=True, null=True)  # الهدف الوظيفي
    skills = models.JSONField(default=list, blank=True)  # قائمة مهارات
    experience = models.JSONField(default=list, blank=True)  # قائمة خبرات
    projects = models.JSONField(default=list, blank=True)  # قائمة مشاريع
    languages = models.JSONField(default=list, blank=True)  # قائمة لغات
    certifications = models.JSONField(default=list, blank=True)  # شهادات (اختياري)

    def __str__(self):
        return self.full_name

# =========================================================
#                     TEACHER PROFILE
# =========================================================

class TeacherProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='teacher_profile')

    specialization = models.CharField(max_length=100, null=True, blank=True)
    experience_years = models.IntegerField(null=True, blank=True)
    bio = models.TextField(blank=True, null=True)

    certificate = models.FileField(upload_to='teachers/certificates/', null=True, blank=True)
    cv = models.FileField(upload_to='teachers/cv/', null=True, blank=True)
    photo = models.ImageField(upload_to='teachers/photos/', null=True, blank=True)

    rating_avg = models.FloatField(default=0.0)
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def __str__(self):
        return f"TeacherProfile: {self.user.username}"


# =========================================================
#                     COMPANY PROFILE
# =========================================================

class CompanyProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='company_profile')

    company_name = models.CharField(max_length=200)
    industry = models.CharField(max_length=100, null=True, blank=True)
    size = models.CharField(max_length=50, null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    location = models.CharField(max_length=200, null=True, blank=True)
    website = models.URLField(blank=True, null=True)

    license = models.FileField(upload_to='companies/license/', null=True, blank=True)
    certificate = models.FileField(upload_to='companies/certificate/', null=True, blank=True)
    logo = models.ImageField(upload_to='companies/logo/', null=True, blank=True)

    def __str__(self):
        return self.company_name


# =========================================================
#                          COURSES
# =========================================================

class Course(models.Model):
    LEVEL_CHOICES = [
        ("beginner", "مبتدئ"),
        ("intermediate", "متوسط"),
        ("advanced", "متقدم"),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    level = models.CharField(max_length=50, choices=LEVEL_CHOICES)
    duration = models.IntegerField(default=1)
    image = models.ImageField(upload_to="courses/", null=True, blank=True)
    teacher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="courses")

    def __str__(self):
        return self.title


# =========================================================
#                          LESSONS
# =========================================================

class Lesson(models.Model):
    CONTENT_TYPES = [
        ("video", "فيديو"),
        ("text", "محتوى نصي"),
        ("file", "ملف مرفق"),
        ("quiz", "اختبار"),
    ]

    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="lessons")
    title = models.CharField(max_length=255)
    content_type = models.CharField(max_length=20, choices=CONTENT_TYPES)

    # محتوى نصي
    content = models.TextField(null=True, blank=True)

    # فيديو مرفوع
    video = models.FileField(upload_to="lessons/videos/", null=True, blank=True)

    # ملف مرفق (PDF, PPT, ZIP…)
    file = models.FileField(upload_to="lessons/files/", null=True, blank=True)

    # رابط خارجي
    external_url = models.URLField(null=True, blank=True)

    order_index = models.IntegerField(default=1)

    class Meta:
        ordering = ["order_index"]

    def __str__(self):
        return self.title


# =========================================================
#                    COURSE ENROLLMENT
# =========================================================

class CourseEnrollment(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')

    enrolled_at = models.DateTimeField(auto_now_add=True)
    progress_percentage = models.FloatField(default=0.0)

    class Meta:
        unique_together = ('student', 'course')

    def __str__(self):
        return f"{self.student} -> {self.course.title}"


# =========================================================
#                          REVIEWS
# =========================================================

class CourseReview(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='course_reviews')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='reviews')

    rating = models.IntegerField()
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'course')

    def __str__(self):
        return f"Review {self.rating} for {self.course.title}"


# =========================================================
#                        CERTIFICATES
# =========================================================
import uuid
from django.core.files.base import ContentFile
from io import BytesIO
import qrcode

class Certificate(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='certificates')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='certificates')

    issued_at = models.DateTimeField(auto_now_add=True)

    # رمز تحقق عالمي
    verification_code = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)

    # صورة QR
    qr_image = models.ImageField(upload_to="certificates/qr/", null=True, blank=True)

    def generate_qr(self):
        import qrcode
        from io import BytesIO
        from django.core.files.base import ContentFile

        verify_url = f"https://your-domain.com/verify/{self.verification_code}/"
        qr = qrcode.make(verify_url)

        buffer = BytesIO()
        qr.save(buffer, format="PNG")

        file_name = f"qr_{self.verification_code}.png"
        self.qr_image.save(file_name, ContentFile(buffer.getvalue()), save=False)

    def __str__(self):
        return f"Certificate: {self.student} - {self.course.title}"

# =========================================================
#                          JOBS
# =========================================================

class JobPost(models.Model):
    company = models.ForeignKey(User, on_delete=models.CASCADE, related_name='job_posts')

    title = models.CharField(max_length=200)
    description = models.TextField()

    JOB_TYPES = [
        ('full_time', 'دوام كامل'),
        ('part_time', 'دوام جزئي'),
        ('remote', 'عن بُعد'),
        ('hybrid', 'هجين'),
    ]
    job_type = models.CharField(max_length=20, choices=JOB_TYPES)

    salary = models.CharField(max_length=100, blank=True, null=True)
    requirements = models.TextField(blank=True, null=True)
    skills = models.CharField(max_length=300, blank=True, null=True)
    location = models.CharField(max_length=200)

    is_active = models.BooleanField(default=True)
    applicants_count = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class JobApplication(models.Model):
    job = models.ForeignKey(JobPost, on_delete=models.CASCADE, related_name='applications')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='job_applications')

    cv = models.FileField(upload_to='cvs/', blank=True, null=True)
    cover_letter = models.TextField(blank=True, null=True)

    status = models.CharField(max_length=20, default='pending')
    applied_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('job', 'student')

    def __str__(self):
        return f"{self.student.username} -> {self.job.title}"


class CompanyNotificationSettings(models.Model):
    company = models.OneToOneField(User, on_delete=models.CASCADE)
    notify_new_applicant = models.BooleanField(default=True)
    notify_status_change = models.BooleanField(default=True)


class Notification(models.Model):
    company = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return self.message


# =========================================================
#                          QUIZ SYSTEM
# =========================================================

class Quiz(models.Model):
    lesson = models.OneToOneField(
        Lesson,
        on_delete=models.CASCADE,
        related_name="quiz"
    )
    title = models.CharField(max_length=255)
    pass_score = models.IntegerField(default=60)
    max_attempts = models.IntegerField(default=1)

    def __str__(self):
        return f"Quiz for: {self.lesson.title}"


class Question(models.Model):
    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        related_name="questions"
    )
    text = models.CharField(max_length=500)

    def __str__(self):
        return self.text


class Choice(models.Model):
    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        related_name="choices"
    )
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.text} ({'صح' if self.is_correct else 'خطأ'})"


UserModel = get_user_model()


class StudentQuizAttempt(models.Model):
    student = models.ForeignKey(
        UserModel,
        on_delete=models.CASCADE,
        related_name="quiz_attempts"
    )
    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        related_name="attempts"
    )
    score = models.FloatField(default=0)
    passed = models.BooleanField(default=False)
    attempt_number = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student} - {self.quiz} - محاولة {self.attempt_number}"


class LessonProgress(models.Model):
    student = models.ForeignKey(
        UserModel,
        on_delete=models.CASCADE,
        related_name="lesson_progress"
    )
    lesson = models.ForeignKey(
        Lesson,
        on_delete=models.CASCADE,
        related_name="progress"
    )
    video_watched = models.BooleanField(default=False)
    quiz_passed = models.BooleanField(default=False)
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ("student", "lesson")

    def __str__(self):
        return f"{self.student} - {self.lesson} - {'مكتمل' if self.completed else 'غير مكتمل'}"


class CourseProgress(models.Model):
    student = models.ForeignKey(
        UserModel,
        on_delete=models.CASCADE,
        related_name="course_progress"
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="progress"
    )
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ("student", "course")

    def __str__(self):
        return f"{self.student} - {self.course} - {'مكتمل' if self.completed else 'غير مكتمل'}"

class TeacherNotification(models.Model):
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name="teacher_notifications")
    title = models.CharField(max_length=255)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.teacher.email} - {self.title}"


class TeacherNotificationSettings(models.Model):
    teacher = models.OneToOneField(User, on_delete=models.CASCADE, related_name="teacher_notification_settings")
    receive_course_updates = models.BooleanField(default=True)
    receive_quiz_updates = models.BooleanField(default=True)
    receive_student_activity = models.BooleanField(default=True)

    def __str__(self):
        return f"Settings for {self.teacher.email}"

class TeacherSettings(models.Model):
    teacher = models.OneToOneField(User, on_delete=models.CASCADE, related_name="teacher_settings")

    # إعدادات الإشعارات
    notify_students = models.BooleanField(default=True)
    notify_lessons = models.BooleanField(default=True)
    notify_quizzes = models.BooleanField(default=True)

    # إعدادات النظام
    dark_mode = models.BooleanField(default=False)
    sound_enabled = models.BooleanField(default=True)

    def __str__(self):
        return f"Settings for {self.teacher.email}"




class Skill(models.Model):
    student = models.ForeignKey("StudentProfile", on_delete=models.CASCADE, related_name="cv_skills")
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Experience(models.Model):
    student = models.ForeignKey("StudentProfile", on_delete=models.CASCADE, related_name="cv_experiences")
    title = models.CharField(max_length=150)
    company = models.CharField(max_length=150)
    years = models.IntegerField(default=1)
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.title} - {self.company}"


class Project(models.Model):
    student = models.ForeignKey("StudentProfile", on_delete=models.CASCADE, related_name="cv_projects")
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    technologies = models.CharField(max_length=200)
    link = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.name


class Language(models.Model):
    student = models.ForeignKey("StudentProfile", on_delete=models.CASCADE, related_name="cv_languages")
    name = models.CharField(max_length=100)
    level = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.name} ({self.level})"
