import { IAgoraRTCClient, createClient, createMicrophoneAndCameraTracks } from "agora-rtc-sdk-ng";

const AGORA_APP_ID = "your_agora_app_id"; // Store in .env.local in production

const client = createClient({ mode: "rtc", codec: "vp8" });

export const joinMeeting = async (channelName, token, uid) => {
    await client.join(AGORA_APP_ID, channelName, token, uid);
    const tracks = await createMicrophoneAndCameraTracks();
    await client.publish(tracks);
    return tracks;
};

export const leaveMeeting = async (tracks) => {
    tracks.forEach((track) => track.close());
    await client.leave();
};
