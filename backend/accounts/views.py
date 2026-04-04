from rest_framework import generics, status
from rest_framework.views import APIView
from django.views.generic import TemplateView

from rest_framework.response import Response
from rest_framework.permissions import (
    IsAuthenticated,
    IsAdminUser,
    AllowAny
)
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.contrib.auth import get_user_model
import uuid

from rest_framework.authtoken.models import Token

from .permissions import IsTeacher, IsStudent, IsCompany

# ============================
#   MODELS (مرتّبة بدون حذف)
# ============================
from .models import (
    # اختبارات
    Quiz,
    Question,
    Choice,
    StudentQuizAttempt,

    # تقدّم الدروس والكورسات
    LessonProgress,
    CourseProgress,

    # المستخدمين والبروفايلات
    User,
    TeacherProfile,
    StudentProfile,
    CompanyProfile,

    # الكورسات والدروس
    Course,
    Lesson,
    CourseEnrollment,
    CourseReview,
    Certificate,

    # الوظائف
    JobPost,
    JobApplication,

    # الإشعارات
    CompanyNotificationSettings,
    Notification,
    TeacherNotification,
    TeacherNotificationSettings,
)

# إعادة تعريف User بشكل صحيح
User = get_user_model()

# ============================
#   SERIALIZERS
# ============================
from .serializers import (
    CourseSerializer,
    CourseDetailsSerializer,
    LessonSerializer,
    LessonProgressSerializer,
    CourseEnrollmentSerializer,
    CourseReviewSerializer,
    CertificateSerializer,
    UserRegisterSerializer,
    UserSerializer,
    StudentProfileSerializer,
    TeacherProfileSerializer,
    CompanyProfileSerializer,
    JobPostSerializer,
    JobApplicationSerializer,
    NotificationSettingsSerializer,
    NotificationSerializer,
    QuizCreateSerializer,
    QuestionStudentSerializer,
    LessonUpdateSerializer,
    QuizSerializer,
    TeacherNotificationSerializer,
    TeacherNotificationSettingsSerializer,
    TeacherSettings,
    TeacherSettingsSerializer,
)


# ---------------------------------------------------------
# 1) ADMIN APPROVAL
# ---------------------------------------------------------
class RegisterView(generics.CreateAPIView):
    serializer_class = UserRegisterSerializer
    permission_classes = [AllowAny]


class ApproveUserView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)

        if user.user_type not in ['teacher', 'company']:
            return Response({'error': 'This user does not require approval'}, status=400)

        user.is_approved = True
        user.save()

        return Response({'message': 'User approved successfully'})


# ---------------------------------------------------------
# 2) TEACHER DASHBOARD + PROFILE
# ---------------------------------------------------------

class TeacherDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def get(self, request):
        user = request.user
        profile = user.teacher_profile
        courses = Course.objects.filter(teacher=user)

        return Response({
            'teacher': UserSerializer(user, context={'request': request}).data,
            'profile': TeacherProfileSerializer(profile, context={'request': request}).data,
            'courses': CourseSerializer(courses, many=True, context={'request': request}).data
        })


