"use client";

import { addToSessionHistory } from "@/lib/actions/companion.action";
import { cn, configureAssistant, getSubjectColor } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

type SpeakerRole = "assistant" | "user" | null;

interface PartialTranscript {
  role: "assistant" | "user";
  content: string;
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
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [activeSpeaker, setActiveSpeaker] = useState<SpeakerRole>(null);
  const [partial, setPartial] = useState<PartialTranscript | null>(null);

  const transcriptRef = useRef<HTMLDivElement>(null);
  const speakingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sessionActive =
    callStatus === CallStatus.ACTIVE ||
    callStatus === CallStatus.CONNECTING ||
    callStatus === CallStatus.FINISHED;

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
  }, [messages, partial]);

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
      setPartial(null);
      addToSessionHistory(companionId);
      setTimeout(() => router.push("/mentors"), 600);
    };

    const onMessage = (message: Message) => {
      if (message.type !== "transcript") return;
      const transcript = message.transcript?.trim();
      if (!transcript) return;

      const role: "assistant" | "user" =
        message.role === "assistant" ? "assistant" : "user";

      if (message.transcriptType === "partial") {
        setPartial({ role, content: transcript });
        setSpeakingRole(role, 700);
        return;
      }

      if (message.transcriptType === "final") {
        setPartial(null);
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
  }, [companionId, router]);

  const toggleMicrophone = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (callStatus !== CallStatus.ACTIVE) return;
    try {
      const currentMuted = vapi.isMuted();
      vapi.setMuted(!currentMuted);
      setIsMuted(!currentMuted);
    } catch (err) {
      console.log("Mic toggle failed", err);
    }
  };

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);
    setMessages([]);
    setPartial(null);
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
    setPartial(null);
    vapi.stop();
  };

  const tutorSpeaking = isSpeaking || activeSpeaker === "assistant";
  const userSpeaking = activeSpeaker === "user";
  const tutorName = name.split(" ")[0].replace(/[.,]/g, "");

  /* ─── Tutor profile card ─── */
  const TutorCard = ({ big }: { big?: boolean }) => (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border p-4 transition-all",
        big && "flex-col gap-4 p-6 text-center",
        tutorSpeaking
          ? "border-emerald-300 bg-emerald-50 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
          : "border-black/8 bg-white"
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-xl",
          big ? "size-20" : "size-10"
        )}
        style={{ backgroundColor: getSubjectColor(subject) }}
      >
        <Image
          src={`/icons/${subject}.svg`}
          alt={subject}
          width={big ? 36 : 18}
          height={big ? 36 : 18}
        />
      </div>
      <div className={cn("min-w-0", big ? "flex flex-col items-center" : "flex-1")}>
        <p className={cn(
          "truncate font-semibold text-gray-900",
          big ? "text-lg" : "text-sm"
        )}>{tutorName}</p>
        <p className={cn(
          "font-medium",
          big ? "text-sm" : "text-xs",
          tutorSpeaking ? "text-emerald-600" : "text-gray-400"
        )}>
          {tutorSpeaking ? "Speaking..." : "Tutor"}
        </p>
        {big && (
          <p className="mt-1 text-xs text-gray-400 capitalize">{subject} · {topic}</p>
        )}
      </div>
      {tutorSpeaking && (
        <span className="flex gap-0.5">
          <span className="h-3 w-[3px] animate-bounce rounded-full bg-emerald-500 [animation-delay:0ms]" />
          <span className="h-3 w-[3px] animate-bounce rounded-full bg-emerald-500 [animation-delay:150ms]" />
          <span className="h-3 w-[3px] animate-bounce rounded-full bg-emerald-500 [animation-delay:300ms]" />
        </span>
      )}
    </div>
  );

  /* ─── User profile card ─── */
  const UserCard = ({ big }: { big?: boolean }) => (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border p-4 transition-all",
        big && "flex-col gap-4 p-6 text-center",
        userSpeaking
          ? "border-indigo-300 bg-indigo-50 shadow-[0_0_12px_rgba(99,102,241,0.2)]"
          : "border-black/8 bg-white"
      )}
    >
      {userImage ? (
        <img
          src={userImage}
          alt={userName}
          className={cn(
            "shrink-0 rounded-full object-cover",
            big ? "size-20" : "size-10"
          )}
        />
      ) : (
        <div className={cn(
          "flex shrink-0 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700",
          big ? "size-20 text-2xl" : "size-10 text-sm"
        )}>
          {userName.slice(0, 1).toUpperCase()}
        </div>
      )}
      <div className={cn("min-w-0", big ? "flex flex-col items-center" : "flex-1")}>
        <p className={cn(
          "truncate font-semibold text-gray-900",
          big ? "text-lg" : "text-sm"
        )}>{userName}</p>
        <p className={cn(
          "font-medium",
          big ? "text-sm" : "text-xs",
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
  );

  /* ─── Buttons ─── */
  const ActionButtons = () => (
    <div className="flex flex-col gap-2">
      {callStatus === CallStatus.ACTIVE && (
        <button
          type="button"
          className={cn(
            "btn-mic justify-center",
            isMuted && "border-red-200 bg-red-50 text-red-600"
          )}
          onClick={toggleMicrophone}
        >
          <Image
            src={isMuted ? "/icons/mic-off.svg" : "/icons/mic-on.svg"}
            alt="mic"
            width={22}
            height={22}
          />
          <span>{isMuted ? "Unmute" : "Mute"}</span>
        </button>
      )}

      <button
        type="button"
        className={cn(
          "w-full cursor-pointer rounded-xl px-6 py-3 text-sm font-medium transition-all duration-200",
          callStatus === CallStatus.ACTIVE
            ? "bg-red-600 text-white hover:bg-red-700"
            : "border border-violet-700 bg-gradient-to-b from-violet-500 to-indigo-600 text-white shadow-[0_4px_14px_rgba(109,40,217,0.4)] hover:scale-[1.02] hover:shadow-[0_6px_20px_rgba(109,40,217,0.6)]",
          callStatus === CallStatus.CONNECTING && "animate-pulse",
          callStatus === CallStatus.FINISHED && "pointer-events-none opacity-50"
        )}
        onClick={callStatus === CallStatus.ACTIVE ? handleDisconnect : handleCall}
        disabled={callStatus === CallStatus.FINISHED}
      >
        {callStatus === CallStatus.ACTIVE
          ? "End Session"
          : callStatus === CallStatus.CONNECTING
            ? "Connecting..."
            : callStatus === CallStatus.FINISHED
              ? "Session Ended"
              : "Start Session"}
      </button>
    </div>
  );

  /* ═══════════════════════════════════════════════
     BEFORE session: big centered profiles + buttons
     ═══════════════════════════════════════════════ */
  if (!sessionActive) {
    return (
      <section className="flex h-[calc(100vh-120px)] items-center justify-center">
        <div className="flex w-full max-w-md flex-col items-center gap-6">
          <div className="flex w-full gap-4">
            <div className="flex-1">
              <TutorCard big />
            </div>
            <div className="flex-1">
              <UserCard big />
            </div>
          </div>
          <div className="w-full max-w-[260px]">
            <ActionButtons />
          </div>
        </div>
      </section>
    );
  }

  /* ═══════════════════════════════════════════════
     DURING session: chat left, sidebar right
     ═══════════════════════════════════════════════ */
  return (
    <section className="flex h-[calc(100vh-120px)] gap-4 max-md:flex-col">
      {/* ── Left: Chat card ── */}
      <div className="flex flex-1 flex-col rounded-2xl border border-black/8 bg-white">
        <div
          ref={transcriptRef}
          className="no-scrollbar flex-1 overflow-y-auto px-5 pt-5 pb-4"
        >
          <div className="flex flex-col gap-3">
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

            {/* Real-time partial transcript */}
            {partial && (
              <div
                className={cn(
                  "flex",
                  partial.role === "assistant" ? "justify-start" : "justify-end"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3",
                    partial.role === "assistant"
                      ? "rounded-tl-md border border-dashed border-emerald-200 bg-emerald-50/60"
                      : "rounded-tr-md border border-dashed border-indigo-200 bg-indigo-50/60"
                  )}
                >
                  <p className={cn(
                    "mb-0.5 text-xs font-semibold",
                    partial.role === "assistant" ? "text-emerald-400" : "text-indigo-400"
                  )}>
                    {partial.role === "assistant" ? tutorName : userName}
                    <span className="ml-1 text-[10px] uppercase tracking-wide opacity-70">typing…</span>
                  </p>
                  <p className={cn(
                    "text-[15px] leading-relaxed italic",
                    partial.role === "assistant" ? "text-gray-600" : "text-indigo-700"
                  )}>
                    {partial.content}
                  </p>
                </div>
              </div>
            )}

            {messages.length === 0 && !partial && callStatus === CallStatus.ACTIVE && (
              <p className="text-sm text-gray-400 text-center pt-8">
                Listening…
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Right: Controls sidebar ── */}
      <div className="flex w-full flex-col gap-3 md:w-[260px] md:min-w-[240px]">
        <TutorCard />
        <UserCard />
        <div className="mt-1">
          <ActionButtons />
        </div>
      </div>
    </section>
  );
};

export default CompanionComponent;
