"use client";

import React, { useEffect, useState, useRef } from "react";
let AgoraRTC;
if (typeof window !== "undefined") {
  AgoraRTC = require("agora-rtc-sdk-ng");
}
import { useSearchParams } from "next/navigation"; 
const APP_ID = "ca4318077d12448294005e36345e4b13"; // Replace with your Agora App ID
const SERVER_URL = "http://localhost:8000"; // Your FastAPI backend

const VideoCall = ({ channelName, userId }) => {
  const [client, setClient] = useState(null);
  
  const [token, setToken] = useState("007eJxTYPjvtqXzwLTNKQ2RAo9+pSxOMmo3/L+2zJhlyYLuBdsk/21WYEhONDE2tDAwN08xNDIxsTCyNDEwME01NjM2MU01STI0Foh/l94QyMjQ06HExMgAgSA+G0NxYm5BTioDAwDazSBS");
  const [joined, setJoined] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [localTracks, setLocalTracks] = useState([]);
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || 1;
  const fetchToken = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/generate-token?channel_name=${"sample"}&uid=${1}`);
      const data = await response.json();
      setToken(data.token);
    } catch (error) {
      console.error("Error fetching Agora token:", error);
    }
  };
  
  useEffect(() => {
    const agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    setClient(agoraClient);
     fetchToken();
  }, [

  ]);

  const joinMeeting = async () => {
    if (!client || !token) return;
    console.log("Join")

    fetchToken();
    try {
      console.log("Joined")
      const response = await axios.get("http://localhost:8000/generate-token", {
        params: { channel_name: "sample", uid: id }, // Axios handles query params automatically
      });
  
      const { token } = response.data;
      setToken(token);
      console.log(token);
    } catch (error) {
      console.error("Error fetching Agora token:", error);
    }

    try {
      await client.join(APP_ID, "sample",token, id);

      const tracks = await AgoraRTC.createMicrophoneAndCameraTracks();
      setLocalTracks(tracks);

      if (localVideoRef.current) {
        tracks[1].play(localVideoRef.current); // Play local video
      }

      await client.publish(tracks);
      setJoined(true);

      client.on("user-published", async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === "video" && remoteVideoRef.current) {
          user.videoTrack.play(remoteVideoRef.current); // Play remote video
        }
      });

      console.log("Joined meeting successfully!");
    } catch (error) {
      console.error("Error joining Agora channel:", error);
    }
  };

  const leaveMeeting = async () => {
    if (client) {
      localTracks.forEach((track) => track.stop() && track.close());
      await client.leave();
      setJoined(false);
    }
  };

  return (
    <div>
      <h2>Agora Video Call</h2>
      <div>
        <div style={{ width: "300px", height: "200px", backgroundColor: "#000" }} ref={localVideoRef}></div>
        <div style={{ width: "300px", height: "200px", backgroundColor: "#222" }} ref={remoteVideoRef}></div>
      </div>
      {!joined ? (
        <button className="bg-white" onClick={joinMeeting}>Join Call</button>
      ) : (
        <button onClick={leaveMeeting}>Leave Call</button>
      )}
    </div>
  );
};

export default VideoCall;
