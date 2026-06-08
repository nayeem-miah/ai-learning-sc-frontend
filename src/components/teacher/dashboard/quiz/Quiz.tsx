"use client";
import { cn } from "@/utils/utils";
import { motion } from "motion/react";
import { useState } from "react";

export interface QuizOption {
  id: number;
  text: string;
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer?: string;
}

interface QuizProps {
  questions: QuizQuestion[];
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const questionVariants = {
  hidden: {
    x: 20,
    opacity: 0.5,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.2,
    },
  },
};

// const containerVariants = {
//     hidden: {},
//     visible: {
//         transition: {
//             staggerChildren: 0.12
//         }
//     }
// };

// const questionVariants = {
//     hidden: {
//         x: 60,
//         opacity: 0
//     },
//     visible: {
//         x: 0,
//         opacity: 1,
//         transition: {
//             duration: 0.6,
//             ease: [0.22, 1, 0.36, 1]
//         }
//     }
// };

export default function Quiz({ questions }: QuizProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, boolean>
  >({});

  const handleSelectAnswer = (
    questionId: string,
    optionIndex: number,
  ): void => {
    const key = `${questionId}-${optionIndex}`;
    setSelectedAnswers((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {questions.map((q, qIndex) => {
        const options = [
          { label: "A", text: q.optionA },
          { label: "B", text: q.optionB },
          { label: "C", text: q.optionC },
          { label: "D", text: q.optionD },
        ];

        return (
          <motion.div
            key={q.id}
            variants={questionVariants}
            className="bg-card shadow-[0_4px_4px_0] shadow-primary/20 rounded-xl p-5 md:p-8 border border-primary/10"
          >
            <div className="pb-4 mb-4.5">
              <p className="text-xs md:text-sm text-secondary font-normal mb-4.5">
                Question {qIndex + 1}
              </p>
              <h2 className="text-sm md:text-base font-normal text-foreground">
                {q.questionText}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {options.map((option, oIndex) => {
                const isSelected = !!selectedAnswers[`${q.id}-${oIndex}`];

                return (
                  <button
                    key={oIndex}
                    onClick={() => handleSelectAnswer(q.id, oIndex)}
                    className={cn(
                      "w-full text-left p-4 rounded-xl border transition-all duration-200 group flex items-center gap-3 cursor-pointer",
                      isSelected
                        ? "bg-primary/10 border-primary shadow-[0_0_10px_rgba(var(--primary),0.1)]"
                        : "bg-transparent border-primary/20 hover:border-primary/50 hover:bg-primary/5",
                    )}
                  >
                    <span className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border transition-colors",
                      isSelected 
                        ? "bg-primary text-black border-primary" 
                        : "bg-primary/10 text-primary border-primary/20 group-hover:bg-primary/20"
                    )}>
                      {option.label}
                    </span>
                    <span
                      className={cn(
                        "text-xs md:text-sm font-normal transition-colors",
                        isSelected
                          ? "text-primary font-medium"
                          : "text-foreground/80",
                      )}
                    >
                      {option.text}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        );
      })}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #e6b35a;
        }
      `}</style>
    </motion.div>
  );
}
