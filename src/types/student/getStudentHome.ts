export interface IMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

export interface IBaseResponse<T = void> {
  success: boolean;
  statusCode: number;
  message: string;
  meta?: IMeta;
  data?: T;
}

export interface IStudentInfo {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  gradeLevel: string;
  profilePicture: string;
}

export interface INextClass {
  courseId: string;
  courseName: string;
  subject: string;
  moduleId: string;
  moduleTitle: string;
  moduleNumber: number;
  type: string;
  startTime: string;
  endTime: string;
}

export interface IPendingTask {
  courseId: string;
  courseName: string;
  subject: string;
  moduleId: string;
  moduleTitle: string;
  moduleNumber: number;
  type: string;
  startTime: string;
  endTime: string;
}

export interface IMyCourse {
  courseId: string;
  courseName: string;
  subject: string;
  progressPercentage: number;
  mastery: number;
  masteryRequired: number;
}

export interface IStudentDashboardData {
  studentInfo: IStudentInfo;
  overallMastery: number;
  nextClass: INextClass;
  pendingTasks: IPendingTask[];
  myCourses: IMyCourse[];
}

export type TGetStudentDashboardDataPayload = void;

export type TGetStudentDashboardDataResponse =
  IBaseResponse<IStudentDashboardData>;
