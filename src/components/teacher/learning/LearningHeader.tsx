import { ChevronLeft } from 'lucide-react'

export default function LearningHeader() {
    return (
        <div className="bg-card shadow-[0_4px_4px_0] border shadow-primary/20 rounded-xl p-4 md:p-6 mb-4 md:mb-7">

            <button
                type="button"
                className="flex items-center text-sm md:text-base font-semibold text-primary hover:text-white mb-4 md:mb-6 transition-colors cursor-pointer"
            >
                <ChevronLeft className="mr-1 w-4 h-4 md:w-6 md:h-6" /> Back
            </button>

            <div className="flex justify-between items-start md:items-center">
                <div>
                    <h1 className="text-lg md:text-2xl font-semibold text-primary">
                        English
                    </h1>
                    <div>
                        <p className="text-sm md:text-base font-normal text-foreground">
                            Module 1: Reading & Comprehension
                        </p>
                        <p className="text-xs font-normal text-foreground mt-1">
                            Understanding Context
                        </p>
                    </div>
                </div>

                <div className="text-right hidden md:block">
                    <h2 className="text-2xl font-semibold text-primary">
                        Total Student&#3;s: 50
                    </h2>
                    <p className="text-base font-normal text-foreground">
                        Module 1: Reading & Comprehension
                    </p>
                    <p className="text-xs font-normal text-foreground">
                        Understanding Context
                    </p>
                </div>
            </div>
        </div>
    )
}
