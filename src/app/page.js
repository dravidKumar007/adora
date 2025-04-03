"use client";

import React, { Suspense } from "react";
import VideoCall from "./Meeting"; // Ensure this is your correct import

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VideoCall />
    </Suspense>
  );
}
