"use client";

import { useState, useRef, useEffect, FormEvent, KeyboardEvent } from "react";
import { Send, Mic, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface Coords {
  lat: number;
  lon: number;
}

const BACKEND = "http://127.0.0.1:8000/query";

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hey! How's can i help you today?",
      timestamp: new Date(),
    },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<Coords | null>(null);
  const [locationPermission, setLocationPermission] = useState<string>("unknown");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Smart geolocation
  async function checkGeolocationPermission(): Promise<string> {
    if (!('permissions' in navigator)) {
      return 'prompt';
    }
    
    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      return result.state;
    } catch {
      return 'prompt';
    }
  }

  async function getLocationSmart(): Promise<Coords | null> {
    if (userLocation) {
      console.log("📍 Using cached location:", userLocation);
      return userLocation;
    }

    const permission = await checkGeolocationPermission();
    setLocationPermission(permission);

    if (permission === 'denied') {
      console.log("⚠️ Location permission denied");
      return null;
    }

    if (permission === 'granted' || permission === 'prompt') {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000,
          });
        });
        
        const coords = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        
        setUserLocation(coords);
        setLocationPermission('granted');
        console.log("📍 Got fresh location:", coords);
        return coords;
        
      } catch (error) {
        console.warn("⚠️ Failed to get location:", error);
        setLocationPermission('denied');
        return null;
      }
    }

    return null;
  }

  // Submit handler
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((m) => [...m, userMsg]);
    setInput("");
    setIsLoading(true);

    // Get location
    const coords = await getLocationSmart();

    // Prepare payload
    const payload: {
      user_prompt: string;
      coords?: Coords;
    } = {
      user_prompt: userMsg.content,
    };

    if (coords) {
      payload.coords = coords;
    }

    // Send to backend
    try {
      const res = await fetch(BACKEND, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const { response } = await res.json();

      setMessages((m) => [
        ...m,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response,
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      console.error("❌ Backend error:", err);
      setMessages((m) => [
        ...m,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "⚠️ Cannot reach the AI service. Is the backend running on :8000?",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    checkGeolocationPermission().then(setLocationPermission);
  }, []);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(scrollToBottom, [messages]);

  const getPlaceholderText = () => {
    if (locationPermission === 'granted' && userLocation) {
      return "Ask anything (location enabled 📍)";
    } else if (locationPermission === 'denied') {
      return "Ask anything (location disabled)";
    } else {
      return "Ask anything (location may be requested)";
    }
  };

  return (
    <div style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)'}} className="flex w-full flex-col h-[calc(100vh-80px)]">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4">
        <div className="max-w-3xl mx-auto">
          {messages.map((m) => (
            <div
              key={m.id}
              className=" mt-12 px-4 border-b border-border/50"
            >
              <div className="flex  flex-col gap-2">
                {/* Role Label */}
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-xs font-medium px-2 py-1 rounded-full",
                    m.role === "user" 
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" 
                      : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                  )}>
                    {m.role === "user" ? "You" : "AI Assistant"}
                  </span>
                </div>

                {/* Message Content */}
                <div className="prose prose-sm max-w-none text-foreground dark:text-white">
                  {m.content}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="py-6 px-4">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 w-fit">
                  AI Assistant
                </span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-foreground rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="shrink-0 border-t border-border bg-background">
        <div className="max-w-3xl mx-auto p-4">
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative flex items-end gap-3">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 mb-2 text-muted-foreground"
              >
                <Paperclip className="h-5 w-5" />
              </Button>
              <div className="relative flex-1">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={getPlaceholderText()}
                  className="min-h-[52px] max-h-[200px] resize-none pr-12 py-3 bg-muted/30 border-border"
                  rows={1}
                />
                <div className="absolute right-2 bottom-2">
                  {input.trim() ? (
                    <Button
                      type="submit"
                      size="icon"
                      className="h-8 w-8 bg-green-600 hover:bg-green-700 text-white"
                      disabled={isLoading}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8 text-muted-foreground"
                    >
                      <Mic className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
