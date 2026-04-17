"use client";

import { useEffect } from "react";
import { registerGlobalApiErrorHandler } from "@/lib/api";
import { useApiError } from "@/context/api-error.context";

export default function ApiErrorBridge() {
  const { showError } = useApiError();

  useEffect(() => {
    registerGlobalApiErrorHandler(showError);
  }, [showError]);

  return null;
}