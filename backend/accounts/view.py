from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import (
    IsAuthenticated,
    IsAdminUser,
    AllowAny
)
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
import uuid

# Permissions
from .permissions import IsTeacher, IsStudent, IsCompany

# Models
from .models import (
    User,
    TeacherProfile,
    StudentProfile,
    CompanyProfile,

    Course,
    Lesson,
    CourseEnrollment,
    CourseReview,
    Certificate,

    Quiz,
    Question,
    Choice,
    StudentQuizAttempt,

    LessonProgress,
    CourseProgress,

    JobPost,
    JobApplication,
    CompanyNotificationSettings,
    Notification,
)

User = get_user_model()

# Serializers
from .serializers import (
    UserRegisterSerializer,
    UserSerializer,

    StudentProfileSerializer,
    TeacherProfileSerializer,
    CompanyProfileSerializer,

    CourseSerializer,
    CourseDetailsSerializer,
    CourseEnrollmentSerializer,
    CourseReviewSerializer,

    LessonSerializer,
    LessonUpdateSerializer,

    CertificateSerializer,

    QuizSerializer,
    QuizCreateSerializer,
    QuestionStudentSerializer,

    JobPostSerializer,
    JobApplicationSerializer,
    NotificationSettingsSerializer,
    NotificationSerializer,
)
# ============================================
# 1) AUTHENTICATION & REGISTRATION
# ============================================

class RegisterView(generics.CreateAPIView):
    serializer_class = UserRegisterSerializer
    permission_classes = [AllowAny]


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
# ============================================
# 2) STUDENT PROFILE
# ============================================

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
        profile = request.user.student_profile

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
# ============================================
# 3) TEACHER PROFILE
# ============================================

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
# ============================================
# 5) COURSES (Teacher + Student)
# ============================================

# قائمة الكورسات العامة (للجميع)
class CourseListView(generics.ListAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [AllowAny]


# تفاصيل الكورس (للطلاب)
class CourseDetailsView(generics.RetrieveAPIView):
    serializer_class = CourseDetailsSerializer
    permission_classes = [IsAuthenticated]
    queryset = Course.objects.all()
    lookup_field = "id"
    lookup_url_kwarg = "course_id"

# إنشاء كورس (للمدرّس)
class CreateCourseView(generics.CreateAPIView):
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated, IsTeacher]

    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)


# قائمة كورسات المدرّس
class TeacherCoursesListView(generics.ListAPIView):
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated, IsTeacher]

    def get_queryset(self):
        return Course.objects.filter(teacher=self.request.user)


# تفاصيل كورس المدرّس
class TeacherCourseDetailView(generics.RetrieveAPIView):
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated, IsTeacher]
    lookup_field = "id"

    def get_queryset(self):
        return Course.objects.filter(teacher=self.request.user)


# تعديل كورس
class UpdateCourseView(generics.UpdateAPIView):
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated, IsTeacher]
    lookup_field = "id"

    def get_queryset(self):
        return Course.objects.filter(teacher=self.request.user)


# حذف كورس
class DeleteCourseView(generics.DestroyAPIView):
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated, IsTeacher]
    lookup_field = "id"

    def get_queryset(self):
        return Course.objects.filter(teacher=self.request.user)
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
class MyCoursesView(generics.ListAPIView):
    serializer_class = CourseEnrollmentSerializer
    permission_classes = [IsAuthenticated, IsStudent]

    def get_queryset(self):
        return CourseEnrollment.objects.filter(student=self.request.user)
class AddCourseReviewView(generics.CreateAPIView):
    serializer_class = CourseReviewSerializer
    permission_classes = [IsAuthenticated, IsStudent]

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)
# ============================================
# 6) LESSONS (Teacher + Student)
# ============================================

# إنشاء درس (Teacher)
class CreateLessonView(generics.CreateAPIView):
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated, IsTeacher]

    def perform_create(self, serializer):
        serializer.save()
# قائمة دروس المدرّس
class TeacherLessonsListView(generics.ListAPIView):
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated, IsTeacher]

    def get_queryset(self):
        return Lesson.objects.filter(course__teacher=self.request.user).order_by("order_index")
# تفاصيل درس واحد (Teacher)
class LessonDetailView(generics.RetrieveAPIView):
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated, IsTeacher]
    queryset = Lesson.objects.all()
    lookup_field = "id"
# تعديل درس (Teacher)
class UpdateLessonView(generics.UpdateAPIView):
    serializer_class = LessonUpdateSerializer
    permission_classes = [IsAuthenticated, IsTeacher]
    queryset = Lesson.objects.all()
    lookup_field = "id"
# حذف درس (Teacher)
class DeleteLessonView(generics.DestroyAPIView):
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated, IsTeacher]
    queryset = Lesson.objects.all()
    lookup_field = "id"
