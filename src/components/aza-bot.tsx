import { useCallback, useEffect, useRef, useState } from "react";
import { useConversation, ConversationProvider } from "@elevenlabs/react";
import { useServerFn } from "@tanstack/react-start";
import { getElevenLabsToken } from "@/lib/elevenlabs.functions";
import { Bot, Mic, MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const AGENT_ID = "agent_8701kvcr8vwgf7tt1r66y8tag23q";

type ChatMsg = { id: string; role: "user" | "agent"; text: string };
type Mode = "text" | "voice";

const QUICK_PROMPTS = [
  "ما هي خدمات الشركة؟",
  "أريد عرض سعر تشطيب",
  "ما هي أسعار التشطيب؟",
  "ما هي فروع الشركة؟",
];

export function AzaBot() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("text");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [connecting, setConnecting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fetchToken = useServerFn(getElevenLabsToken);

  const conversation = useConversation({
    onConnect: () => {},
    onDisconnect: () => {},
    onError: (error: unknown) => {
      console.error("AzaBot error", error);
      toast.error("حدث خطأ في الاتصال بالمساعد");
    },
    onMessage: (message: { source?: "user" | "ai"; message?: string }) => {
      const text = message?.message;
      if (!text) return;
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: message.source === "user" ? "user" : "agent",
          text,
        },
      ]);
    },
  });

  const isConnected = conversation.status === "connected";

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const connect = useCallback(
    async (textOnly: boolean) => {
      if (isConnected) return;
      setConnecting(true);
      try {
        if (!textOnly) {
          await navigator.mediaDevices.getUserMedia({ audio: true });
        }
        const { token } = await fetchToken({ data: { agentId: AGENT_ID } });
        await conversation.startSession({
          conversationToken: token,
          connectionType: "webrtc",
          ...(textOnly ? { textOnly: true } : {}),
        } as Parameters<typeof conversation.startSession>[0]);
      } catch (err) {
        console.error(err);
        toast.error("تعذّر بدء المحادثة. تأكد من إذن الميكروفون والاتصال.");
      } finally {
        setConnecting(false);
      }
    },
    [conversation, fetchToken, isConnected],
  );

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "user", text }]);
    if (!isConnected) await connect(true);
    try {
      conversation.sendUserMessage(text);
    } catch (err) {
      console.error(err);
      toast.error("تعذّر إرسال الرسالة");
    }
  }, [input, isConnected, connect, conversation]);

  const switchMode = useCallback(
    async (next: Mode) => {
      setMode(next);
      if (isConnected) await conversation.endSession();
      if (next === "voice") await connect(false);
    },
    [conversation, connect, isConnected],
  );

  const handleQuick = (q: string) => {
    setInput(q);
  };

  const close = async () => {
    if (isConnected) await conversation.endSession();
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="فتح المساعد الذكي"
        className="fixed bottom-6 left-6 z-50 grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg ring-1 ring-black/5 transition hover:scale-105"
      >
        <Bot className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div
      dir="rtl"
      className="fixed bottom-6 left-6 z-50 flex h-[560px] w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-border bg-gradient-to-l from-primary/15 to-transparent px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground">
            <Bot className="h-5 w-5" />
          </span>
          <div>
            <div className="text-sm font-bold leading-tight">عزبوت (AzaBot)</div>
            <div className="text-[11px] text-muted-foreground">
              {isConnected ? "المساعد الذكي • متصل الآن" : "المساعد الذكي"}
            </div>
          </div>
        </div>
        <button onClick={close} aria-label="إغلاق" className="rounded-md p-1 hover:bg-accent">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 border-b border-border text-sm">
        <button
          onClick={() => switchMode("voice")}
          className={cn(
            "flex items-center justify-center gap-2 py-2.5 transition",
            mode === "voice" ? "border-b-2 border-primary font-medium text-foreground" : "text-muted-foreground hover:bg-accent",
          )}
        >
          <Mic className="h-4 w-4" /> محادثة صوتية
        </button>
        <button
          onClick={() => switchMode("text")}
          className={cn(
            "flex items-center justify-center gap-2 py-2.5 transition",
            mode === "text" ? "border-b-2 border-primary font-medium text-foreground" : "text-muted-foreground hover:bg-accent",
          )}
        >
          <MessageCircle className="h-4 w-4" /> محادثة نصية
        </button>
      </div>

      {/* Body */}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="mt-2 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
              <MessageCircle className="h-6 w-6" />
            </div>
            <div className="mt-3 text-sm font-semibold">مرحبًا! أنا عزبوت 👋</div>
            <div className="text-xs text-muted-foreground">كيف يمكنني مساعدتك؟</div>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleQuick(q)}
                  className="rounded-full border border-border bg-background px-3 py-1 text-[11px] text-foreground/80 hover:bg-accent"
                >
                  {q}
                </button>
              ))}
            </div>
            {mode === "voice" && (
              <div className="mt-5 text-xs text-muted-foreground">
                {connecting ? "جارٍ الاتصال…" : isConnected ? (conversation.isSpeaking ? "المساعد يتحدث…" : "ابدأ بالتحدث") : "اضغط تبويب الصوت لبدء المكالمة"}
              </div>
            )}
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={cn("flex", m.role === "user" ? "justify-start" : "justify-end")}>
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-bl-sm"
                    : "bg-muted text-foreground rounded-br-sm",
                )}
              >
                {m.text}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Composer */}
      {mode === "text" ? (
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={handleSend}
              disabled={!input.trim() || connecting}
              aria-label="إرسال"
            >
              <Send className="h-4 w-4 -scale-x-100" />
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="اكتب رسالتك..."
              className="h-9"
            />
          </div>
          <div className="mt-1.5 text-center text-[10px] text-muted-foreground">
            مدعوم بالذكاء الاصطناعي • قد يخطئ أحيانًا
          </div>
        </div>
      ) : (
        <div className="border-t border-border p-3">
          {!isConnected ? (
            <Button onClick={() => connect(false)} disabled={connecting} className="w-full">
              <Mic className="ml-2 h-4 w-4" />
              {connecting ? "جارٍ الاتصال…" : "بدء المكالمة"}
            </Button>
          ) : (
            <Button onClick={() => conversation.endSession()} variant="destructive" className="w-full">
              إنهاء المكالمة
            </Button>
          )}
          <div className="mt-1.5 text-center text-[10px] text-muted-foreground">
            {isConnected
              ? conversation.isSpeaking
                ? "المساعد يتحدث…"
                : "تحدّث الآن — يستمع المساعد"
              : "تأكد من السماح بإذن الميكروفون"}
          </div>
        </div>
      )}
    </div>
  );
}
