"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

interface JoinToastProps {
  message: string;
}

export default function JoinToast({ message }: JoinToastProps) {
  const hasToasted = useRef(false);

  useEffect(() => {
    if (!hasToasted.current) {
      toast.warning(message);
      hasToasted.current = true;
    }
  }, [message]);

  return null;
}