class TeacherProfileView(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def get(self, request):
        user = request.user
        profile = user.teacher_profile

        return Response({
            "user": UserSerializer(user, context={'request': request}).data,
            "profile": TeacherProfileSerializer(profile, context={'request': request}).data
        })


class UpdateTeacherProfileView(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def post(self, request):
        user = request.user
        profile = user.teacher_profile

        user.full_name = request.data.get("full_name", user.full_name)
        user.save()

        profile.specialization = request.data.get("specialization", profile.specialization)
        profile.experience_years = request.data.get("experience_years", profile.experience_years)
        profile.bio = request.data.get("bio", profile.bio)

        if "photo" in request.FILES:
            profile.photo = request.FILES["photo"]

        if "cv" in request.FILES:
            profile.cv = request.FILES["cv"]

        if "certificate" in request.FILES:
            profile.certificate = request.FILES["certificate"]

        profile.save()

        return Response({
            "message": "Profile updated successfully",
            "profile": TeacherProfileSerializer(profile, context={'request': request}).data
        })

from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class CreateQuizView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = QuizCreateSerializer(data=request.data)

        if serializer.is_valid():
            quiz = serializer.save()
            return Response({"message": "تم إنشاء الاختبار بنجاح", "quiz_id": quiz.id}, status=201)

        return Response(serializer.errors, status=400)

# ---------------------------------------------------------
# 3) COURSES & LESSONS

# ---------------------------------------------------------
# 3) COURSES & LESSONS
# ---------------------------------------------------------

# تفاصيل الكورس (للطلاب)
class CourseDetailsView(generics.RetrieveAPIView):
    serializer_class = CourseDetailsSerializer
    permission_classes = [IsAuthenticated]
    queryset = Course.objects.all()   # ← أهم سطر

    def get(self, request, *args, **kwargs):
        course = self.get_object()

        # هل الطالب مسجّل؟
        enrolled = CourseEnrollment.objects.filter(student=request.user, course=course).first()

        # هل الطالب أكمل الكورس؟
        completed = False
        if enrolled:
            completed = enrolled.progress_percentage == 100

        # هل لديه شهادة؟
        cert = Certificate.objects.filter(student=request.user, course=course).exists()

        data = CourseDetailsSerializer(course, context={"request": request}).data
        data["is_enrolled"] = enrolled is not None
        data["is_completed"] = completed
        data["has_certificate"] = cert
        data["progress_percentage"] = enrolled.progress_percentage if enrolled else 0

        return Response(data)


# إنشاء درس (للمدرّس)
class CreateLessonView(generics.CreateAPIView):
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated, IsTeacher]


# قائمة الكورسات العامة
class CourseListView(generics.ListAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer


# تسجيل الطالب في الكورس
class EnrollCourseView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def post(self, request, course_id):
        user = request.user
        course = get_object_or_404(Course, id=course_id)

        if CourseEnrollment.objects.filter(student=user, course=course).exists():
            return Response({'error': 'Already enrolled'}, status=400)

        CourseEnrollment.objects.create(student=user, course=course)
        return Response({'message': 'Enrolled successfully'})


# كورسات الطالب
class MyCoursesView(generics.ListAPIView):
    serializer_class = CourseEnrollmentSerializer
    permission_classes = [IsAuthenticated, IsStudent]

    def get_queryset(self):
        return CourseEnrollment.objects.filter(student=self.request.user)


# إضافة تقييم للكورس
class AddCourseReviewView(generics.CreateAPIView):
    serializer_class = CourseReviewSerializer
    permission_classes = [IsAuthenticated, IsStudent]

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)


# بحث الكورسات للطالب
class StudentCoursesView(generics.ListAPIView):
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated, IsStudent]

    def get_queryset(self):
        queryset = Course.objects.all()
        keyword = self.request.query_params.get("keyword")
        price = self.request.query_params.get("price")
        level = self.request.query_params.get("level")

        if keyword:
            queryset = queryset.filter(title__icontains=keyword)
        if price == "free":
            queryset = queryset.filter(price=0)
        elif price == "paid":
            queryset = queryset.filter(price__gt=0)
        if level:
            queryset = queryset.filter(level=level)

        return queryset


# ---------------------------------------------------------
# دروس الكورس
# ---------------------------------------------------------

