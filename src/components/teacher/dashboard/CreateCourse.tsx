"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z
  .object({
    course_name: z.string().min(1, "Course name is required"),
    subject: z.string().min(1, "Subject is required"),
    target_grade_level: z.string().min(1, "Target grade / level is required"),
    course_plan: z.enum(["semester", "full_year"]),
    semester_count: z.number().min(1).max(4),
    diagnostic_test_before_course: z.boolean(),
    retesting_allowed: z.boolean(),
    retesting_count: z.number().min(0).max(10),
    quizzes_per_module: z.number().min(0).max(20),
    midterm_examination: z.boolean(),
    final_examination: z.boolean(),
    total_quiz_questions: z.number().min(1),
    mastery_requirement: z.number().min(1).max(100),
    total_modules: z.number().min(1),
    estimated_duration_min_per_class: z.number().min(1),
  })
  .refine(
    (data) => (data.retesting_allowed ? true : data.retesting_count === 0),
    {
      path: ["retesting_count"],
      message: "Retesting count must be 0 when retesting is off",
    },
  );

type FormValues = z.infer<typeof formSchema>;

type Payload = {
  course_name: string;
  subject: string;
  target_grade_level: string;
  course_length: string;
  semester_count: number;
  diagnostic_test_before_course: boolean;
  retesting_allowed: boolean;
  retesting_count: number;
  quizzes_per_module: number;
  midterm_examination: boolean;
  final_examination: boolean;
  total_quiz_questions: number;
  mastery_requirement: number;
  total_modules: number;
  estimated_duration_min_per_class: number;
};

const gradeOptions = [
  { label: "Grade 6", value: "grade_6" },
  { label: "Grade 7", value: "grade_7" },
  { label: "Grade 8", value: "grade_8" },
  { label: "Grade 9", value: "69831632106883775a56936e" },
  { label: "Grade 10", value: "grade_10" },
];

function cn(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="border-b border-[#3b2c14] pb-4">
      <h2 className="text-lg font-bold uppercase text-[#d7b368]">{title}</h2>
      <p className="mt-2 text-sm text-zinc-400">{subtitle}</p>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold uppercase text-white">
        {label}
      </label>
      {children}
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </div>
  );
}

function TextInput({
  error,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean;
}) {
  return (
    <input
      {...props}
      className={cn(
        "h-12 w-full rounded-md border bg-[#0b0b0b] px-4 text-sm text-white outline-none transition",
        error ? "border-red-500" : "border-[#6b5225] focus:border-[#d7b368]",
        props.disabled ? "cursor-not-allowed opacity-60" : "",
        className,
      )}
    />
  );
}

function SelectInput({
  error,
  children,
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  error?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      <select
        {...props}
        className={cn(
          "h-12 w-full appearance-none rounded-md border bg-[#0b0b0b] px-4 pr-10 text-sm text-white outline-none transition",
          error ? "border-red-500" : "border-[#6b5225] focus:border-[#d7b368]",
          className,
        )}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#d7b368]" />
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-7 w-12 rounded-full transition",
        checked ? "bg-[#d7b368]" : "bg-[#2b2419]",
      )}
    >
      <span
        className={cn(
          "absolute top-1 h-5 w-5 rounded-full transition",
          checked ? "left-6 bg-[#111111]" : "left-1 bg-white",
        )}
      />
    </button>
  );
}

