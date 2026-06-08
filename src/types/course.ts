export type Lesson = {
  id: string;
  title: string;
  type: string;
  duration: string;
  completed: boolean;
};

export type Assessment = {
  title: string;
  type: string;
  completed: boolean;
};

export type Module = {
  id: string;
  title: string;
  lessons: Lesson[];
  duration: string;
  isCompleted: boolean;
};

export interface Course {
  id: string;
  title: string;
  progress: number;
  mastery: number;
  image: string;
  category: string;
}

export interface CourseDetail extends Course {
  description: string;
  modules: Module[];
  masteryRequirement: number;
  averageMastery: number;
  modulesCompleted: string;
  lessonsCompleted: string;
  assessmentsCompleted: string;
}

export interface TranscriptSegment {
  id: number;
  text: string;
  startTime: number;
  endTime: number;
}

export interface LessonDetail {
  id: string;
  title: string;
  courseId: string;
  moduleId: string;
  videoUrl: string;
  description: string;
  transcript: TranscriptSegment[];
  quiz?: {
    question: string;
    options: string[];
    correctAnswer: number;
  }[];
}

export type PasswordInputItemType = {
  label: string;
  id: string;
};
