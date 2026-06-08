import Learning from "@/components/teacher/learning/Learning";

export default async function LearningPage({ searchParams }: { searchParams: Promise<{ courseId: string; moduleId: string; attendanceId: string }> }) {
    const { courseId, moduleId, attendanceId } = await searchParams;
    return (
        <Learning courseId={courseId} moduleId={moduleId} attendanceId={attendanceId} />
    )
}