# جلب الدروس داخل الكورس
class CompleteLessonView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, lesson_id):
        lesson = get_object_or_404(Lesson, id=lesson_id)
        student = request.user

        # إكمال الدرس
        progress, created = LessonProgress.objects.get_or_create(
            student=student,
            lesson=lesson
        )
        progress.completed = True
        progress.save()

        # تحديث التقدم + إنشاء الشهادة إذا اكتمل الكورس
        self.update_course_progress(student, lesson.course)

        return Response({"message": "تم إكمال الدرس بنجاح"})

    def update_course_progress(self, student, course):
        total = course.lessons.count()
        completed = LessonProgress.objects.filter(
            student=student,
            lesson__course=course,
            completed=True
        ).count()

        percentage = (completed / total) * 100 if total > 0 else 0

        enrollment, _ = CourseEnrollment.objects.get_or_create(
            student=student,
            course=course
        )

        enrollment.progress_percentage = percentage
        enrollment.save()

        # 🔥 إنشاء الشهادة عند اكتمال الكورس
        if percentage == 100:
            cert, created = Certificate.objects.get_or_create(
                student=student,
                course=course
            )
            if created:
                cert.generate_qr()
                cert.save()

# ---------------------------------------------------------
# 4) CERTIFICATES
# ---------------------------------------------------------

class GenerateCertificateView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def post(self, request, course_id):
        user = request.user
        course = get_object_or_404(Course, id=course_id)

        if not CourseEnrollment.objects.filter(student=user, course=course).exists():
            return Response({'error': 'Student not enrolled in this course'}, status=400)

        cert, created = Certificate.objects.get_or_create(
            student=user,
            course=course,
            defaults={'verification_code': str(uuid.uuid4())}
        )

        return Response(CertificateSerializer(cert, context={'request': request}).data)

# ---------------------------------------------------------
# 5) COMPANY & JOBS
# ---------------------------------------------------------

class CompanyDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsCompany]

    def get(self, request):
        user = request.user
        profile = user.company_profile
        jobs = JobPost.objects.filter(company=user)

        return Response({
            'company': CompanyProfileSerializer(profile, context={'request': request}).data,
            'jobs': JobPostSerializer(jobs, many=True, context={'request': request}).data
        })


class CreateJobPostView(generics.CreateAPIView):
    serializer_class = JobPostSerializer
    permission_classes = [IsAuthenticated, IsCompany]


class JobListView(generics.ListAPIView):
    queryset = JobPost.objects.filter(is_active=True)
    serializer_class = JobPostSerializer


class JobDetailView(generics.RetrieveAPIView):
    queryset = JobPost.objects.all()
    serializer_class = JobPostSerializer
    lookup_field = 'id'

class ApplyJobView(generics.CreateAPIView):
    serializer_class = JobApplicationSerializer
    permission_classes = [IsAuthenticated, IsStudent]


class MyJobApplicationsView(generics.ListAPIView):
    serializer_class = JobApplicationSerializer
    permission_classes = [IsAuthenticated, IsStudent]

    def get_queryset(self):
        return JobApplication.objects.filter(student=self.request.user)

class JobDetailUpdateView(generics.RetrieveUpdateAPIView):
    queryset = JobPost.objects.all()
    serializer_class = JobPostSerializer
    permission_classes = [IsAuthenticated, IsCompany]
    lookup_field = 'id'

    def get_queryset(self):
        # الشركة لا يمكنها تعديل وظائف شركات أخرى
        return JobPost.objects.filter(company=self.request.user)

class JobDeleteView(generics.DestroyAPIView):
    queryset = JobPost.objects.all()
    permission_classes = [IsAuthenticated, IsCompany]
    lookup_field = 'id'

    def get_queryset(self):
        return JobPost.objects.filter(company=self.request.user)

class JobApplicantsListView(generics.ListAPIView):
    serializer_class = JobApplicationSerializer
    permission_classes = [IsAuthenticated, IsCompany]

    def get_queryset(self):
        job_id = self.kwargs.get('job_id')
        return JobApplication.objects.filter(job__id=job_id, job__company=self.request.user)

class JobApplicationStatusUpdateView(generics.UpdateAPIView):
    serializer_class = JobApplicationSerializer
    permission_classes = [IsAuthenticated, IsCompany]
    queryset = JobApplication.objects.all()
    lookup_field = 'id'

    def get_queryset(self):
        return JobApplication.objects.filter(job__company=self.request.user)