# جلب دروس الكورس (Student + Teacher)
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

        return Response({
            "course_id": course.id,
            "course_title": course.title,
            "lessons": serializer.data
        })
# جلب درس واحد للطالب
class StudentLessonDetailView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request, lesson_id):
        lesson = get_object_or_404(Lesson, id=lesson_id)

        # الطالب يجب أن يكون مسجلاً في الكورس
        enrolled = CourseEnrollment.objects.filter(student=request.user, course=lesson.course).exists()
        if not enrolled:
            return Response({"detail": "أنت لست مسجلاً في هذا الكورس"}, status=403)

        serializer = LessonSerializer(lesson, context={"request": request})
        return Response(serializer.data)
# تعليم الفيديو كمشاهد
class MarkVideoWatchedView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def post(self, request, lesson_id):
        lesson = get_object_or_404(Lesson, id=lesson_id)

        progress, _ = LessonProgress.objects.get_or_create(
            student=request.user,
            lesson=lesson
        )

        progress.video_watched = True

        # إذا الدرس ليس اختبار → اعتبره مكتمل
        if lesson.content_type != "quiz":
            progress.completed = True
            progress.completed_at = timezone.now()

        progress.save()

        return Response({"message": "تم تسجيل مشاهدة الفيديو"})
# إكمال الدرس

class CompleteLessonView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def post(self, request, lesson_id):
        lesson = get_object_or_404(Lesson, id=lesson_id)
        student = request.user

        progress, created = LessonProgress.objects.get_or_create(
            student=student,
            lesson=lesson
        )

        progress.completed = True
        progress.completed_at = timezone.now()
        progress.save()

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
# جلب تقدم الطالب في درس
class LessonProgressView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request, lesson_id):
        lesson = get_object_or_404(Lesson, id=lesson_id)

        progress, _ = LessonProgress.objects.get_or_create(
            student=request.user,
            lesson=lesson
        )

        return Response({
            "lesson_id": lesson.id,
            "completed": progress.completed,
            "video_watched": progress.video_watched,
            "quiz_passed": progress.quiz_passed,
            "completed_at": progress.completed_at
        })
# ============================================
# 7) QUIZ SYSTEM
# ============================================

