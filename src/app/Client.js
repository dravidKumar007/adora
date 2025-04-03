"use client"; // ✅ Ensures this runs only on the client

import React, { useMemo } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import { AgoraRTCProvider } from "agora-rtc-react";

const Client = ({ children }) => {
  // ✅ Ensure the client instance is memoized
  const rtcClient = useMemo(() => AgoraRTC.createClient({ mode: "rtc", codec: "vp8" }), []);

  return <AgoraRTCProvider client={rtcClient}>{children}</AgoraRTCProvider>;
};

export default Client;