class CompanyJobsListView(generics.ListAPIView):
    serializer_class = JobPostSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return JobPost.objects.filter(company=self.request.user)

class CompanyChangePasswordView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated, IsCompany]

    def update(self, request, *args, **kwargs):
        user = request.user
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")

        if not user.check_password(old_password):
            return Response({"error": "كلمة المرور الحالية غير صحيحة"}, status=400)

        user.set_password(new_password)
        user.save()

        return Response({"message": "تم تغيير كلمة المرور بنجاح"})

class CompanyNotificationSettingsView(generics.UpdateAPIView):
    serializer_class = NotificationSettingsSerializer
    permission_classes = [IsAuthenticated, IsCompany]

    def get_object(self):
        settings, created = CompanyNotificationSettings.objects.get_or_create(company=self.request.user)
        return settings

class CompanyNotificationsView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated, IsCompany]

    def get_queryset(self):
        return Notification.objects.filter(company=self.request.user).order_by('-created_at')

# ---------------------------------------------------------
# 6) CUSTOM REGISTRATION (NO TOKEN REQUIRED)
# ---------------------------------------------------------

class StudentRegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data

        user = User.objects.create_user(
            username=data['email'],
            email=data['email'],
            password=data['password'],
            user_type='student',
            is_approved=True
        )

        StudentProfile.objects.create(
            user=user,
            full_name=data['full_name'],
            age=data['age'],
            education_level=data['education_level'],
            country=data['country'],
            phone=data.get('phone', '')
        )

        return Response({"status": "success", "message": "Student registered successfully"})


class StudentProfileView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request):
        profile = request.user.student_profile
        return Response({
            "profile": StudentProfileSerializer(profile, context={'request': request}).data
        })

class UpdateStudentProfileView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def put(self, request):
        user = request.user
        profile = user.student_profile

        profile.full_name = request.data.get("full_name", profile.full_name)
        profile.age = request.data.get("age", profile.age)
        profile.education_level = request.data.get("education_level", profile.education_level)
        profile.country = request.data.get("country", profile.country)
        profile.phone = request.data.get("phone", profile.phone)

        profile.save()

        return Response({
            "message": "Student profile updated successfully",
            "profile": StudentProfileSerializer(profile, context={'request': request}).data
        })


class TeacherRegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data

        user = User.objects.create_user(
            username=data['email'],
            email=data['email'],
            password=data['password'],
            user_type='teacher',
            is_approved=False
        )

        TeacherProfile.objects.create(
            user=user,
            specialization=data['specialization'],
            experience_years=data['experience_years'],
            bio=data['bio'],
            certificate=request.FILES['certificate'],
            cv=request.FILES['cv'],
            photo=request.FILES.get('photo')
        )

        return Response({"status": "success", "message": "Teacher registered successfully"})


class CompanyRegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data

        user = User.objects.create_user(
            username=data['email'],
            email=data['email'],
            password=data['password'],
            user_type='company',
            is_approved=False
        )

        CompanyProfile.objects.create(
            user=user,
            company_name=data['company_name'],
            industry=data['industry'],
            size=data['size'],
            phone=data['phone'],
            location=data['location'],
            website=data.get('website'),
            license=request.FILES['license'],
            certificate=request.FILES['certificate'],
            logo=request.FILES.get('logo')
        )

        return Response({"status": "success", "message": "Company registered successfully"})

class CompanyProfileView(APIView):
    permission_classes = [IsAuthenticated, IsCompany]

    def get(self, request):
        profile = request.user.company_profile
        return Response({
            "profile": CompanyProfileSerializer(profile, context={'request': request}).data
        })
