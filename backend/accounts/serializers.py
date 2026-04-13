from rest_framework import serializers
from django.conf import settings

from .models import (
    TeacherProfile,
    CompanyProfile,
    StudentProfile,
    Course,
    Lesson,
    CourseEnrollment,
    LessonProgress,
    CourseReview,
    Certificate,
    JobPost,
    JobApplication,
    CompanyNotificationSettings,
    Notification,
    TeacherNotification,
    TeacherNotificationSettings,
    TeacherSettings,
    Choice,
     Question,
      Quiz,
      Skill,
      Project,
      Experience,
      Language,
)


# =========================================================
from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'username', 'first_name', 'last_name', 'email',
            'password', 'password_confirm', 'user_type'
        ]

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords do not match")

        if data['user_type'] not in ['student', 'teacher', 'company', 'admin']:
            raise serializers.ValidationError("Invalid user type")

        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')

        user = User(**validated_data)
        user.set_password(password)

        # الطلاب يتم قبولهم مباشرة
        if user.user_type == 'student':
            user.is_approved = True

        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'first_name', 'last_name',
            'email', 'user_type', 'is_approved'
        ]

# =========================================================
#                     TEACHER PROFILE
# =========================================================

class TeacherProfileSerializer(serializers.ModelSerializer):
    photo = serializers.SerializerMethodField()
    cv = serializers.SerializerMethodField()
    certificate = serializers.SerializerMethodField()

    class Meta:
        model = TeacherProfile
        fields = [
            'specialization',
            'experience_years',
            'bio',
            'certificate',
            'cv',
            'photo',
            'rating_avg',
            'balance'
        ]

    def get_photo(self, obj):
        return self.context['request'].build_absolute_uri(obj.photo.url) if obj.photo else None

    def get_cv(self, obj):
        return self.context['request'].build_absolute_uri(obj.cv.url) if obj.cv else None

    def get_certificate(self, obj):
        return self.context['request'].build_absolute_uri(obj.certificate.url) if obj.certificate else None


# =========================================================
#                     STUDENT PROFILE
# =========================================================
class StudentProfileSerializer(serializers.ModelSerializer):
    email = serializers.CharField(source="user.email", read_only=True)

    class Meta:
        model = StudentProfile
        fields = [
            "full_name", "age", "education_level", "country", "phone", "photo",
            "email",
            "objective", "skills", "experience", "projects", "languages", "certifications"
        ]

# =========================================================
#                     COMPANY PROFILE
# =========================================================
class CompanyProfileSerializer(serializers.ModelSerializer):
    logo = serializers.SerializerMethodField()
    certificate = serializers.SerializerMethodField()
    license = serializers.SerializerMethodField()

    class Meta:
        model = CompanyProfile
        fields = [
            'company_name',
            'industry',
            'size',
            'phone',
            'location',
            'website',
            'logo',
            'certificate',
            'license'
        ]

    def get_logo(self, obj):
        return self.context['request'].build_absolute_uri(obj.logo.url) if obj.logo else None

    def get_certificate(self, obj):
        return self.context['request'].build_absolute_uri(obj.certificate.url) if obj.certificate else None

    def get_license(self, obj):
        return self.context['request'].build_absolute_uri(obj.license.url) if obj.license else None

# =========================================================
#                     COURSES & LESSONS
# =========================================================
class CourseSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source="teacher.username", read_only=True)
    lessons_count = serializers.SerializerMethodField()
    quizzes_count = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            "id", "title", "description", "price",
            "level", "duration", "image",
            "teacher_name", "lessons_count", "quizzes_count"
        ]

    def get_lessons_count(self, obj):
        return obj.lessons.count()

    def get_quizzes_count(self, obj):
        return Quiz.objects.filter(lesson__course=obj).count()

    def get_image(self, obj):
        request = self.context.get("request")
        if obj.image:
            return request.build_absolute_uri(obj.image.url)
        return None

class CourseDetailsSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source="teacher.username", read_only=True)
    is_enrolled = serializers.SerializerMethodField()
    progress = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            "id", "title", "description", "price", "level",
            "duration", "image", "teacher_name",
            "is_enrolled", "progress"
        ]

    def get_is_enrolled(self, obj):
        user = self.context["request"].user
        return CourseEnrollment.objects.filter(student=user, course=obj).exists()

    def get_progress(self, obj):
        user = self.context["request"].user
        enrollment = CourseEnrollment.objects.filter(student=user, course=obj).first()
        return enrollment.progress_percentage if enrollment else 0

class LessonSerializer(serializers.ModelSerializer):
    completed = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = [
            "id",
            "course",
            "title",
            "content_type",
            "content",
            "video",
            "file",
            "external_url",
            "order_index",
            "completed",
        ]

    def get_completed(self, obj):
        request = self.context.get("request")
        if not request:
            return False

        user = request.user
        progress = LessonProgress.objects.filter(student=user, lesson=obj).first()
        return progress.completed if progress else False


class LessonUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = [
            "title",
            "content_type",
            "content",
            "video",
            "file",
            "external_url",
            "order_index",
        ]





class CourseEnrollmentSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)

    class Meta:
        model = CourseEnrollment
        fields = ["course", "progress_percentage", "enrolled_at"]
   
class CourseReviewSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.username", read_only=True)

    class Meta:
        model = CourseReview
        fields = ["id", "student_name", "rating", "comment", "created_at"]
class CertificateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certificate
        fields = ["id", "student", "course", "issued_at", "verification_code"]

class LessonProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonProgress
        fields = [
            "id",
            "student",
            "lesson",
            "video_watched",
            "quiz_passed",
            "completed",
            "completed_at",
        ]
        read_only_fields = ["student", "lesson", "completed", "completed_at"]

class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ["id", "text", "is_correct"]
        extra_kwargs = {
            "is_correct": {"write_only": True}  # ما نعرض الصح/خطأ للطالب
        }


class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True)

    class Meta:
        model = Question
        fields = ["id", "text", "choices"]


class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True)

    class Meta:
        model = Quiz
        fields = ["id", "lesson", "title", "pass_score", "max_attempts", "questions"]

    def create(self, validated_data):
        questions_data = validated_data.pop("questions", [])
        quiz = Quiz.objects.create(**validated_data)

        for q_data in questions_data:
            choices_data = q_data.pop("choices", [])
            question = Question.objects.create(quiz=quiz, **q_data)
            for c_data in choices_data:
                Choice.objects.create(question=question, **c_data)

        return quiz

#                     JOBS & APPLICATIONS
# =========================================================
class JobPostSerializer(serializers.ModelSerializer):
    company_name = serializers.SerializerMethodField()
    requirements = serializers.SerializerMethodField()

    class Meta:
        model = JobPost
        fields = [
            'id',
            'title',
            'description',
            'job_type',
            'salary',
            'requirements',   # هنا
            'location',
            'skills',
            'is_active',
            'created_at',
            'company_name'
        ]

    def get_company_name(self, obj):
        if hasattr(obj.company, "company_profile"):
            return obj.company.company_profile.company_name
        return obj.company.username

    def get_requirements(self, obj):
        # لو القيمة None أو فاضية يرجّع نص فاضي بدل null
        return obj.requirements or ""

class JobApplicationSerializer(serializers.ModelSerializer):
    job_id = serializers.IntegerField(source="job.id", read_only=True)
    job_title = serializers.CharField(source="job.title", read_only=True)
    company_name = serializers.CharField(
        source="job.company.company_profile.company_name",
        read_only=True
    )

    match_score = serializers.IntegerField(read_only=True)
    missing_skills = serializers.ListField(child=serializers.CharField(), read_only=True)

    class Meta:
        model = JobApplication
        fields = [
            "id",
            "job_id",
            "job_title",
            "company_name",
            "status",
            "applied_at",
            "match_score",
            "missing_skills",
        ]



class NotificationSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyNotificationSettings
        fields = ['notify_new_applicant', 'notify_status_change']


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'message', 'created_at', 'is_read']


class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ["text", "is_correct"]


class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True)

    class Meta:
        model = Question
        fields = ["text", "choices"]


class QuizCreateSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True)

    class Meta:
        model = Quiz
        fields = ["lesson", "title", "pass_score", "max_attempts", "questions"]

    def create(self, validated_data):
        questions_data = validated_data.pop("questions")
        quiz = Quiz.objects.create(**validated_data)

        for q_data in questions_data:
            choices_data = q_data.pop("choices")
            question = Question.objects.create(quiz=quiz, **q_data)

            for c_data in choices_data:
                Choice.objects.create(question=question, **c_data)

        return quiz

class ChoiceStudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ["id", "text"]  # بدون is_correct
        

class QuestionStudentSerializer(serializers.ModelSerializer):
    choices = ChoiceStudentSerializer(many=True)

    class Meta:
        model = Question
        fields = ["id", "text", "choices"]

class TeacherNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeacherNotification
        fields = "__all__"


class TeacherNotificationSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeacherNotificationSettings
        fields = "__all__"


class TeacherSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeacherSettings
        fields = "__all__"


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ["id", "name"]


class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = ["id", "title", "company", "years", "description"]


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ["id", "name", "description", "technologies", "link"]

class LanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Language
        fields = ["id", "name", "level"]

class StudentFullCVSerializer(serializers.ModelSerializer):
    skills = SkillSerializer(many=True, read_only=True)
    experiences = ExperienceSerializer(many=True, read_only=True)
    projects = ProjectSerializer(many=True, read_only=True)
    languages = LanguageSerializer(many=True, read_only=True)

    class Meta:
        model = StudentProfile
        fields = [
            "full_name",
            "age",
            "country",
            "phone",
            "education_level",
            "objective",
            "photo",
            "skills",
            "experiences",
            "projects",
            "languages",
        ]
