"use client"
import CourseDetails from "@/components/teacher/dashboard/CourseDetails";
import { use } from "react";

export default function CourseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    return (
        <CourseDetails passedId={id} />
    )
}
