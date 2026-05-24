import { cn } from "@/lib/utils/cn";

type Props = {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
};

/**
 * Minimal step progress indicator – dots connected by thin lines.
 * Uses aria-current="step" on the active dot for screen-reader support.
 */
export function StepProgressBar({ currentStep, totalSteps, stepLabels }: Props) {
  return (
    <nav aria-label="Onboarding progress" className="w-full">
      <div className="flex items-center">
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepNum = i + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;

          return (
            <div key={stepNum} className="flex items-center flex-1 last:flex-none">
              <div
                role="img"
                aria-current={isCurrent ? "step" : undefined}
                aria-label={stepLabels[i]}
                className={cn(
                  "rounded-full flex-shrink-0 transition-all duration-300",
                  isCompleted && "h-2 w-2 bg-slate-700",
                  isCurrent && "h-2.5 w-2.5 bg-slate-900",
                  !isCompleted && !isCurrent && "h-2 w-2 bg-slate-200"
                )}
              />
              {stepNum < totalSteps && (
                <div
                  className={cn(
                    "h-px flex-1 mx-2 transition-all duration-300",
                    isCompleted ? "bg-slate-700" : "bg-slate-200"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
