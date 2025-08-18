"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { vapi, Message, MessageTypeEnum, MessageRoleEnum } from "@/lib/vapi.sdk";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING", 
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface VoiceCallInterfaceProps {
  userName?: string;
  userImage?: string;
}

const VoiceCallInterface = ({ 
  userName = "Abhishek Farshwal",
  userImage = "https://avatars.githubusercontent.com/Abhishek2634"
}: VoiceCallInterfaceProps) => {
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lon: number} | null>(null);
  const [currentMessage, setCurrentMessage] = useState<string>("");
  const [imageError, setImageError] = useState(false);

  // Get user location
  const getUserLocation = useCallback(async () => {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });
      
      const coords = {
        lat: position.coords.latitude,
        lon: position.coords.longitude
      };
      
      setUserLocation(coords);
      console.log("📍 Location obtained:", coords);
      return coords;
    } catch (error) {
      console.warn("⚠️ Location access denied or failed");
      return null;
    }
  }, []);

  // Send message to backend
  const sendToBackend = useCallback(async (userPrompt: string) => {
    try {
      const payload: any = { user_prompt: userPrompt };
      
      if (userLocation) {
        payload.coords = userLocation;
      }

      const response = await fetch("http://127.0.0.1:8000/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("🌾 Backend response:", data.response);
        return data.response;
      }
    } catch (error) {
      console.error("❌ Backend connection error:", error);
    }
  }, [userLocation]);

  useEffect(() => {
    const onCallStart = () => {
      console.log("🎤 Voice call started successfully");
      setCallStatus(CallStatus.ACTIVE);
    };

    const onCallEnd = (callData: any) => {
      console.log("🎤 Voice call ended:", callData);
      console.log("End reason:", callData?.endedReason || "unknown");
      setCallStatus(CallStatus.FINISHED);
      setIsSpeaking(false);
      setIsListening(false);
    };

    const onMessage = async (message: Message) => {
      console.log("📨 Received message:", message);
      
      if (message.type === MessageTypeEnum.TRANSCRIPT && message.transcriptType === "final") {
        setCurrentMessage(message.transcript);
        
        if (message.role === MessageRoleEnum.USER) {
          console.log("👤 User said:", message.transcript);
          await sendToBackend(message.transcript);
        }
      }
    };

    const onSpeechStart = () => {
      console.log("🗣️ AI started speaking");
      setIsSpeaking(true);
      setIsListening(false);
    };

    const onSpeechEnd = () => {
      console.log("👂 AI finished speaking");
      setIsSpeaking(false);
      setIsListening(true);
    };

    const onError = (error: any) => {
      console.error("❌ VAPI Error Details:", {
        error,
        type: typeof error,
        message: error?.message,
        code: error?.code,
        details: error?.details
      });
      setCallStatus(CallStatus.FINISHED);
    };

    // Register VAPI event listeners
    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, [sendToBackend]);

  const handleStartCall = async () => {
    setCallStatus(CallStatus.CONNECTING);
    console.log("🚀 Starting call process...");
    
    // Check microphone permission first
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("✅ Microphone permission granted");
      stream.getTracks().forEach(track => track.stop()); // Clean up
    } catch (error) {
      console.error("❌ Microphone permission denied:", error);
      alert("Microphone permission is required for voice calls");
      setCallStatus(CallStatus.INACTIVE);
      return;
    }
    
    await getUserLocation();
    
    try {
      console.log("📞 Calling vapi.start...");
      
      // OPTION 1: Use ONLY assistant ID (Recommended - prevents call ending)
      await vapi.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID);
      
      
      console.log("✅ VAPI call initiated successfully");
    } catch (error) {
      console.error("❌ Failed to start call:", error);
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      setCallStatus(CallStatus.INACTIVE);
      
      // Show user-friendly error
      alert(`Call failed: ${error.message}`);
    }
  };

  const handleEndCall = () => {
    console.log("🔴 Ending call manually");
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  const getStatusText = () => {
    switch (callStatus) {
      case CallStatus.CONNECTING:
        return "Connecting...";
      case CallStatus.ACTIVE:
        if (isSpeaking) return "AI is speaking...";
        if (isListening) return "Listening...";
        return "Connected";
      case CallStatus.FINISHED:
        return "Call ended";
      default:
        return "Ready to help with farming advice";
    }
  };

  return (
    <div 
      className="min-h-screen w-full" 
      style={{ 
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)'
      }}
    >
      <div className="flex flex-col items-center justify-start min-h-screen px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        
        {/* Header - No top margin */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4 flex items-center justify-center gap-2 sm:gap-3">
            🌾 Krishi Sewa Voice Assistant
          </h1>
          <p className="text-slate-400 text-base sm:text-lg">
            {getStatusText()}
          </p>
        </div>

        {/* Cards Container - Perfect Alignment with CSS Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12 w-full max-w-6xl">
          
          {/* AI Assistant Card */}
          <div 
            className="rounded-2xl sm:rounded-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #090631ff 0%, #4b46cfff 50%, #060334ff 100%)',
              border: '1px solid #4338ca20'
            }}
          >
            <div className="h-96 sm:h-[28rem] lg:h-96 grid grid-rows-[1fr_auto] items-center p-6 sm:p-8 lg:p-10">
              
              {/* Avatar Section - Takes available space */}
              <div className="flex items-center justify-center">
                <div 
                  className={cn(
                    "w-28 h-28 sm:w-32 sm:h-32 lg:w-36 lg:h-36 rounded-full flex items-center justify-center transition-all duration-300",
                    isSpeaking && "ring-4 ring-green-400 ring-opacity-50",
                    isListening && callStatus === CallStatus.ACTIVE && "ring-4 ring-blue-400 ring-opacity-50"
                  )}
                  style={{
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                  }}
                >
                  <span className="text-4xl sm:text-5xl lg:text-6xl">🌾</span>
                </div>
              </div>
              
              {/* Title Section - Fixed to bottom row */}
              <div className="text-center">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-white mb-9">
                  AI Agricultural Expert
                </h2>
                <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                  Your farming assistant for weather, crops & advice
                </p>
              </div>
            </div>
          </div>

          {/* User Card */}
          <div 
            className="rounded-2xl sm:rounded-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #0d1d38ff 0%, #344459ff 50%, #091933ff 100%)',
              border: '1px solid #6b728030'
            }}
          >
            <div className="h-96 sm:h-[28rem] lg:h-96 grid grid-rows-[1fr_auto] items-center p-6 sm:p-8 lg:p-10">
              
              {/* Avatar Section - Takes available space */}
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 lg:w-36 lg:h-36 rounded-full overflow-hidden bg-slate-600 border-2 border-slate-500">
                    {!imageError ? (
                      <img 
                        src={userImage} 
                        alt={userName}
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-600">
                        <span className="text-3xl sm:text-4xl lg:text-5xl">👨‍🌾</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Status Indicator */}
                  {callStatus === CallStatus.ACTIVE && (
                    <div className={cn(
                      "absolute -bottom-1 -right-1 w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-slate-700",
                      isListening ? "bg-red-500" : "bg-gray-500"
                    )}></div>
                  )}
                </div>
              </div>
              
              {/* Title Section - Fixed to bottom row */}
              <div className="text-center">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-white mb-3">
                  {userName}
                </h2>
                <div className="text-slate-400 text-sm sm:text-base space-y-1">
                  <p>Farmer</p>
                  {userLocation ? (
                    <p className="text-green-400">📍 Location shared</p>
                  ) : (
                    <p className="text-red-400">📍 Location not shared</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Current Message */}
        {currentMessage && callStatus === CallStatus.ACTIVE && (
          <div 
            className="rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 max-w-xl sm:max-w-2xl w-full mx-4"
            style={{
              background: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid #475569'
            }}
          >
            <p className="text-slate-300 text-center text-sm sm:text-base">
              &quot;{currentMessage}&quot;
            </p>
          </div>
        )}

        {/* Call Button - Responsive */}
        <div className="mb-6 sm:mb-8">
          {callStatus === CallStatus.ACTIVE ? (
            <button
              onClick={handleEndCall}
              className="text-white px-8 sm:px-12 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
              }}
            >
              End Call
            </button>
          ) : (
            <button
              onClick={handleStartCall}
              disabled={callStatus === CallStatus.CONNECTING}
              className={cn(
                "px-8 sm:px-12 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold transition-all duration-200 text-white",
                callStatus === CallStatus.CONNECTING && "cursor-not-allowed"
              )}
              style={{
                background: callStatus === CallStatus.CONNECTING 
                  ? 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)'
                  : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
              }}
            >
              {callStatus === CallStatus.CONNECTING ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Connecting...
                </div>
              ) : (
                "Start Call"
              )}
            </button>
          )}
        </div>

        {/* Instructions - Responsive */}
        <div className="text-center max-w-xl sm:max-w-2xl mx-4 pb-8">
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
            {callStatus === CallStatus.INACTIVE && 
              "Click 'Start Call' to begin your voice conversation with the agricultural assistant. Ask about weather, crops, farming tips, and more!"
            }
            {callStatus === CallStatus.ACTIVE && 
              "Speak naturally about farming, weather, or crops. The AI assistant will provide personalized advice based on your location."
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default VoiceCallInterface;
