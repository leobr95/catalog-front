"use client";

import React from "react";
import { Spin } from "antd";
import { useAppSelector } from "@/app/store/hooks";
import { selectLoading } from "@/app/store/slices/uiSlice";

export default function GlobalLoading() {
  const loading = useAppSelector(selectLoading);
  if (!loading) return null;

  return (
    <div className="loading-overlay" aria-live="polite" aria-busy="true">
      <Spin size="large" />
    </div>
  );
}
