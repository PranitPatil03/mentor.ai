"use client";

import { addToSessionHistory } from "@/lib/actions/companion.action";
import { cn, configureAssistant, getSubjectColor } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

type SpeakerRole = "assistant" | "user" | null;

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
  const [activeSpeaker, setActiveSpeaker] = useState<SpeakerRole>(null);

  const transcriptRef = useRef<HTMLDivElement>(null);
  const speakingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setSpeakingRole = (role: SpeakerRole, holdForMs = 900) => {
    setActiveSpeaker(role);
    if (speakingTimeoutRef.current) {
      clearTimeout(speakingTimeoutRef.current);
      speakingTimeoutRef.current = null;
    }
    if (role) {
      speakingTimeoutRef.current = setTimeout(() => {
        setActiveSpeaker(null);
      }, holdForMs);
    }
  };

  useEffect(() => {
    return () => {
      if (speakingTimeoutRef.current) clearTimeout(speakingTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!transcriptRef.current) return;
    transcriptRef.current.scrollTo({
      top: transcriptRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
      setIsMuted(vapi.isMuted());
      setIsSpeaking(false);
      setSpeakingRole(null);
    };

    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
      setIsSpeaking(false);
      setSpeakingRole(null);
      addToSessionHistory(companionId);
    };

    const onMessage = (message: Message) => {
      if (message.type !== "transcript") return;
      const transcript = message.transcript?.trim();
      if (!transcript) return;
      const role: SavedMessage["role"] =
        message.role === "assistant" ? "assistant" : "user";
      if (message.transcriptType === "partial") {
        setSpeakingRole(role, 700);
        return;
      }
      if (message.transcriptType === "final") {
        setMessages((prev) => [...prev, { role, content: transcript }]);
        setSpeakingRole(role);
      }
    };

    const onError = (error: Error) => {
      console.log("Vapi error", error);
      setCallStatus((prev) =>
        prev === CallStatus.CONNECTING ? CallStatus.INACTIVE : prev
      );
    };

    const onSpeechStart = () => {
      setIsSpeaking(true);
      setSpeakingRole("assistant", 1300);
    };
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
  }, [companionId]);

  const toggleMicrophone = () => {
    if (callStatus !== CallStatus.ACTIVE) return;
    const currentMuted = vapi.isMuted();
    vapi.setMuted(!currentMuted);
    setIsMuted(!currentMuted);
  };

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);
    setMessages([]);
    setIsMuted(false);
    setIsSpeaking(false);
    setSpeakingRole(null);

    const assistantOverrides = {
      variableValues: { subject, topic, style },
      clientMessages: ["transcript"],
      serverMessages: [],
    };

    try {
      // @ts-expect-error Vapi typings are incomplete for custom assistant objects.
      await vapi.start(configureAssistant(voice, style), assistantOverrides);
    } catch (error) {
      console.log("Call start failed", error);
      setCallStatus(CallStatus.INACTIVE);
    }
  };

  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED);
    setIsSpeaking(false);
    setSpeakingRole(null);
    vapi.stop();
  };

  const tutorSpeaking = isSpeaking || activeSpeaker === "assistant";
  const userSpeaking = activeSpeaker === "user";
  const tutorName = name.split(" ")[0].replace(/[.,]/g, "");

  return (
    <section className="flex h-[calc(100vh-185px)] gap-4 max-md:flex-col">
      {/* ── Left: Chat card ── */}
      <div className="flex flex-1 flex-col rounded-2xl border border-black/8 bg-white">
        <div
          ref={transcriptRef}
          className="no-scrollbar flex-1 overflow-y-auto px-5 pt-5 pb-4"
        >
          <div className="flex flex-col gap-3">
            {messages.length === 0 && callStatus === CallStatus.INACTIVE && (
              <p className="text-sm text-gray-400 text-center pt-8">
                Press <span className="font-semibold text-gray-600">Start Session</span> to begin.
              </p>
            )}

            {messages.map((message, index) => {
              if (message.role === "assistant") {
                return (
                  <div key={index} className="flex justify-start">
                    <div className="max-w-[80%] rounded-2xl rounded-tl-md border border-black/6 bg-gray-50 px-4 py-3">
                      <p className="mb-0.5 text-xs font-semibold text-gray-400">{tutorName}</p>
                      <p className="text-[15px] leading-relaxed text-gray-900">{message.content}</p>
                    </div>
                  </div>
                );
              }
              return (
                <div key={index} className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-tr-md bg-gradient-to-b from-violet-500 to-indigo-600 px-4 py-3">
                    <p className="mb-0.5 text-xs font-semibold text-white/70">{userName}</p>
                    <p className="text-[15px] leading-relaxed text-white">{message.content}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Right: Controls sidebar ── */}
      <div className="flex w-full flex-col gap-4 md:w-[280px] md:min-w-[260px]">
        {/* Tutor profile card */}
        <div
          className={cn(
            "flex items-center gap-3 rounded-2xl border p-4 transition-all",
            tutorSpeaking
              ? "border-emerald-300 bg-emerald-50 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
              : "border-black/8 bg-white"
          )}
        >
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: getSubjectColor(subject) }}
          >
            <Image
              src={`/icons/${subject}.svg`}
              alt={subject}
              width={18}
              height={18}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900">{tutorName}</p>
            <p className={cn(
              "text-xs font-medium",
              tutorSpeaking ? "text-emerald-600" : "text-gray-400"
            )}>
              {tutorSpeaking ? "Speaking..." : "Tutor"}
            </p>
          </div>
          {tutorSpeaking && (
            <span className="flex gap-0.5">
              <span className="h-3 w-[3px] animate-bounce rounded-full bg-emerald-500 [animation-delay:0ms]" />
              <span className="h-3 w-[3px] animate-bounce rounded-full bg-emerald-500 [animation-delay:150ms]" />
              <span className="h-3 w-[3px] animate-bounce rounded-full bg-emerald-500 [animation-delay:300ms]" />
            </span>
          )}
        </div>

        {/* User profile card */}
        <div
          className={cn(
            "flex items-center gap-3 rounded-2xl border p-4 transition-all",
            userSpeaking
              ? "border-indigo-300 bg-indigo-50 shadow-[0_0_12px_rgba(99,102,241,0.2)]"
              : "border-black/8 bg-white"
          )}
        >
          {userImage ? (
            <img
              src={userImage}
              alt={userName}
              className="size-10 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
              {userName.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900">{userName}</p>
            <p className={cn(
              "text-xs font-medium",
              userSpeaking ? "text-indigo-600" : "text-gray-400"
            )}>
              {userSpeaking ? "Speaking..." : "You"}
            </p>
          </div>
          {userSpeaking && (
            <span className="flex gap-0.5">
              <span className="h-3 w-[3px] animate-bounce rounded-full bg-indigo-500 [animation-delay:0ms]" />
              <span className="h-3 w-[3px] animate-bounce rounded-full bg-indigo-500 [animation-delay:150ms]" />
              <span className="h-3 w-[3px] animate-bounce rounded-full bg-indigo-500 [animation-delay:300ms]" />
            </span>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Mic + session buttons */}
        <div className="flex flex-col gap-3">
          <button
            className={cn(
              "btn-mic justify-center",
              isMuted && "border-red-200 bg-red-50 text-red-600"
            )}
            onClick={toggleMicrophone}
            disabled={callStatus !== CallStatus.ACTIVE}
          >
            <Image
              src={isMuted ? "/icons/mic-off.svg" : "/icons/mic-on.svg"}
              alt="mic"
              width={22}
              height={22}
            />
            <span>{isMuted ? "Unmute" : "Mute"}</span>
          </button>

          <button
            className={cn(
              "w-full cursor-pointer rounded-xl px-6 py-3 text-sm font-medium transition-all duration-200",
              callStatus === CallStatus.ACTIVE
                ? "bg-red-600 text-white hover:bg-red-700"
                : "border border-violet-700 bg-gradient-to-b from-violet-500 to-indigo-600 text-white shadow-[0_4px_14px_rgba(109,40,217,0.4)] hover:scale-[1.02] hover:shadow-[0_6px_20px_rgba(109,40,217,0.6)]",
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
      </div>
    </section>
  );
};

export default CompanionComponent;