# إنشاء اختبار
class CreateQuizView(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def post(self, request):
        serializer = QuizCreateSerializer(data=request.data)

        if serializer.is_valid():
            quiz = serializer.save()
            return Response({"message": "تم إنشاء الاختبار بنجاح", "quiz_id": quiz.id}, status=201)

        return Response(serializer.errors, status=400)
class TeacherCourseQuizzesView(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def get(self, request, course_id):
        quizzes = Quiz.objects.filter(lesson__course_id=course_id)
        serializer = QuizSerializer(quizzes, many=True)
        return Response(serializer.data)
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
class UpdateQuestionView(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def put(self, request, question_id):
        question = get_object_or_404(Question, id=question_id)

        question.text = request.data.get("text", question.text)
        question.save()

        return Response({"message": "تم تحديث السؤال"})

class DeleteQuestionView(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def delete(self, request, question_id):
        question = get_object_or_404(Question, id=question_id)
        question.delete()
        return Response({"message": "تم حذف السؤال"})

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
class UpdateChoiceView(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def put(self, request, choice_id):
        choice = get_object_or_404(Choice, id=choice_id)

        choice.text = request.data.get("text", choice.text)
        choice.save()

        return Response({"message": "تم تحديث الخيار"})
class DeleteChoiceView(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def delete(self, request, choice_id):
        choice = get_object_or_404(Choice, id=choice_id)
        choice.delete()
        return Response({"message": "تم حذف الخيار"})

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

        return Response({
            "score": score,
            "passed": passed,
            "attempt_number": attempt.attempt_number,
            "remaining_attempts": quiz.max_attempts - attempt.attempt_number
        }, status=200)
    

    
# ============================================
# 8) PROGRESS SYSTEM
# ============================================

# جلب تقدم الطالب في كورس
class CourseProgressView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request, course_id):
        course = get_object_or_404(Course, id=course_id)

        # الطالب يجب أن يكون مسجلاً
        enrolled = CourseEnrollment.objects.filter(student=request.user, course=course).first()
        if not enrolled:
            return Response({"detail": "أنت لست مسجلاً في هذا الكورس"}, status=403)

        # حساب التقدم
        total_lessons = course.lessons.count()
        completed_lessons = LessonProgress.objects.filter(
            student=request.user,
            lesson__course=course,
            completed=True
        ).count()

        percentage = (completed_lessons / total_lessons) * 100 if total_lessons > 0 else 0

        return Response({
            "course_id": course.id,
            "course_title": course.title,
            "total_lessons": total_lessons,
            "completed_lessons": completed_lessons,
            "progress_percentage": percentage,
            "completed": percentage == 100
        })
# جلب تقدم الطالب في درس
class LessonProgressView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request, lesson_id):
        lesson = get_object_or_404(Lesson, id=lesson_id)

        progress, _ = LessonProgress.objects.get_or_create(
            student=request.user,
            lesson=lesson
        )

        return Response({
            "lesson_id": lesson.id,
            "lesson_title": lesson.title,
            "completed": progress.completed,
            "video_watched": progress.video_watched,
            "quiz_passed": progress.quiz_passed,
            "completed_at": progress.completed_at
        })
class CompleteLessonView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def post(self, request, lesson_id):
        lesson = get_object_or_404(Lesson, id=lesson_id)
        student = request.user

        progress, _ = LessonProgress.objects.get_or_create(
            student=student,
            lesson=lesson
        )

        progress.completed = True
        progress.completed_at = timezone.now()
        progress.save()

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
class MarkVideoWatchedView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def post(self, request, lesson_id):
        lesson = get_object_or_404(Lesson, id=lesson_id)

        progress, _ = LessonProgress.objects.get_or_create(
            student=request.user,
            lesson=lesson
        )

        progress.video_watched = True

        # إذا الدرس ليس اختبار → اعتبره مكتمل
        if lesson.content_type != "quiz":
            progress.completed = True
            progress.completed_at = timezone.now()

        progress.save()

        return Response({"message": "تم تسجيل مشاهدة الفيديو"})

# ============================================
# 9) COMPANY & JOBS SYSTEM
# ============================================

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

    def perform_create(self, serializer):
        serializer.save(company=self.request.user)
class JobListView(generics.ListAPIView):
    queryset = JobPost.objects.filter(is_active=True)
    serializer_class = JobPostSerializer
    permission_classes = [AllowAny]
class JobDetailView(generics.RetrieveAPIView):
    queryset = JobPost.objects.all()
    serializer_class = JobPostSerializer
    lookup_field = 'id'
    permission_classes = [AllowAny]
class ApplyJobView(generics.CreateAPIView):
    serializer_class = JobApplicationSerializer
    permission_classes = [IsAuthenticated, IsStudent]

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)
class MyJobApplicationsView(generics.ListAPIView):
    serializer_class = JobApplicationSerializer
    permission_classes = [IsAuthenticated, IsStudent]

    def get_queryset(self):
        return JobApplication.objects.filter(student=self.request.user)

class JobDetailUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = JobPostSerializer
    permission_classes = [IsAuthenticated, IsCompany]
    lookup_field = 'id'

    def get_queryset(self):
        return JobPost.objects.filter(company=self.request.user)

class JobDeleteView(generics.DestroyAPIView):
    serializer_class = JobPostSerializer
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
    lookup_field = 'id'

    def get_queryset(self):
        return JobApplication.objects.filter(job__company=self.request.user)

class CompanyJobsListView(generics.ListAPIView):
    serializer_class = JobPostSerializer
    permission_classes = [IsAuthenticated, IsCompany]

    def get_queryset(self):
        return JobPost.objects.filter(company=self.request.user)

class CompanyChangePasswordView(APIView):
    permission_classes = [IsAuthenticated, IsCompany]

    def put(self, request):
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
        settings, _ = CompanyNotificationSettings.objects.get_or_create(company=self.request.user)
        return settings

class CompanyNotificationsView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated, IsCompany]

    def get_queryset(self):
        return Notification.objects.filter(company=self.request.user).order_by('-created_at')

# ============================================
# 10) CERTIFICATES SYSTEM
# ============================================

class GenerateCertificateView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def post(self, request, course_id):
        user = request.user
        course = get_object_or_404(Course, id=course_id)

        # الطالب يجب أن يكون مسجلاً
        enrolled = CourseEnrollment.objects.filter(student=user, course=course).first()
        if not enrolled:
            return Response({'error': 'Student not enrolled in this course'}, status=400)

        # يجب أن يكون الكورس مكتملًا
        if enrolled.progress_percentage < 100:
            return Response({'error': 'لم تكمل الكورس بعد'}, status=400)

        cert, created = Certificate.objects.get_or_create(
            student=user,
            course=course,
            defaults={'verification_code': str(uuid.uuid4())}
        )

        return Response(CertificateSerializer(cert, context={'request': request}).data)

class CertificateDetailView(generics.RetrieveAPIView):
    serializer_class = CertificateSerializer
    permission_classes = [IsAuthenticated, IsStudent]
    lookup_field = "id"

    def get_queryset(self):
        return Certificate.objects.filter(student=self.request.user)
