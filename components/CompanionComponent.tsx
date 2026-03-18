"use client";
import { cn, configureAssistant, getSubjectColor } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import soundwaves from "@/constants/soundwaves.json";
import { addToSessionHistory } from "@/lib/actions/companion.action";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

const CompanionComponent = ({
  companionId,
  subject,
  topic,
  name,
  userName,
  userImage,
  style,
  voice,
}: CompanionComponentProps) => {
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  useEffect(() => {
    if (lottieRef) {
      if (isSpeaking) {
        lottieRef.current?.play();
      } else {
        lottieRef.current?.stop();
      }
    }
  }, [isSpeaking, lottieRef]);

  useEffect(() => {
    const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
      addToSessionHistory(companionId);
    };

    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [newMessage, ...prev]);
      }
    };
    const onError = (error: Error) => console.log("Error", error);

    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("error", onError);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("error", onError);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
    };
  }, []);

  const toggleMicrophone = () => {
    const isMuted = vapi.isMuted();
    vapi.setMuted(!isMuted);
    setIsMuted(!isMuted);
  };

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);

    const assistantOverrides = {
      variableValues: { subject, topic, style },
      clientMessages: ["transcript"],
      serverMessages: [],
    };

    // @ts-expect-error
    vapi.start(configureAssistant(voice, style), assistantOverrides);
  };

  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  return (
    <section className="flex flex-col h-[calc(100vh-180px)]">
      {/* Top bar: companion display + controls */}
      <section className="flex gap-4 max-sm:flex-col">
        {/* COMPANION DISPLAY */}
        <div className="companion-section">
          <div
            className="companion-avatar"
            style={{ backgroundColor: getSubjectColor(subject) }}
          >
            <div
              className={cn(
                "absolute transition-opacity duration-1000",
                callStatus === CallStatus.FINISHED ||
                  callStatus === CallStatus.INACTIVE
                  ? "opacity-1001"
                  : "opacity-0",
                callStatus === CallStatus.CONNECTING &&
                "opacity-100 animate-pulse"
              )}
            >
              <Image
                src={`/icons/${subject}.svg`}
                alt={subject}
                width={100}
                height={100}
                className="max-sm:w-fit"
              />
            </div>
            <div
              className={cn(
                "absolute transition-opacity duration-1000",
                callStatus === CallStatus.ACTIVE ? "opacity-100" : "opacity-0"
              )}
            >
              <Lottie
                lottieRef={lottieRef}
                animationData={soundwaves}
                autoplay={false}
                className="companion-lottie"
              />
            </div>
          </div>
          <p className="font-semibold text-lg">{name}</p>
        </div>

        {/* CONTROLS: mic toggle + start/end */}
        <div className="flex flex-col gap-3 w-[280px] max-sm:w-full justify-center">
          <button
            className="btn-mic"
            onClick={toggleMicrophone}
            disabled={callStatus !== CallStatus.ACTIVE}
          >
            <Image
              src={isMuted ? "/icons/mic-off.svg" : "/icons/mic-on.svg"}
              alt="mic"
              width={20}
              height={20}
            />
            <span className="text-gray-700">
              {isMuted ? "Unmute" : "Mute"}
            </span>
          </button>

          <button
            className={cn(
              "rounded-xl py-3 cursor-pointer transition-all duration-200 w-full font-medium text-sm",
              callStatus === CallStatus.ACTIVE
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-gradient-to-b from-violet-500 to-indigo-600 border border-violet-700 text-white shadow-[0_4px_14px_rgba(109,40,217,0.4)] hover:scale-[1.02] hover:shadow-[0_6px_20px_rgba(109,40,217,0.6)]",
              callStatus === CallStatus.CONNECTING && "animate-pulse"
            )}
            onClick={
              callStatus === CallStatus.ACTIVE ? handleDisconnect : handleCall
            }
          >
            {callStatus === CallStatus.ACTIVE
              ? "End Session"
              : callStatus === CallStatus.CONNECTING
                ? "Connecting..."
                : "Start Session"}
          </button>
        </div>
      </section>

      {/* TRANSCRIPT — messages flow top to bottom */}
      <section className="transcript">
        <div className="transcript-message no-scrollbar">
          {messages.map((message, index) => {
            if (message.role === "assistant") {
              return (
                <div key={index} className="flex justify-start">
                  <div className="max-w-[75%] rounded-2xl rounded-tl-md bg-gray-50 border border-black/6 px-4 py-3">
                    <p className="text-xs font-semibold text-gray-400 mb-0.5">
                      {name.split(" ")[0].replace(/[.,]/g, "")}
                    </p>
                    <p className="text-gray-900 text-[15px] leading-relaxed">{message.content}</p>
                  </div>
                </div>
              );
            } else {
              return (
                <div key={index} className="flex justify-end">
                  <div className="max-w-[75%] rounded-2xl rounded-tr-md bg-gradient-to-b from-violet-500 to-indigo-600 px-4 py-3">
                    <p className="text-xs font-semibold text-white/60 mb-0.5">{userName}</p>
                    <p className="text-white text-[15px] leading-relaxed">{message.content}</p>
                  </div>
                </div>
              );
            }
          })}
        </div>

        <div className="transcript-fade" />
      </section>
    </section>
  );
};

export default CompanionComponent;
