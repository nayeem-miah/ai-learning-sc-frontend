"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils/utils";
import {
  Award,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  HelpCircle,
  MessageSquare,
  Pause,
  Play,
  Volume2,
  X,
  ArrowLeft,
  ArrowRight,
  Loader,
  Send,
  Bot
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  useGetStudentCourseDetailsQuery,
  useSubmitQuizMutation,
} from "@/lib/feature/courses/coursesApi";
import { useCourseAssistantChatMutation } from "@/lib/api/aiApi";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Ensure environment has base URL for audio if needed
const AUDIO_BASE_URL = process.env.NEXT_PUBLIC_AUDIO_BASE_URL || "http://206.162.244.135:8000";

export default function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const router = useRouter();
  const { courseId, lessonId } = use(params);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showBot, setShowBot] = useState(false);
  const [botState, setBotState] = useState<
    "idle" | "listening" | "processing" | "speaking"
  >("idle");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [playbackBlocked, setPlaybackBlocked] = useState(true);
  const wasPlayingRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Audio system immediately (Server side safe check)
  useEffect(() => {
    if (typeof window !== "undefined" && !audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.preload = "auto";
        audioRef.current.crossOrigin = "anonymous";
        console.log("[Audio System] Global audio object initialized");
    }
  }, []);

  // Audio driven state
  const [activeTopicIndex, setActiveTopicIndex] = useState(0);
  const [activePart, setActivePart] = useState<"title" | "intro" | "name" | "summary" | "detailed">("title");

  // New state: lesson completed when last transcript segment ends
  const [lessonCompleted, setLessonCompleted] = useState(false);

  const [currentLesson, setCurrentLesson] = useState<number>(0);
  const [quizResult, setQuizResult] = useState<any>(null);
  const [viewState, setViewState] = useState<"lesson" | "quiz" | "result">("lesson");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [score, setScore] = useState(0);

  const [submitQuiz, { isLoading: isSubmitting }] = useSubmitQuizMutation();
  const [courseAssistantChat, { isLoading: isChatting }] = useCourseAssistantChatMutation();

  const [chatInput, setChatInput] = useState("");
  const [threadId, setThreadId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  const { data: response, isLoading: isCourseLoading } = useGetStudentCourseDetailsQuery(courseId);
  const courseData = response?.data;

  const { user } = useSelector((state: RootState) => state.user);

  // Auto scroll to latest message
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [chatMessages, isChatting]);

  // Initialize current lesson from URL or default to first lesson
  useEffect(() => {
    if (courseData && lessonId) {
      if (lessonId.includes('-quiz')) {
        setViewState('quiz');
        const mId = lessonId.split('-quiz')[0];
        const moduleIndex = courseData.modules.findIndex((m: any) => m.id === mId || m.quiz?.id === lessonId);
        setCurrentLesson(moduleIndex !== -1 ? moduleIndex : 0);
      } else {
        const moduleIndex = courseData.modules.findIndex((m: any) => m.id === lessonId || m.studyTopics?.some((t: any, idx: number) => `${m.id}-lesson-${idx}` === lessonId));
        setCurrentLesson(moduleIndex !== -1 ? moduleIndex : 0);
      }
    }
  }, [courseData, lessonId]);

  const getCurrentLessonData = () => {
    if (!courseData || currentLesson === null || !courseData.modules[currentLesson]) return null;

    const moduleData = courseData.modules[currentLesson];

    // Map studyTopics to transcript format
    const transcript = moduleData.studyTopics?.map((topic: any, index: number) => ({
      id: index + 1,
      text: `${topic.topic_name}: ${topic.topic_wise_study_data?.detailed_explanation || topic.topic_wise_study_data?.summary || ""}`
    })) || [];

    // Map quiz questions to local format
    const quiz = moduleData.quizQuestions?.map((q: any) => {
      const options = [
        q.optionA || "A",
        q.optionB || "B",
        q.optionC || "C",
        q.optionD || "D"
      ].filter(Boolean);

      const correctIndex = ["A", "B", "C", "D"].indexOf(q.correctAnswer);

      return {
        questionId: q.questionId,
        question: q.questionText,
        options,
        correctAnswer: correctIndex >= 0 ? correctIndex : 0
      };
    }) || [];

    return {
      title: moduleData.moduleTitle || `Module ${moduleData.moduleNumber}`,
      videoUrl: "/lip_sync.mp4", // Static placeholder for the video component
      audioUrl: moduleData.voiceData?.audio_url ? `${AUDIO_BASE_URL}${moduleData.voiceData.audio_url}` : null,
      transcript,
      quiz,
      studyTopics: moduleData.studyTopics
    };
  };

  const handleLessonChange = (lessonIndex: number) => {
    setCurrentLesson(lessonIndex);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }

    setIsPlaying(true);
    setCurrentTime(0);
    setLessonCompleted(false);
    setViewState("lesson");
    setAnswers({});
    setActiveTopicIndex(0);
    setActivePart("title");
    setIsVideoReady(false);

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      const nextData = getCurrentLessonData();
      if (nextData?.videoUrl) {
        videoRef.current.src = nextData.videoUrl;
        videoRef.current.load();
        videoRef.current.currentTime = 0;
      }
    }
  };

  // Track which segment is currently active
  const [activeSegmentId, setActiveSegmentId] = useState<number | null>(1);
  // Track elapsed time for current segment
  const [, setSegmentElapsedTime] = useState(0);

  // Calculate duration based on text length (approximately 150 words per minute for reading speed)
  const calculateSegmentDuration = (text: string) => {
    const charactersPerSecond = 15; // Average reading speed
    const duration = text.length / charactersPerSecond;
    return Math.max(duration, 3); // Minimum 3 seconds per segment
  };

  // Pre-load video when component mounts
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.load();
      video.preload = "auto";
      video.playbackRate = 1.0;
    }
  }, []);

  // Reset on page reload/revisit and AUTO START
  useEffect(() => {
    // Reset everything when component mounts (new visit)
    setActiveTopicIndex(0);
    setActivePart("title");
    setIsPlaying(false);
    setSegmentElapsedTime(0);
    setLessonCompleted(false);
    setIsVideoReady(false);

    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  }, [lessonId]); // Trigger when lessonId changes (new visit)

  // Video progress + segment control logic - based on text length
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const data = getCurrentLessonData();
    if (data?.videoUrl) {
      video.src = data.videoUrl;
      video.load();
    }

    const handleTimeUpdate = () => {
      const time = video.currentTime;
      setCurrentTime(time);
    };

    const handlePlay = () => {
      console.log("Video playing event");
      setIsPlaying(true);
    };

    const handlePause = () => {
      console.log("Video pause event");
      if (document.visibilityState === "visible") {
        setIsPlaying(false);
      }
    };

    const handleLoadedMetadata = () => {
      setIsVideoReady(true);
    };

    const handleCanPlay = () => {
      setIsVideoReady(true);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("canplay", handleCanPlay);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("canplay", handleCanPlay);
    };
  }, [currentLesson, lessonId, courseData]); // Re-attach when element remounts

  // Handle visibility change separately
  useEffect(() => {
    const handleVisibilityChange = () => {
      const video = videoRef.current;
      if (!video) return;

      if (document.visibilityState === "hidden") {
        wasPlayingRef.current = isPlaying;
      } else if (
        document.visibilityState === "visible" &&
        wasPlayingRef.current
      ) {
        video.play().catch((e) => console.log("Auto-resume failed:", e));
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isPlaying]);

  // Sync Video with isPlaying
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying && !showBot) {
      video.playbackRate = 1.0;
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isPlaying, lessonCompleted, showBot]);

  // Simplified control playback + HTTP/VPS optimization
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideoReady) return;

    const syncPlayback = async () => {
      try {
        if (isPlaying && !showBot && !lessonCompleted) {
          if (video.paused) {
            try {
              await video.play();
              setPlaybackBlocked(false);
            } catch (e) {
              console.log("HTTP/VPS Blocked autoplay:", e);
              setPlaybackBlocked(true);
              setIsPlaying(false);
            }
          }
        } else {
          if (!video.paused) video.pause();
        }
      } catch (err) {
        console.log("Sync playback error:", err);
      }
    };

    syncPlayback();
  }, [isPlaying, showBot, lessonCompleted, isVideoReady]);

  // Handle initial user interaction to wake up audio/video (Crucial for HTTP VPS)
  useEffect(() => {
    const handleWakeUp = () => {
      if (playbackBlocked && !isPlaying && videoRef.current) {
        videoRef.current
          .play()
          .then(() => {
            setPlaybackBlocked(false);
            setIsPlaying(true);
          })
          .catch(() => { });
      }
    };

    window.addEventListener("click", handleWakeUp);
    window.addEventListener("touchstart", handleWakeUp);
    return () => {
      window.removeEventListener("click", handleWakeUp);
      window.removeEventListener("touchstart", handleWakeUp);
    };
  }, [playbackBlocked, isPlaying]);

  // Auto-scroll transcript based on active segment
  useEffect(() => {
    if (scrollContainerRef.current) {
      const el = scrollContainerRef.current.children[
        activeTopicIndex
      ] as HTMLElement;
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeTopicIndex, currentLesson]);

  const handleBotClick = () => {
    setIsPlaying(false);
    setShowBot(true);
    setBotState("listening");
    setTimeout(() => setBotState("processing"), 2000);
    setTimeout(() => setBotState("speaking"), 4000);
  };

  const handleTranscriptClick = (index: number) => {
    setActiveTopicIndex(index);
    setActivePart("name");
    setIsPlaying(true);
    setLessonCompleted(false);
  };

  const handleQuizClick = () => {
    const currentModule = courseData?.modules[currentLesson];
    if (currentModule?.quizScore != null || currentModule?.isCompleted) {
      setViewState("result");
    } else {
      setViewState("quiz");
    }
    setIsPlaying(false);
    setLessonCompleted(false);
  };

  const handleStartQuiz = () => {
    const currentModule = courseData?.modules[currentLesson];
    if (currentModule?.quizScore != null || currentModule?.isCompleted) {
      setViewState("result");
    } else {
      setViewState("quiz");
    }
    setIsPlaying(false);
    setLessonCompleted(false);
  };

  const handleOptionSelect = (qIndex: number, oIndex: number) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: oIndex }));
  };

  const handleTopicSelection = (mIdx: number, tIdx: number) => {
    if (mIdx !== currentLesson) {
      handleLessonChange(mIdx);
    }
    handleTranscriptClick(tIdx);
    setViewState("lesson");
  };

  const handleSubmitQuiz = async () => {
    const data = getCurrentLessonData();
    if (!data?.quiz || !courseData) return;

    const currentModule = courseData.modules[currentLesson];

    const formattedAnswers = data.quiz.map((q: any, i: number) => ({
      question_id: q.questionId,
      selected_answer: ["A", "B", "C", "D"][answers[i]] || "A"
    }));

    const payload = {
      unique_user_id: courseData.uniqueUserId,
      unique_session_id: courseData.uniqueSessionId,
      module_id: currentModule.id,
      answers: formattedAnswers
    };

    try {
      const res = await submitQuiz(payload).unwrap();
      if (res.success) {
        setScore(res.data.correct_answers);
        setQuizResult(res.data);
        setViewState("result");
        toast.success(res.message || "Quiz submitted successfully");
      }
    } catch (err: any) {
      console.error("Quiz submission error:", err);
      toast.error(err?.data?.message || "Failed to submit quiz");
    }
  };


  const handleSendMessage = async () => {
    if (!chatInput.trim() || isChatting || !courseData) return;

    const userMessage = { role: "user" as const, content: chatInput };
    setChatMessages((prev) => [...prev, userMessage]);
    const currentInput = chatInput;
    setChatInput("");

    try {
      const payload: any = {
        id: lessonId,
        question: currentInput,
      };
      
      if (threadId) {
        payload.thread_id = threadId;
      }

      const res = await courseAssistantChat(payload).unwrap();
      
      if (res.success && res.data) {
        if (!threadId) {
          setThreadId(res.data.thread_id);
        }
        const assistantMessage = { role: "assistant" as const, content: res.data.answer };
        setChatMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (err: any) {
      console.error("Chat error:", err);
      toast.error(err?.data?.message || "Failed to get response from assistant");
    }
  };

  const handleBackToLesson = () => {
    setViewState("lesson");
    setCurrentLesson(currentLesson !== null ? currentLesson : 0);
    setLessonCompleted(false);
    setActiveTopicIndex(0);
    setActivePart("name");
  };

  if (isCourseLoading) return <div className="p-8 text-white">Loading lesson...</div>;
  if (!courseData) return <div className="p-8 text-white">Course not found</div>;

  const currentLessonData = getCurrentLessonData();
  const currentModuleTitle = courseData?.modules[currentLesson || 0]?.moduleTitle || "Course Module";
  const courseTitle = courseData?.courseName || "Course Name";

  const isCurrentQuizSubmitted = !!courseData?.modules[currentLesson]?.quizScore || !!courseData?.modules[currentLesson]?.isCompleted;
  const allQuestionsAnswered = currentLessonData?.quiz &&
    currentLessonData.quiz.length > 0 &&
    Object.keys(answers).length === currentLessonData.quiz.length;

  return (
    <div className="flex text-foreground overflow-hidden relative rounded-2xl">
      {/* Sidebar */}
      <div className="bg-[#1C1C1C] border-r border-[#333] flex flex-col hidden lg:flex">
        <div className="p-6 border-b border-[#333]">
          <Link
            href={`/student/courses/${courseId}`}
            className="text-sm text-gray-400 hover:text-[#D4AF37] flex items-center gap-2 mb-4"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Course
          </Link>
          <h2 className="text-[#D4AF37] font-semibold text-lg">
            {viewState !== "quiz" ? currentLessonData?.title : "Lesson Quiz"}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {courseTitle} - {currentModuleTitle}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <Accordion 
            type="single" 
            collapsible 
            defaultValue={courseData.modules[currentLesson]?.id} 
            className="space-y-2"
          >
            {courseData.modules?.map((m: any, mIdx: number) => (
              <AccordionItem key={m.id || mIdx} value={m.id || `m-${mIdx}`} className="border-none">
                <AccordionTrigger className="hover:no-underline p-3 rounded-lg bg-[#252525] hover:bg-[#2a2a2a] transition-all data-[state=open]:bg-[#D4AF37]/10 data-[state=open]:border data-[state=open]:border-[#D4AF37]/30">
                  <div className="flex flex-col text-left group">
                    <span className="text-[10px] text-[#D4AF37] font-bold uppercase mb-0.5">Module {mIdx + 1}</span>
                    <span className="text-sm font-semibold text-gray-200 line-clamp-1 group-data-[state=open]:text-[#D4AF37]">{m.moduleTitle || "Untitled Module"}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-0">
                  <div className="space-y-1 pl-2 border-l border-[#333] ml-4 mt-2">
                    {m.studyTopics?.map((topic: any, tIdx: number) => {
                      const isActive = mIdx === currentLesson && tIdx === activeTopicIndex && viewState === "lesson";
                      return (
                        <div
                          key={tIdx}
                          onClick={() => handleTopicSelection(mIdx, tIdx)}
                          className={cn(
                            "p-2 rounded-md flex items-start gap-3 cursor-pointer transition-all group",
                            isActive ? "bg-[#D4AF37]/10 border border-[#D4AF37]/20" : "hover:bg-[#1C1C1C]"
                          )}
                        >
                          <div className={cn(
                            "w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold transition-colors",
                            isActive ? "bg-[#D4AF37] text-black" : "bg-[#333] text-gray-500 group-hover:text-gray-300"
                          )}>
                            {isActive ? (
                              <Play className="w-2.5 h-2.5 fill-current" />
                            ) : (
                              tIdx + 1
                            )}
                          </div>
                          <div className="flex flex-col">
                            <p className={cn(
                              "text-xs font-medium transition-colors",
                              isActive ? "text-[#D4AF37]" : "text-gray-400 group-hover:text-gray-200"
                            )}>
                              Lesson {tIdx + 1}
                            </p>
                            <p className="text-[10px] text-gray-500 line-clamp-1 group-hover:text-gray-400">
                              {topic.topic_name}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Module Quiz */}
                    <div
                      onClick={() => {
                        setCurrentLesson(mIdx);
                        handleQuizClick();
                      }}
                      className={cn(
                        "p-2 rounded-md flex items-start gap-3 cursor-pointer mt-1 transition-all group",
                        mIdx === currentLesson && (viewState === "quiz" || viewState === "result") 
                          ? "bg-[#D4AF37]/10 border border-[#D4AF37]/20" 
                          : "hover:bg-[#1C1C1C]"
                      )}
                    >
                      <div className={cn(
                        "w-6 h-6 rounded-full shrink-0 flex items-center justify-center transition-colors",
                        mIdx === currentLesson && (viewState === "quiz" || viewState === "result") 
                          ? "bg-[#D4AF37] text-black" 
                          : "bg-[#333] text-gray-500 group-hover:text-gray-300"
                      )}>
                        <HelpCircle className="w-3 h-3" />
                      </div>
                      <div className="flex flex-col">
                        <p className={cn(
                          "text-xs font-medium transition-colors",
                          mIdx === currentLesson && (viewState === "quiz" || viewState === "result") ? "text-[#D4AF37]" : "text-gray-400 group-hover:text-gray-200"
                        )}>
                          Module Quiz
                        </p>
                        <p className="text-[10px] text-gray-500 group-hover:text-gray-400">
                          {m.quizQuestions?.length || 0} Questions
                        </p>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative bg-[#111]">
        {/* Header */}
        <div className="h-16 border-b border-[#333] flex items-center justify-between px-6 bg-[#161616]">
          <h1 className="text-lg font-medium text-white">
            {viewState !== "quiz" ? currentLessonData?.title : "Lesson Quiz"}
          </h1>
          <div className="flex items-center gap-4">
            {viewState === "lesson" && (
              <Button
                size="sm"
                onClick={handleStartQuiz}
                className="bg-[#D4AF37] hover:bg-[#c4a02f] text-black font-bold"
              >
                Take Quiz <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
            {viewState !== "lesson" && (
              <Button
                onClick={handleBackToLesson}
                variant="outline"
                className="border-[#333] bg-[#222] text-gray-300 hover:text-white"
              >
                Back to Lesson
              </Button>
            )}
          </div>
        </div>

        {/* Lesson View */}
        {viewState === "lesson" && (
          <div className="flex-1 overflow-hidden flex flex-col lg:flex-row relative">
            {/* Transcript */}
            <div
              className="flex-1 p-8 overflow-y-auto border-r border-[#333] bg-[#111]"
              ref={scrollContainerRef}
            >
              <h3 className="text-[#D4AF37] font-semibold mb-6 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Transcript
              </h3>
              <div className="space-y-6 max-w-2xl mx-auto">
                {/* Module Introduction */}
                {courseData.modules[currentLesson]?.introduction && (
                  <div className={cn(
                    "p-6 rounded-2xl transition-all border mb-8 group",
                    (activePart === "title" || activePart === "intro")
                      ? "bg-[#D4AF37]/10 border-[#D4AF37]/30 shadow-[0_0_20px_rgba(212,175,55,0.05)]"
                      : "bg-[#1C1C1C] border-[#333]"
                  )}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold",
                        (activePart === "title" || activePart === "intro") ? "bg-[#D4AF37] text-black" : "bg-[#252525] text-gray-500"
                      )}>
                        <Award className="w-4 h-4" />
                      </div>
                      <h3 className={cn(
                        "font-bold text-base transition-colors",
                        (activePart === "title" || activePart === "intro") ? "text-[#D4AF37]" : "text-gray-200"
                      )}>
                        Module Introduction
                      </h3>
                    </div>
                    <p className={cn(
                      "text-sm leading-relaxed transition-colors",
                      (activePart === "intro") ? "text-gray-100" : "text-gray-400"
                    )}>
                      {courseData.modules[currentLesson]?.introduction}
                    </p>
                  </div>
                )}
                {currentLessonData?.studyTopics?.map((topic: any, idx: number) => {
                  const isActive = activePart !== null && activeTopicIndex === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => handleTranscriptClick(idx)}
                      className={cn(
                        "p-5 rounded-2xl transition-all cursor-pointer border group",
                        isActive
                          ? "bg-[#D4AF37]/10 border-[#D4AF37]/30 shadow-[0_0_20px_rgba(212,175,55,0.05)]"
                          : "bg-[#1C1C1C] border-[#333] hover:border-[#444]"
                      )}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold",
                          isActive
                            ? "bg-[#D4AF37] text-black"
                            : "bg-[#252525] text-gray-500"
                        )}>
                          {idx + 1}
                        </div>
                        <h3 className={cn(
                          "font-bold text-base transition-colors",
                          isActive ? "text-[#D4AF37]" : "text-gray-200 group-hover:text-white"
                        )}>
                          {topic.topic_name}
                        </h3>
                      </div>

                      <div className="space-y-4 mt-2">
                        {topic.topic_wise_study_data?.summary && (
                          <div className={cn(
                            "transition-all duration-300 pl-4 border-l-2",
                            isActive && activePart === "summary" 
                              ? "border-[#D4AF37] opacity-100" 
                              : "border-transparent opacity-60"
                          )}>
                            <p className="text-[10px] uppercase text-[#D4AF37] font-bold mb-1">Summary</p>
                            <p className={cn(
                              "text-sm leading-relaxed",
                              isActive && activePart === "summary" ? "text-gray-100" : "text-gray-400"
                            )}>
                              {topic.topic_wise_study_data.summary}
                            </p>
                          </div>
                        )}

                        {topic.topic_wise_study_data?.detailed_explanation && (
                          <div className={cn(
                            "transition-all duration-300 pl-4 border-l-2",
                            isActive && activePart === "detailed" 
                              ? "border-[#D4AF37] opacity-100" 
                              : "border-transparent opacity-60"
                          )}>
                            <p className="text-[10px] uppercase text-[#D4AF37] font-bold mb-1">Detailed Explanation</p>
                            <p className={cn(
                              "text-sm leading-relaxed",
                              isActive && activePart === "detailed" ? "text-gray-100" : "text-gray-400"
                            )}>
                              {topic.topic_wise_study_data.detailed_explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Video + Secondary Audio Player + Bot Area */}
            <div className="w-full lg:w-112.5 bg-black p-6 flex flex-col border-l border-[#333] relative overflow-y-auto scrollbar-hide">

              {/* Audio and Video synchronizer handled by useEffect */}

              <div className="relative aspect-4/3 bg-[#1a1a1a] rounded-2xl overflow-hidden shadow-2xl border border-[#333] mb-6">
                  <video
                    ref={videoRef}
                    muted
                    loop
                    className="absolute inset-0 w-full h-full object-cover"
                  src={currentLessonData?.videoUrl || "/lip_sync.mp4"}
                  playsInline
                  webkit-playsinline="true"
                  preload="auto"
                  onLoadedData={() => setIsVideoReady(true)}
                  onCanPlay={() => setIsVideoReady(true)}
                  onError={() => {
                    console.log("Video loading error - likely HTTP/CORS issue");
                    setPlaybackBlocked(true);
                  }}
                />

                {/* Playback Blocked Overlay (HTTP Fallback) */}
                {playbackBlocked && (
                  <div
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center cursor-pointer z-10"
                    onClick={() => {
                      // 1. First set playbackBlocked to false
                      setPlaybackBlocked(false);
                      // 2. Then set isPlaying to true
                      setIsPlaying(true);

                      // 3. Play Video
                      if (videoRef.current) {
                        videoRef.current.play().catch(() => {});
                      }

                      // 4. Play Audio directly if source is ready and valid
                      if (audioRef.current && audioRef.current.src && !audioRef.current.src.startsWith("data:")) {
                        audioRef.current.muted = false;
                        audioRef.current.volume = 1.0;
                        audioRef.current.play().catch((e) => console.warn("[Audio] Prime play failed:", e));
                      }
                      
                      toast.success("চালু হয়েছে!", { description: "Audio শুরু হচ্ছে..." });
                    }}
                  >
                    <div className="w-16 h-16 rounded-full bg-[#D4AF37] flex items-center justify-center mb-4 animate-pulse shadow-[0_0_30px_rgba(212,175,55,0.4)]">
                      <Volume2 className="w-8 h-8 text-black" />
                    </div>
                    <p className="text-white font-bold text-xl mb-1">
                      Click to Unmute & Start
                    </p>
                    <p className="text-gray-300 text-sm max-w-[250px]">
                      Your browser requires a click to enable lesson audio and video.
                    </p>
                    
                  </div>
                )}

                {/* Play/Pause */}
                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-6">
                  <Button
                    size="icon"
                    className="rounded-full w-12 h-12 bg-[#D4AF37] hover:bg-[#c4a02f] text-black shadow-lg"
                    onClick={() => setIsPlaying(!isPlaying)}
                    disabled={lessonCompleted}
                  >
                    {isPlaying ? (
                      <Pause className="fill-current" />
                    ) : (
                      <Play className="fill-current ml-1" />
                    )}
                  </Button>
                </div>

                {/* Lesson Completed Overlay */}
                {lessonCompleted && (
                  <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
                    <div className="text-center p-8 bg-[#1C1C1C] rounded-2xl border border-[#D4AF37]/40 max-w-sm mx-4">
                      <CheckCircle className="w-16 h-16 text-[#D4AF37] mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-white mb-3">
                        Lesson Completed!
                      </h3>
                      <p className="text-gray-400 mb-6">
                        You&#39;ve watched all the explained sections.
                      </p>
                      <div className="flex gap-4 justify-center">
                        <Button
                          variant="outline"
                          className="border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/10"
                          onClick={() => {
                            if (videoRef.current) {
                              videoRef.current.currentTime = 0;
                              setCurrentTime(0);
                              setLessonCompleted(false);
                              setActiveTopicIndex(0);
                              setActivePart("name");
                              setSegmentElapsedTime(0);
                              setIsPlaying(true);
                            }
                          }}
                        >
                          Replay Lesson
                        </Button>
                        <Button
                          className="bg-[#D4AF37] hover:bg-[#c4a02f] text-black"
                          onClick={handleStartQuiz}
                        >
                          Take Quiz
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="bg-[#1C1917] border border-[#D4AF37]/30 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-10 h-10 bg-[#D4AF37] hover:bg-[#c4a02f] rounded-xl flex items-center justify-center border border-[#D4AF37]/20"
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5 text-black fill-black" />
                    ) : (
                      <Play className="w-5 h-5 text-black fill-black" />
                    )}
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      if (currentLesson > 0) {
                        handleLessonChange(currentLesson - 1);
                      }
                    }}
                    disabled={currentLesson === 0}
                    className="border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-2xl px-5 h-12 flex items-center gap-2 group transition-all"
                  >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-semibold text-sm">Go Back</span>
                  </Button>
                  <Button
                    onClick={() => {
                      if (currentLesson < (courseData?.modules?.length || 0) - 1) {
                        handleLessonChange(currentLesson + 1);
                      }
                    }}
                    disabled={currentLesson === (courseData?.modules?.length || 0) - 1}
                    className="bg-[#D4AF37] hover:bg-[#c4a02f] text-[#1a1a1a] font-bold h-12 px-6 rounded-2xl flex items-center gap-2 group transition-all disabled:opacity-50"
                  >
                    <span className="text-sm font-bold">Go Next</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <div>
                    
                  </div>
                  
                </div>
                
              </div>
                {/* chat bot */}
              <div className="pt-6">
      {/* Main Chat Window */}
      <div className="w-[400px] h-[500px] bg-[#3d3623] rounded-[32px] flex flex-col overflow-hidden border border-white/5 shadow-2xl">
        
        {/* Header */}
        <div className="px-6 pt-6 pb-2">
          <h2 className="text-[#d9b878] text-lg font-medium opacity-90">
            AI Assistant
          </h2>
          <div className="h-[1px] bg-white/10 mt-2 w-full" />
        </div>

        {/* Chat Body */}
        <div 
          ref={chatBodyRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-[#2b2518] scroll-smooth"
        >
          {chatMessages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <div className="w-12 h-12 bg-[#4a422d] rounded-2xl flex items-center justify-center mb-3 text-[#d9b878]">
                <MessageSquare size={24} />
              </div>
              <p className="text-[#d9b878] font-medium text-sm">Hello student! How can I help you with this module?</p>
            </div>
          )}
          {chatMessages.map((msg, idx) => (
            <div
              key={idx}
              className={cn(
                "flex items-start gap-3 w-full",
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              {/* Avatar */}
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-white/10 overflow-hidden",
                msg.role === "user" ? "bg-[#d9b878] text-[#3d3623]" : "bg-[#4a422d] text-[#d9b878]"
              )}>
                {msg.role === "user" ? (
                  (user?.photo || (user as any)?.profilePicture) ? (
                    <img 
                      src={user?.photo || (user as any)?.profilePicture} 
                      alt="User" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <HelpCircle size={16} />
                  )
                ) : (
                  <Bot size={16} />
                )}
              </div>

              {/* Message Bubble container */}
              <div className={cn(
                "flex flex-col max-w-[80%]",
                msg.role === "user" ? "items-end" : "items-start"
              )}>
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className="text-[10px] font-bold text-[#d9b878]/60 uppercase tracking-tighter">
                    {msg.role === "user" ? "You" : "Course Assistant"}
                  </span>
                </div>
                <div
                  className={cn(
                    "text-sm p-4 rounded-2xl shadow-sm leading-relaxed",
                    msg.role === "user" 
                      ? "bg-[#d9b878] text-[#3d3623] rounded-tr-none" 
                      : "bg-[#4a422d] text-[#d9b878] rounded-tl-none border border-white/5"
                  )}
                >
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2" {...props} />,
                      ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                      li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                      strong: ({ node, ...props }) => <strong className="font-bold text-[#f0d4a0]" {...props} />,
                      code: ({ node, ...props }) => <code className="bg-black/30 px-1 rounded text-xs font-mono" {...props} />,
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {isChatting && (
            <div className="flex items-center gap-2 text-[10px] text-[#d9b878]/50 animate-pulse px-11">
              <Loader2 size={12} className="animate-spin" />
              <span>Assistant is typing...</span>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 flex items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type a message..."
              className="w-full bg-[#4a422d] border border-[#d9b878]/30 rounded-2xl py-4 px-6 text-[#d9b878] placeholder-[#d9b878]/50 outline-none focus:border-[#d9b878]/60 transition-all font-medium text-sm"
            />
          </div>
          
          {/* Send Button */}
          <button 
            onClick={handleSendMessage}
            disabled={isChatting || !chatInput.trim()}
            className="bg-[#d9b878] hover:bg-[#c9a767] text-[#3d3623] p-4 rounded-full transition-colors shadow-lg disabled:opacity-50"
          >
            {isChatting ? (
               <Loader2 size={24} className="animate-spin" />
            ) : (
              <Send size={24} strokeWidth={2.5} className="rotate-[-10deg] translate-x-[-2px]" />
            )}
          </button>
        </div>
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => setChatMessages([])} // Example: clear chat or just decorative as before
        className="bg-[#d9b878] hover:bg-[#c9a767] text-[#3d3623] p-4 rounded-full transition-transform hover:scale-105 shadow-xl mt-4"
      >
        <Bot size={32} strokeWidth={2} />
      </button>
              </div>
            </div>
            
            
          </div>
        )}

        {/* Quiz View - keeping same as before */}
        {viewState === "quiz" && (
          <div className="flex-1 overflow-y-auto p-8 bg-[#111]">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-[#D4AF37] mb-6">
                Lesson Quiz
              </h2>
              <div className="space-y-8">
                {currentLessonData?.quiz?.map((q: any, qIdx: number) => (
                  <div
                    key={qIdx}
                    className="bg-[#1C1C1C] border border-[#333] rounded-xl p-6"
                  >
                    <h3 className="text-lg font-medium text-white mb-4">
                      Question {qIdx + 1}: {q.question}
                    </h3>
                    <div className="space-y-3">
                      {q.options.map((option: string, oIdx: number) => (
                        <div
                          key={oIdx}
                          onClick={() => handleOptionSelect(qIdx, oIdx)}
                          className={cn(
                            "p-4 rounded-lg border cursor-pointer flex items-center gap-3 transition-all",
                            answers[qIdx] === oIdx
                              ? "bg-[#D4AF37]/10 border-[#D4AF37] text-[#D4AF37]"
                              : "bg-transparent border-[#333] text-gray-300 hover:bg-[#252525]",
                          )}
                        >
                          <div
                            className={cn(
                              "w-5 h-5 rounded-full border flex items-center justify-center",
                              answers[qIdx] === oIdx
                                ? "border-[#D4AF37]"
                                : "border-gray-500",
                            )}
                          >
                            {answers[qIdx] === oIdx && (
                              <div className="w-3 h-3 rounded-full bg-[#D4AF37]" />
                            )}
                          </div>
                          {option}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-8 pb-12">
                <Button
                  onClick={handleSubmitQuiz}
                  disabled={isSubmitting || !allQuestionsAnswered || isCurrentQuizSubmitted}
                  className="bg-[#D4AF37] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#c4a02f] text-black font-bold h-12 px-8 rounded-full text-lg min-w-[160px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="w-5 h-5 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : isCurrentQuizSubmitted ? (
                    "Already Submitted"
                  ) : (
                    "Submit Quiz"
                  )}
                </Button>
                {!allQuestionsAnswered && !isCurrentQuizSubmitted && (
                  <p className="text-gray-500 text-sm mt-2 text-right">Please answer all questions to submit</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Result View - keeping same as before */}
        {viewState === "result" && (
          <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#111] flex justify-center">
            <div className="max-w-4xl w-full pt-12">
              <div className="relative border-2 border-dashed border-[#22D3EE] rounded-3xl p-10 text-center mb-10 bg-[#161616]">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-[#111] border-2 border-[#D4AF37] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                  <div className="w-16 h-16 bg-[#D4AF37] rounded-full flex items-center justify-center">
                    <Award className="w-8 h-8 text-black" />
                  </div>
                </div>

                <h2 className="text-4xl font-bold text-white mt-6 mb-2">
                  Quiz Complete!
                </h2>
                <p className="text-gray-400">
                  Great job! Here&#39;s how you did:
                </p>

                <div className="grid grid-cols-3 gap-4 mt-10">
                  <div className="bg-[#1C1C1C] border border-dashed border-gray-700 rounded-xl p-6">
                    <div className="text-4xl font-bold text-white">
                      {quizResult ? quizResult.correct_answers * 10 : score * 10}
                    </div>
                    <div className="text-xs uppercase text-[#D4AF37] font-semibold tracking-widest mt-2">
                      Points Earned
                    </div>
                  </div>
                  <div className="bg-[#1C1C1C] border border-dashed border-gray-700 rounded-xl p-6">
                    <div className="text-4xl font-bold text-white">
                      {quizResult ? `${quizResult.correct_answers}/${quizResult.total_questions}` : `${score}/${currentLessonData?.quiz?.length || 1}`}
                    </div>
                    <div className="text-xs uppercase text-[#D4AF37] font-semibold tracking-widest mt-2">
                      Correct Answers
                    </div>
                  </div>
                  <div className="bg-[#1C1C1C] border border-dashed border-gray-700 rounded-xl p-6">
                    <div className="text-4xl font-bold text-white">
                      {quizResult ? quizResult.score_percentage : Math.round((score / (currentLessonData?.quiz?.length || 1)) * 100)}%
                    </div>
                    <div className="text-xs uppercase text-[#D4AF37] font-semibold tracking-widest mt-2">
                      Accuracy
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {currentLessonData?.quiz?.map((q: any, qIdx: number) => {
                  const apiDetail = quizResult?.details?.find((d: any) => d.question_id === q.questionId);
                  const isCorrect = apiDetail ? apiDetail.is_correct : answers[qIdx] === q.correctAnswer;
                  const correctOptionLabel = apiDetail ? apiDetail.correct_answer : ["A", "B", "C", "D"][q.correctAnswer];
                  const correctOptionIndex = ["A", "B", "C", "D"].indexOf(correctOptionLabel);
                  return (
                    <div
                      key={qIdx}
                      className="bg-[#161616] border-2 border-dashed border-[#22D3EE]/30 rounded-2xl p-8"
                    >
                      <div className="flex justify-between mb-4">
                        <h3 className="text-sm font-semibold text-[#D4AF37] uppercase tracking-widest">
                          Question: {qIdx + 1}
                        </h3>
                      </div>
                      <p className="text-2xl font-bold text-white mb-8">{q.question}</p>

                      <div className="space-y-4">
                        {q.options.map((option: string, oIdx: number) => {
                          const isSelected = answers[qIdx] === oIdx;
                          const isCorrectOption = oIdx === correctOptionIndex;

                          let cardStyle = "bg-[#1C1C1C] border-[#333] text-gray-400";
                          if (isSelected && isCorrect) cardStyle = "bg-[#22C55E]/10 border-[#22C55E] text-[#22C55E]";
                          if (isSelected && !isCorrect) cardStyle = "bg-[#EF4444]/10 border-[#EF4444] text-[#EF4444]";
                          if (!isSelected && isCorrectOption && !isCorrect) cardStyle = "bg-[#22C55E]/5 border-[#22C55E]/30 text-[#22C55E]";

                          return (
                            <div
                              key={oIdx}
                              className={cn(
                                "p-5 rounded-xl border flex justify-between items-center transition-all",
                                cardStyle
                              )}
                            >
                              <span className="font-medium">
                                {["A", "B", "C", "D"][oIdx]}) {option}
                              </span>
                              {isSelected && isCorrect && <CheckCircle className="w-5 h-5" />}
                              {isSelected && !isCorrect && <X className="w-5 h-5" />}
                              {!isSelected && isCorrectOption && !isCorrect && <CheckCircle className="w-5 h-5 opacity-50" />}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-center gap-4 mt-12 pb-12">
                {courseData.retestingAllowed && (
                  <Button
                    onClick={() => {
                      setViewState("quiz");
                      setAnswers({});
                      setQuizResult(null);
                    }}
                    variant="outline"
                    className="border-[#333] bg-transparent text-[#D4AF37] hover:bg-[#D4AF37]/10 h-12 px-8"
                  >
                    Try Again
                  </Button>
                )}
                <Button
                  onClick={() => router.push(`/student/courses/${courseId}`)}
                  className="bg-[#D4AF37] hover:bg-[#c4a02f] text-black font-bold h-12 px-8"
                >
                  Go Back Home
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