const CreateCourse = () => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      course_name: "English 101",
      subject: "English",
      target_grade_level: "69831632106883775a56936e",
      course_plan: "full_year",
      semester_count: 3,
      diagnostic_test_before_course: true,
      retesting_allowed: true,
      retesting_count: 2,
      quizzes_per_module: 3,
      midterm_examination: true,
      final_examination: true,
      total_quiz_questions: 50,
      mastery_requirement: 75,
      total_modules: 5,
      estimated_duration_min_per_class: 45,
    },
  });

  const coursePlan = watch("course_plan");
  const quizzesPerModule = watch("quizzes_per_module");
  const diagnosticTest = watch("diagnostic_test_before_course");
  const retestingAllowed = watch("retesting_allowed");
  const midtermExam = watch("midterm_examination");
  const finalExam = watch("final_examination");

  const onSubmit = (values: FormValues) => {
    const payload: Payload = {
      course_name: values.course_name,
      subject: values.subject,
      target_grade_level: values.target_grade_level,
      course_length:
        values.course_plan === "full_year"
          ? "12 month"
          : `${values.semester_count * 3} month`,
      semester_count: values.semester_count,
      diagnostic_test_before_course: values.diagnostic_test_before_course,
      retesting_allowed: values.retesting_allowed,
      retesting_count: values.retesting_allowed ? values.retesting_count : 0,
      quizzes_per_module: values.quizzes_per_module,
      midterm_examination: values.midterm_examination,
      final_examination: values.final_examination,
      total_quiz_questions: values.total_quiz_questions,
      mastery_requirement: values.mastery_requirement,
      total_modules: values.total_modules,
      estimated_duration_min_per_class: values.estimated_duration_min_per_class,
    };

    console.log(payload);
  };

  return (
    <div className="min-h-screen bg-[#050505] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold sm:text-4xl">AI Course Builder</h1>
          <p className="mt-2 text-sm text-zinc-400 sm:text-base">
            Build your course with AI
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <section className="rounded-[22px] border border-[#3b2c14] bg-[#121212] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.4)] sm:p-6">
              <SectionHeader
                title="Course Basics"
                subtitle="Define the fundamental course structure"
              />

              <div className="mt-6 space-y-6">
                <Field label="Course Name" error={errors.course_name?.message}>
                  <TextInput
                    {...register("course_name")}
                    error={!!errors.course_name}
                  />
                </Field>

                <Field label="Subject" error={errors.subject?.message}>
                  <TextInput
                    {...register("subject")}
                    error={!!errors.subject}
                  />
                </Field>

                <Field
                  label="Target Grade / Level"
                  error={errors.target_grade_level?.message}
                >
                  <SelectInput
                    {...register("target_grade_level")}
                    error={!!errors.target_grade_level}
                  >
                    {gradeOptions.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </SelectInput>
                </Field>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold uppercase text-white">
                    Course Length
                  </label>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() =>
                        setValue("course_plan", "semester", {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                      className={cn(
                        "h-12 rounded-md border text-sm font-semibold transition",
                        coursePlan === "semester"
                          ? "border-[#d7b368] bg-[#d7b368] text-[#111111]"
                          : "border-[#6b5225] bg-[#0b0b0b] text-white",
                      )}
                    >
                      Semester
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setValue("course_plan", "full_year", {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                      className={cn(
                        "h-12 rounded-md border text-sm font-semibold transition",
                        coursePlan === "full_year"
                          ? "border-[#d7b368] bg-[#d7b368] text-[#111111]"
                          : "border-[#6b5225] bg-[#0b0b0b] text-white",
                      )}
                    >
                      Full Year
                    </button>
                  </div>
                </div>

                <Field
                  label={
                    coursePlan === "semester"
                      ? "Semester Length (Count)"
                      : "Semester Count"
                  }
                  error={errors.semester_count?.message}
                >
                  <SelectInput
                    value={String(watch("semester_count"))}
                    onChange={(e) =>
                      setValue("semester_count", Number(e.target.value), {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    error={!!errors.semester_count}
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                  </SelectInput>
                </Field>

                <div className="border-t border-[#2b2419] pt-5">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold uppercase text-zinc-300">
                      Diagnostic Test Before Course
                    </p>
                    <Toggle
                      checked={diagnosticTest}
                      onChange={(value) =>
                        setValue("diagnostic_test_before_course", value, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                      label="Diagnostic Test Before Course"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[22px] border border-[#3b2c14] bg-[#121212] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.4)] sm:p-6">
              <SectionHeader
                title="AI Configuration"
                subtitle="Define curriculum structure and assessment rules"
              />

              <div className="mt-6 space-y-6">
                <div className="border-b border-[#2b2419] pb-6">
                  <h3 className="mb-4 text-lg font-bold uppercase text-[#d7b368]">
                    Assessment Rules
                  </h3>

                  <Field label="Quizzes Per Module">
                    <div className="space-y-3">
                      <div className="flex justify-end">
                        <span className="text-sm font-semibold text-[#d7b368]">
                          {quizzesPerModule}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={20}
                        step={1}
                        value={quizzesPerModule}
                        onChange={(e) =>
                          setValue(
                            "quizzes_per_module",
                            Number(e.target.value),
                            {
                              shouldDirty: true,
                              shouldValidate: true,
                            },
                          )
                        }
                        className="h-3 w-full cursor-pointer accent-[#d7b368]"
                      />
                    </div>
                  </Field>

                  <div className="mt-5 space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-medium uppercase text-white">
                        Midterm Examination
                      </p>
                      <Toggle
                        checked={midtermExam}
                        onChange={(value) =>
                          setValue("midterm_examination", value, {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }
                        label="Midterm Examination"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-medium uppercase text-white">
                        Final Examination
                      </p>
                      <Toggle
                        checked={finalExam}
                        onChange={(value) =>
                          setValue("final_examination", value, {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }
                        label="Final Examination"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-b border-[#2b2419] pb-6">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-medium uppercase text-white">
                      Retesting Allowed
                    </p>
                    <Toggle
                      checked={retestingAllowed}
                      onChange={(value) => {
                        setValue("retesting_allowed", value, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });

                        if (!value) {
                          setValue("retesting_count", 0, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                        }
                      }}
                      label="Retesting Allowed"
                    />
                  </div>

                  <div className="mt-4">
                    <Field
                      label="Retesting Count"
                      error={errors.retesting_count?.message}
                    >
                      <TextInput
                        type="number"
                        min={0}
                        value={watch("retesting_count")}
                        disabled={!retestingAllowed}
                        onChange={(e) =>
                          setValue("retesting_count", Number(e.target.value), {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }
                        error={!!errors.retesting_count}
                      />
                    </Field>
                  </div>
                </div>

                <div className="space-y-5">
                  <h3 className="text-lg font-bold uppercase text-[#d7b368]">
                    Learning Benchmarks
                  </h3>

                  <Field
                    label="Mastery Requirement"
                    error={errors.mastery_requirement?.message}
                  >
                    <TextInput
                      type="number"
                      min={1}
                      max={100}
                      value={watch("mastery_requirement")}
                      onChange={(e) =>
                        setValue(
                          "mastery_requirement",
                          Number(e.target.value),
                          {
                            shouldDirty: true,
                            shouldValidate: true,
                          },
                        )
                      }
                      error={!!errors.mastery_requirement}
                    />
                  </Field>

                  <Field
                    label="Total Modules"
                    error={errors.total_modules?.message}
                  >
                    <TextInput
                      type="number"
                      min={1}
                      value={watch("total_modules")}
                      onChange={(e) =>
                        setValue("total_modules", Number(e.target.value), {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                      error={!!errors.total_modules}
                    />
                  </Field>

                  <Field
                    label="Total Quiz Questions"
                    error={errors.total_quiz_questions?.message}
                  >
                    <TextInput
                      type="number"
                      min={1}
                      value={watch("total_quiz_questions")}
                      onChange={(e) =>
                        setValue(
                          "total_quiz_questions",
                          Number(e.target.value),
                          {
                            shouldDirty: true,
                            shouldValidate: true,
                          },
                        )
                      }
                      error={!!errors.total_quiz_questions}
                    />
                  </Field>

                  <Field
                    label="Estimated Duration Min Per Class"
                    error={errors.estimated_duration_min_per_class?.message}
                  >
                    <TextInput
                      type="number"
                      min={1}
                      value={watch("estimated_duration_min_per_class")}
                      onChange={(e) =>
                        setValue(
                          "estimated_duration_min_per_class",
                          Number(e.target.value),
                          {
                            shouldDirty: true,
                            shouldValidate: true,
                          },
                        )
                      }
                      error={!!errors.estimated_duration_min_per_class}
                    />
                  </Field>
                </div>
              </div>
            </section>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-12 items-center gap-2 rounded-2xl bg-[#d7b368] px-6 text-sm font-semibold text-[#111111] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Generating..." : "Generate Course"}
              <ArrowRight size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourse;
