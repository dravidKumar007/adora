"use client";

import React, { useEffect, useState, useRef } from "react";
let AgoraRTC;
if (typeof window !== "undefined") {
  AgoraRTC = require("agora-rtc-sdk-ng");
}
import axios from "axios";
import { useSearchParams } from "next/navigation";
const APP_ID = "ca4318077d12448294005e36345e4b13"; // Replace with your Agora App ID
const DEEPGRAM_API_KEY = "bb9af2b7673317c737976a61245af36779bed10b"; // Replace with your Deepgram API Key

const VideoCall = ({ channelName, userId }) => {
  const [client, setClient] = useState(null);
  const [token, setToken] = useState("007eJxTYPjvtqXzwLTNKQ2RAo9+pSxOMmo3/L+2zJhlyYLuBdsk/21WYEhONDE2tDAwN08xNDIxsTCyNDEwME01NjM2MU01STI0Foh/l94QyMjQ06HExMgAgSA+G0NxYm5BTioDAwDazSBS");
  const [joined, setJoined] = useState(false);
  const [transcript, setTranscript] = useState(""); // Store transcript
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || 1;
 

  useEffect(() => {
    const agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    setClient(agoraClient);
  }, []);

  const joinMeeting = async () => {
    if (!client || !token) return;
    try {
      await client.join(APP_ID, "sample", "007eJxTYPjvtqXzwLTNKQ2RAo9+pSxOMmo3/L+2zJhlyYLuBdsk/21WYEhONDE2tDAwN08xNDIxsTCyNDEwME01NjM2MU01STI0Foh/l94QyMjQ06HExMgAgSA+G0NxYm5BTioDAwDazSBS",id);

      // Get audio & video tracks
      const tracks = await AgoraRTC.createMicrophoneAndCameraTracks();
      tracks[1].play(localVideoRef.current);
      await client.publish(tracks);

      setJoined(true);
      client.on("user-published", async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === "video") {
          user.videoTrack.play(remoteVideoRef.current);
        } else if (mediaType === "audio") {
          processAudio(user.audioTrack);
        }
      });
    } catch (error) {
      console.error("Error joining Agora:", error);
    }
  };

  // Process Audio & Send to Deepgram
  const processAudio = async (audioTrack) => {
    try {
      const response = await axios.post(
        "https://api.deepgram.com/v1/listen",
        audioTrack,
        {
          headers: {
            Authorization: `Token ${DEEPGRAM_API_KEY}`,
            "Content-Type": "audio/wav",
          },
        }
      );
      const { transcript } = response.data.results;

      // Update state to print on HTML
      if (transcript) {
        setTranscript(transcript);
      }
    } catch (error) {
      console.error("Error with speech-to-text:", error);
    }
  };

  const leaveMeeting = async () => {
    if (client) {
      await client.leave();
      setJoined(false);
      setTranscript(""); // Clear transcript on leave
    }
  };

  return (
    <div>
      <h2>Agora Video Call with Live Transcript</h2>
      <div>
        <div style={{ width: "300px", height: "200px", backgroundColor: "#000" }} ref={localVideoRef}></div>
        <div style={{ width: "300px", height: "200px", backgroundColor: "#222" }} ref={remoteVideoRef}></div>
      </div>
      {!joined ? (
        <button onClick={joinMeeting}>Join Call</button>
      ) : (
        <button onClick={leaveMeeting}>Leave Call</button>
      )}

      <h3>Live Transcript:</h3>
      {/* Display the transcript */}
      {transcript && (
        <div style={{ marginTop: "20px", padding: "10px", backgroundColor: "#f4f4f4", borderRadius: "5px" }}>
          <p>{transcript}</p>
        </div>
      )}
    </div>
  );
};

export default VideoCall;