class UpdateCompanyProfileView(APIView):
    permission_classes = [IsAuthenticated, IsCompany]

    def put(self, request):
        profile = request.user.company_profile

        profile.company_name = request.data.get("company_name", profile.company_name)
        profile.industry = request.data.get("industry", profile.industry)
        profile.size = request.data.get("size", profile.size)
        profile.phone = request.data.get("phone", profile.phone)
        profile.location = request.data.get("location", profile.location)
        profile.website = request.data.get("website", profile.website)

        if "logo" in request.FILES:
            profile.logo = request.FILES["logo"]

        if "certificate" in request.FILES:
            profile.certificate = request.FILES["certificate"]

        if "license" in request.FILES:
            profile.license = request.FILES["license"]

        profile.save()

        return Response({
            "message": "Company profile updated successfully",
            "profile": CompanyProfileSerializer(profile, context={'request': request}).data
        })

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "Invalid email"}, status=400)

        if not user.check_password(password):
            return Response({"error": "Invalid password"}, status=400)

        token, _ = Token.objects.get_or_create(user=user)

        return Response({
            "token": token.key,
            "user_type": user.user_type,
            "is_approved": user.is_approved
        })

class TeacherLessonsListView(generics.ListAPIView):
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated, IsTeacher]

    def get_queryset(self):
        return Lesson.objects.filter(course__teacher=self.request.user).order_by("order_index")

    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated, IsTeacher]

    def get_queryset(self):
        return Lesson.objects.filter(course__teacher=self.request.user).order_by("order_index")
class CreateLessonView(generics.CreateAPIView):
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated, IsTeacher]

    def perform_create(self, serializer):
        serializer.save()

class LessonDetailView(generics.RetrieveAPIView):
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated, IsTeacher]
    queryset = Lesson.objects.all()
    lookup_field = "id"


class UpdateLessonView(generics.UpdateAPIView):
    serializer_class = LessonUpdateSerializer
    permission_classes = [IsAuthenticated, IsTeacher]
    queryset = Lesson.objects.all()
    lookup_field = "id"
  
class DeleteLessonView(generics.DestroyAPIView):
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated, IsTeacher]
    queryset = Lesson.objects.all()
    lookup_field = "id"

class TeacherCoursesListView(generics.ListAPIView):
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated, IsTeacher]

    def get_queryset(self):
        return Course.objects.filter(teacher=self.request.user)

class CreateCourseView(generics.CreateAPIView):
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated, IsTeacher]

    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)

class TeacherCourseDetailView(generics.RetrieveAPIView):
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated, IsTeacher]
    lookup_field = "id"

    def get_queryset(self):
        return Course.objects.filter(teacher=self.request.user)

class UpdateCourseView(generics.UpdateAPIView):
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated, IsTeacher]
    lookup_field = "id"

    def get_queryset(self):
        return Course.objects.filter(teacher=self.request.user)

class DeleteCourseView(generics.DestroyAPIView):
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated, IsTeacher]
    lookup_field = "id"

    def get_queryset(self):
        return Course.objects.filter(teacher=self.request.user)
    
class CourseLessonsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):
        course = get_object_or_404(Course, id=course_id)

        # الطالب يجب أن يكون مسجلاً
        if request.user.user_type == "student":
            enrolled = CourseEnrollment.objects.filter(student=request.user, course=course).exists()
            if not enrolled:
                return Response({"detail": "أنت لست مسجلاً في هذا الكورس"}, status=403)

        # المدرّس يجب أن يكون صاحب الكورس
        if request.user.user_type == "teacher" and course.teacher != request.user:
            return Response({"detail": "أنت لست صاحب هذا الكورس"}, status=403)

        lessons = Lesson.objects.filter(course=course).order_by("order_index")
        serializer = LessonSerializer(lessons, many=True, context={"request": request})

        # حالة الشهادة
        cert = Certificate.objects.filter(student=request.user, course=course).first()

        return Response({
            "course_id": course.id,
            "course_title": course.title,
            "lessons": serializer.data,
            "certificate_available": cert is not None
        })

