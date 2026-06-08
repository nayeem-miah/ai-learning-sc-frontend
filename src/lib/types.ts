export type CourseModule = {
  id: string;
  title: string;
  duration: string;
  progress?: string;
  lessons?: Lesson[];
  assessments?: Assessment[];
};

export type Lesson = {
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

export type PasswordInputItemType = {
  label: string;
  id: string;
};
