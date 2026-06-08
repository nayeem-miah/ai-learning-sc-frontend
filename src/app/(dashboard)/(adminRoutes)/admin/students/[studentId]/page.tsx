import StudentDetail from "@/components/admin/StudentDetail";
import { use } from "react";

export default function StudentDetailPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = use(params);

  return (
    <div className="">
      <StudentDetail studentId={studentId} />
    </div>
  );
}
