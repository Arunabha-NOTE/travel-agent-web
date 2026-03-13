"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type TypingTextProps = {
  text: string;
  className?: string;
  speed?: number;
  startDelay?: number;
};

export function TypingText({
  text,
  className,
  speed = 65,
  startDelay = 150,
}: TypingTextProps) {
  const [visibleLength, setVisibleLength] = useState(0);

  useEffect(() => {
    setVisibleLength(0);

    const timeoutId = window.setTimeout(() => {
      const intervalId = window.setInterval(() => {
        setVisibleLength((current) => {
          if (current >= text.length) {
            window.clearInterval(intervalId);
            return current;
          }

          return current + 1;
        });
      }, speed);
    }, startDelay);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [speed, startDelay, text]);

  return <span className={cn(className)}>{text.slice(0, visibleLength)}</span>;
}