# ============================================
# 7) QUIZ SYSTEM (Teacher + Student)
# ============================================
# ---------------------------------------------------------
# 1) إنشاء اختبار (Teacher)
# ---------------------------------------------------------
class CreateQuizView(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def post(self, request):
        serializer = QuizCreateSerializer(data=request.data)

        if serializer.is_valid():
            quiz = serializer.save()
            return Response({"message": "تم إنشاء الاختبار بنجاح", "quiz_id": quiz.id}, status=201)

        return Response(serializer.errors, status=400)


# ---------------------------------------------------------
# 2) جلب اختبار واحد للمدرّس (لصفحة quiz-manage.html)
# ---------------------------------------------------------
class GetQuizForTeacherView(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def get(self, request, quiz_id):
        quiz = get_object_or_404(Quiz, id=quiz_id)

        data = QuizSerializer(quiz, context={"request": request}).data
        return Response(data)


# ---------------------------------------------------------
# 3) تحديث اختبار (Teacher)
# ---------------------------------------------------------
class UpdateQuizView(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def put(self, request, quiz_id):
        quiz = get_object_or_404(Quiz, id=quiz_id)

        quiz.title = request.data.get("title", quiz.title)
        quiz.description = request.data.get("description", quiz.description)
        quiz.pass_score = request.data.get("pass_score", quiz.pass_score)
        quiz.max_attempts = request.data.get("max_attempts", quiz.max_attempts)

        quiz.save()

        return Response({"message": "تم تحديث الاختبار بنجاح"})


# ---------------------------------------------------------
# 4) حذف اختبار (Teacher)
# ---------------------------------------------------------
class DeleteQuizView(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def delete(self, request, quiz_id):
        quiz = get_object_or_404(Quiz, id=quiz_id)
        quiz.delete()
        return Response({"message": "تم حذف الاختبار"})


# ---------------------------------------------------------
# 5) جلب اختبارات كورس معيّن (Teacher)
# ---------------------------------------------------------
class TeacherCourseQuizzesView(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def get(self, request, course_id):
        quizzes = Quiz.objects.filter(lesson__course_id=course_id)
        serializer = QuizSerializer(quizzes, many=True)
        return Response(serializer.data)


# ---------------------------------------------------------
# 6) إنشاء سؤال (Teacher)
# ---------------------------------------------------------
class CreateQuestionView(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def post(self, request):
        quiz_id = request.data.get("quiz_id")
        text = request.data.get("text")

        quiz = get_object_or_404(Quiz, id=quiz_id)

        question = Question.objects.create(
            quiz=quiz,
            text=text
        )

        return Response({
            "message": "تم إنشاء السؤال",
            "question_id": question.id
        }, status=201)


# ---------------------------------------------------------
# 7) جلب سؤال واحد (Teacher)
# ---------------------------------------------------------
class GetQuestionView(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def get(self, request, question_id):
        question = get_object_or_404(Question, id=question_id)

        data = {
            "id": question.id,
            "text": question.text,
            "choices": [
                {
                    "id": c.id,
                    "text": c.text,
                    "is_correct": c.is_correct
                }
                for c in question.choices.all()
            ]
        }

        return Response(data)


# ---------------------------------------------------------
# 8) تعديل سؤال (Teacher)
# ---------------------------------------------------------
class UpdateQuestionView(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def put(self, request, question_id):
        question = get_object_or_404(Question, id=question_id)

        question.text = request.data.get("text", question.text)
        question.save()

        return Response({"message": "تم تحديث السؤال"})


# ---------------------------------------------------------
# 9) حذف سؤال (Teacher)
# ---------------------------------------------------------
class DeleteQuestionView(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def delete(self, request, question_id):
        question = get_object_or_404(Question, id=question_id)
        question.delete()
        return Response({"message": "تم حذف السؤال"})


# ---------------------------------------------------------
# 10) إنشاء خيار (Teacher)
# ---------------------------------------------------------
class CreateChoiceView(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def post(self, request):
        question_id = request.data.get("question_id")
        text = request.data.get("text")

        question = get_object_or_404(Question, id=question_id)

        choice = Choice.objects.create(
            question=question,
            text=text,
            is_correct=False
        )

        return Response({
            "message": "تم إنشاء الخيار",
            "choice_id": choice.id
        }, status=201)


# ---------------------------------------------------------
# 11) تعديل خيار (Teacher)
# ---------------------------------------------------------
class UpdateChoiceView(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def put(self, request, choice_id):
        choice = get_object_or_404(Choice, id=choice_id)

        choice.text = request.data.get("text", choice.text)
        choice.save()

        return Response({"message": "تم تحديث الخيار"})


# ---------------------------------------------------------
# 12) حذف خيار (Teacher)
# ---------------------------------------------------------
class DeleteChoiceView(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def delete(self, request, choice_id):
        choice = get_object_or_404(Choice, id=choice_id)
        choice.delete()
        return Response({"message": "تم حذف الخيار"})


# ---------------------------------------------------------
# 13) تعيين خيار كإجابة صحيحة (Teacher)
# ---------------------------------------------------------
class SetCorrectChoiceView(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def post(self, request, choice_id):
        choice = get_object_or_404(Choice, id=choice_id)

        # إزالة الإجابة الصحيحة من بقية الخيارات
        Choice.objects.filter(question=choice.question).update(is_correct=False)

        # تعيين هذا الخيار كإجابة صحيحة
        choice.is_correct = True
        choice.save()

        return Response({"message": "تم تعيين الإجابة الصحيحة"})


# ---------------------------------------------------------
# 14) جلب اختبار للطالب (بدون الإجابات الصحيحة)
# ---------------------------------------------------------
class GetQuizView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request, lesson_id):
        try:
            quiz = Quiz.objects.get(lesson_id=lesson_id)
        except Quiz.DoesNotExist:
            return Response({"error": "لا يوجد اختبار لهذا الدرس"}, status=404)

        attempts = StudentQuizAttempt.objects.filter(
            student=request.user,
            quiz=quiz
        ).count()

        remaining_attempts = quiz.max_attempts - attempts

        data = {
            "quiz_id": quiz.id,
            "title": quiz.title,
            "pass_score": quiz.pass_score,
            "remaining_attempts": remaining_attempts,
            "questions": QuestionStudentSerializer(quiz.questions.all(), many=True).data
        }

        return Response(data, status=200)


# ---------------------------------------------------------
# 15) حل الاختبار (Student)
# ---------------------------------------------------------
class SubmitQuizView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def post(self, request, quiz_id):
        try:
            quiz = Quiz.objects.get(id=quiz_id)
        except Quiz.DoesNotExist:
            return Response({"error": "الاختبار غير موجود"}, status=404)

        answers = request.data.get("answers", [])

        attempts_count = StudentQuizAttempt.objects.filter(
            student=request.user,
            quiz=quiz
        ).count()

        if attempts_count >= quiz.max_attempts:
            return Response({"error": "انتهت عدد المحاولات المسموحة"}, status=403)

        correct_count = 0
        total_questions = quiz.questions.count()

        for ans in answers:
            question_id = ans.get("question")
            choice_id = ans.get("choice")

            try:
                choice = Choice.objects.get(id=choice_id, question_id=question_id)
                if choice.is_correct:
                    correct_count += 1
            except Choice.DoesNotExist:
                pass

        score = (correct_count / total_questions) * 100
        passed = score >= quiz.pass_score

        attempt = StudentQuizAttempt.objects.create(
            student=request.user,
            quiz=quiz,
            score=score,
            passed=passed,
            attempt_number=attempts_count + 1
        )

        # تحديث تقدم الدرس
        progress, _ = LessonProgress.objects.get_or_create(
            student=request.user,
            lesson=quiz.lesson
        )

        if passed:
            progress.quiz_passed = True

        if progress.video_watched or quiz.lesson.content_type != "video":
            if progress.quiz_passed:
                progress.completed = True
                progress.completed_at = timezone.now()

        progress.save()

        # تحديث تقدم الكورس
        course = quiz.lesson.course
        lessons = course.lessons.all()

        all_completed = True
        for lesson in lessons:
            lp = LessonProgress.objects.filter(student=request.user, lesson=lesson).first()
            if not lp or not lp.completed:
                all_completed = False
                break

        if all_completed:
            cp, _ = CourseProgress.objects.get_or_create(
                student=request.user,
                course=course
            )
            cp.completed = True
            cp.completed_at = timezone.now()
            cp.save()

            # 🔥 إنشاء الشهادة
            from .models import Certificate

            cert, created = Certificate.objects.get_or_create(
                student=request.user,
                course=course
            )

            if created or not cert.qr_image:
                cert.generate_qr()
                cert.save()

        return Response({
            "score": score,
            "passed": passed,
            "attempt_number": attempt.attempt_number,
            "remaining_attempts": quiz.max_attempts - attempt.attempt_number
        }, status=200)

class TeacherNotificationsView(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def get(self, request):
        notifications = TeacherNotification.objects.filter(teacher=request.user).order_by("-created_at")
        serializer = TeacherNotificationSerializer(notifications, many=True)
        return Response(serializer.data)

class ClearTeacherNotificationsView(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def delete(self, request):
        TeacherNotification.objects.filter(teacher=request.user).delete()
        return Response({"message": "تم مسح جميع الإشعارات"})

class TeacherNotificationSettingsView(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def get(self, request):
        settings, _ = TeacherNotificationSettings.objects.get_or_create(teacher=request.user)
        serializer = TeacherNotificationSettingsSerializer(settings)
        return Response(serializer.data)

    def put(self, request):
        settings, _ = TeacherNotificationSettings.objects.get_or_create(teacher=request.user)
        serializer = TeacherNotificationSettingsSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

class TeacherSettingsView(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def get(self, request):
        settings, _ = TeacherSettings.objects.get_or_create(teacher=request.user)
        serializer = TeacherSettingsSerializer(settings)
        return Response(serializer.data)
    def put(self, request):
        settings, _ = TeacherSettings.objects.get_or_create(teacher=request.user)
        serializer = TeacherSettingsSerializer(settings, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)


class StudentLessonDetailView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request, lesson_id):
        lesson = get_object_or_404(Lesson, id=lesson_id)

        # الطالب يجب أن يكون مسجلاً بالكورس
        enrolled = CourseEnrollment.objects.filter(
            student=request.user,
            course=lesson.course
        ).exists()

        if not enrolled:
            return Response({"detail": "أنت لست مسجلاً في هذا الكورس"}, status=403)

        return Response({
            "id": lesson.id,
            "title": lesson.title,
            "content": lesson.content,
            "video": lesson.video.url if lesson.video else None,
            "course": lesson.course.id
        })

class CertificateVerifyView(TemplateView):
    template_name = "certificate_verify.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        code = kwargs.get("code")

        cert = get_object_or_404(Certificate, verification_code=code)

        context["student"] = cert.student.get_full_name() or cert.student.username
        context["course"] = cert.course.title
        context["issued_at"] = cert.issued_at
        context["valid"] = True
        return context


class CertificateDetailAPI(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request, course_id):
        cert = Certificate.objects.filter(student=request.user, course_id=course_id).first()

        if not cert:
            return Response({"error": "Certificate not found"}, status=404)

        return Response({
            "student_name": cert.student.student_profile.full_name,
            "course_title": cert.course.title,
            "verification_code": cert.verification_code,
            "qr_image": request.build_absolute_uri(cert.qr_image.url) if cert.qr_image else None,
            "issued_at": cert.issued_at.strftime("%Y-%m-%d"),
        })
    
class StudentCertificatesAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        certificates = Certificate.objects.filter(student=request.user)
        serializer = CertificateSerializer(certificates, many=True)
        return Response(serializer.data)

class CertificatesCountAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        count = Certificate.objects.filter(student=request.user).count()
        return Response({"count": count})
