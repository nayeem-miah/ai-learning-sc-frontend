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

export interface ITimeSpentChart {
  day: string;
  hours: number;
}

export interface ITimeSpent {
  totalHoursThisWeek: number;
  averagePerDay: number;
  chartData: ITimeSpentChart[];
}

export interface IModulesComplete {
  completed: number;
  total: number;
}

export interface IMasteryByCourse {
  courseName: string;
  mastery: number;
  masteryRequired: number;
}

export interface IRecentImprovement {
  courseName: string;
  moduleName: string;
  quizName: string;
  improvement: number;
  description: string;
}

export interface IStudentProgressData {
  overallMastery: number;
  modulesComplete: IModulesComplete;
  timeSpent: ITimeSpent;
  masteryByCourse: IMasteryByCourse[];
  recentImprovements: IRecentImprovement[];
}

export type IGetStudentProgressPayload = void;

export type IGetStudentProgressResponse = IBaseResponse<IStudentProgressData>;
