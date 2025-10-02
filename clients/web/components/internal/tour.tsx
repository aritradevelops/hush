"use client";
import { useStartUpContext } from "@/contexts/startup-context";
import Joyride, { CallBackProps, Step, Styles } from "react-joyride";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const tourSteps: Step[] = [
  {
    target: "body",
    content:
      "Welcome to Hush! Let's take a quick tour to help you get started with secure, end-to-end encrypted messaging.",
    disableBeacon: true,
    title: "Welcome to Hush",
    placement: "center",
  },
  {
    target: "#add-contact",
    content: "Click here to add new contacts to your encrypted chat network.",
    disableBeacon: true,
    title: "Add Contacts",
  },
  {
    target: "#create-group",
    content: "Create secure group chats with multiple participants.",
    disableBeacon: true,
    title: "Create Groups",
  },
  {
    target: "#search-chats",
    content:
      "Quickly find and access your conversations using the search feature.",
    disableBeacon: true,
    title: "Search Chats",
  },
  {
    target: "#profile",
    content:
      "View and manage your profile information and encryption settings.",
    disableBeacon: true,
    placement: "right",
    title: "Your Profile",
  },
  {
    target: "#settings",
    content: "Customize your app preferences, themes, and security settings.",
    disableBeacon: true,
    placement: "right",
    title: "Settings",
  },
];

// Custom Tooltip component
const CustomTooltip = ({
  continuous,
  index,
  step,
  backProps,
  closeProps,
  primaryProps,
  skipProps,
  tooltipProps,
}: any) => {
  const isWelcomeStep = index === 0;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      {...tooltipProps}
      className={`bg-card text-card-foreground border border-border rounded-xl shadow-lg p-0 transition-all duration-300 transform ${
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
      } ${isWelcomeStep ? "max-w-md min-w-[320px]" : "max-w-sm min-w-[280px]"}`}
      style={{
        filter: "drop-shadow(0 25px 25px rgb(0 0 0 / 0.15))",
        ...tooltipProps.style,
      }}
    >
      {/* Header */}
      <div
        className={`px-6 ${
          isWelcomeStep ? "pt-8 pb-4" : "pt-6 pb-4"
        } border-b border-border/50`}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            {!isWelcomeStep && (
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Step {index + 1} of {tourSteps.length}
                </div>
              </div>
            )}
            {step.title && (
              <div className="flex items-center gap-2">
                {isWelcomeStep && <Sparkles className="h-5 w-5 text-primary" />}
                <h3
                  className={`font-semibold text-foreground ${
                    isWelcomeStep ? "text-lg" : "text-base"
                  }`}
                >
                  {step.title}
                </h3>
              </div>
            )}
          </div>
          <Button
            {...closeProps}
            variant="ghost"
            size="icon"
            className="h-8 w-8 ml-2 hover:bg-muted/50 -mt-1 transition-colors"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className={`px-6 ${isWelcomeStep ? "py-6" : "py-4"}`}>
        <div
          className={`text-muted-foreground leading-relaxed ${
            isWelcomeStep ? "text-base" : "text-sm"
          }`}
        >
          {step.content}
        </div>
      </div>

      {/* Progress bar */}
      {!isWelcomeStep && (
        <div className="px-6 pb-2">
          <div className="w-full bg-muted/30 rounded-full h-1 overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary to-primary/80 h-1 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((index + 1) / tourSteps.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div
        className={`px-6 ${
          isWelcomeStep ? "py-6" : "py-4"
        } bg-muted/20 rounded-b-xl`}
      >
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            {index > 0 && (
              <Button
                {...backProps}
                variant="outline"
                size="sm"
                className="gap-1.5 h-8 transition-all hover:scale-105"
              >
                <ChevronLeft className="h-3 w-3" />
                Back
              </Button>
            )}

            <Button
              {...skipProps}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground h-8 transition-all hover:scale-105"
            >
              Skip Tour
            </Button>
          </div>

          <Button
            {...primaryProps}
            size="sm"
            className="gap-1.5 h-8 transition-all hover:scale-105"
          >
            {index === tourSteps.length - 1
              ? "Get Started"
              : isWelcomeStep
              ? "Start Tour"
              : "Next"}
            {index < tourSteps.length - 1 && (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

function Tour() {
  const { showTour, completeTour } = useStartUpContext();
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCallback = (data: CallBackProps) => {
    if (data.status == "finished" || data.status == "skipped") {
      completeTour();
    }
  };

  // Get the effective theme only after mounting to avoid hydration issues
  const effectiveTheme = mounted
    ? theme === "system"
      ? systemTheme
      : theme
    : "light";
  const isDark = effectiveTheme === "dark";

  // Custom styles that respect the theme
  const customStyles: Partial<Styles> = {
    overlay: {
      backgroundColor: isDark ? "rgba(0, 0, 0, 0.85)" : "rgba(0, 0, 0, 0.6)",
      backdropFilter: "blur(2px)",
    },
    spotlight: {
      borderRadius: "var(--radius)",
      border: isDark
        ? "2px solid hsl(var(--primary) / 0.3)"
        : "2px solid hsl(var(--primary) / 0.2)",
      boxShadow: isDark
        ? "0 0 0 9999px rgba(0, 0, 0, 0.85), 0 0 20px hsl(var(--primary) / 0.3)"
        : "0 0 0 9999px rgba(0, 0, 0, 0.6), 0 0 20px hsl(var(--primary) / 0.2)",
    },
    beaconInner: {
      backgroundColor: "hsl(var(--primary))",
    },
    beaconOuter: {
      backgroundColor: "hsl(var(--primary) / 0.2)",
      border: "2px solid hsl(var(--primary) / 0.3)",
    },
  };

  return (
    <>
      {showTour && (
        <Joyride
          steps={tourSteps}
          callback={handleCallback}
          continuous={true}
          showProgress={false}
          showSkipButton={false}
          disableOverlayClose={true}
          disableScrolling={true}
          hideCloseButton={true}
          spotlightClicks={false}
          spotlightPadding={8}
          styles={customStyles}
          tooltipComponent={CustomTooltip}
          floaterProps={{
            styles: {
              floater: {
                filter: "none",
              },
            },
          }}
        />
      )}
    </>
  );
}

export default Tour;
