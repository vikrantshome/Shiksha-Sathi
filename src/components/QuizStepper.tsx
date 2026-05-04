"use client";

interface Step {
  label: string;
  href?: string;
  description?: string;
  status?: "completed" | "active" | "pending" | "locked";
}

interface QuizStepperProps {
  currentStep?: 1 | 2 | 3;
  onNavigate?: (step: 1 | 2 | 3) => void;
}

export default function QuizStepper({ currentStep = 2, onNavigate }: QuizStepperProps) {
  const steps: Step[] = [
    { label: "Select Questions", href: "/teacher/question-bank?context=quiz", description: "Choose from Question Bank" },
    { label: "Configure", description: "Set quiz parameters" },
    { label: "Publish", description: "Go live" },
  ];

  const getStepStatus = (index: number): Step["status"] => {
    const stepNum = index + 1;
    if (stepNum < currentStep) return "completed";
    if (stepNum === currentStep) return "active";
    return "pending";
  };

   return (
     <nav aria-label="Quiz creation progress" className="mb-6">
       <ol className="flex items-stretch gap-0 overflow-x-auto pb-1 scrollbar-hide">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const status = getStepStatus(index);

          return (
            <li key={step.label} className="flex items-center shrink-0 flex-1 min-w-[100px] sm:min-w-[120px]">
              <div className="flex flex-col items-center w-full">
                 {/* Step Circle */}
                 <button
                   type="button"
                   onClick={() => step.href && onNavigate && onNavigate(1)}
                   disabled={!step.href}
                   aria-current={status === "active" ? "step" : undefined}
                   aria-label={`Step ${index + 1}: ${step.label}${status === "completed" ? " (completed)" : status === "active" ? " (current)" : ""}`}
                   className={`
                     relative flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300
                     ${status === "completed"
                       ? "bg-primary text-on-primary shadow-sm shadow-primary/15 hover:shadow-md hover:shadow-primary/20 cursor-pointer"
                       : status === "active"
                       ? "bg-gradient-to-br from-primary-container to-primary-container/70 text-primary shadow-xl shadow-primary/15 ring-[2px] ring-primary/15"
                       : "bg-surface-container text-on-surface-variant cursor-default shadow-sm"}
                     ${step.href ? "hover:scale-105 active:scale-95" : ""}
                   `}
                >
                  {status === "completed" ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : status === "active" ? (
                    <span className="text-sm font-bold">{index + 1}</span>
                  ) : (
                    <span className="text-sm font-medium opacity-60">{index + 1}</span>
                  )}
                </button>

{/* Step Label */}
                 <span className={`
                   mt-1 text-[9px] font-medium text-center transition-colors duration-200 leading-tight
                   ${status === "completed" ? "text-primary font-semibold" : ""}
                   ${status === "active" ? "text-on-surface font-bold" : ""}
                   ${status === "pending" ? "text-on-surface-variant/60" : ""}
                 `}>
                  {step.label}
                </span>

      {/* Step Description */}
      {/* Removed to reduce height — description still available on hover/long-press via aria-label if needed */}
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div className="flex items-center w-5 sm:w-6 shrink-0 self-center mb-2">
                  <div
                    className={`
                      w-full h-[2px] transition-all duration-500 rounded-full
                      ${status === "completed" 
                        ? "bg-gradient-to-r from-primary to-primary-light shadow-sm shadow-primary/10" 
                        : "bg-outline-variant/20"}
                    `}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {/* Progress Bar */}
      <div className="mt-2 h-1.5 bg-surface-container-low rounded-full overflow-hidden shadow-inner shadow-black/3">
        <div
          className="h-full bg-gradient-to-r from-primary via-primary-light to-primary rounded-full transition-all duration-700 ease-out shadow-sm shadow-primary/15"
          style={{ width: currentStep === 1 ? "33%" : currentStep === 2 ? "66%" : "100%" }}
        />
      </div>
    </nav>
  );
}