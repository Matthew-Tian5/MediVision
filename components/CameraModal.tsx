

import React, { useRef, useEffect, useState } from 'react';

interface Props {
  onCapture: (files: File[]) => void;
  onClose: () => void;
}

export const CameraModal: React.FC<Props> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [capturedPhotos, setCapturedPhotos] = useState<File[]>([]);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment', // Prefer back camera
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera Error:", err);
        setError("Unable to access camera. Please check permissions.");
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const takePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" });
          setCapturedPhotos(prev => [...prev, file]);
          
          // Visual feedback
          if (navigator.vibrate) navigator.vibrate(50);
        }
      }, 'image/jpeg', 0.9);
    }
  };

  const finishSession = () => {
    if (capturedPhotos.length > 0) {
      onCapture(capturedPhotos);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-fade-in text-white">
      
      {/* Top Bar */}
      <div className="h-16 flex items-center justify-between px-6 bg-black/40 backdrop-blur-xl absolute top-0 w-full z-20 border-b border-white/10">
        <button onClick={onClose} className="text-white/90 hover:text-white text-[15px] font-medium transition-colors">
          Cancel
        </button>
        <div className="flex items-center gap-1.5 bg-black/50 px-3 py-1 rounded-full border border-white/10">
           <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
           <span className="text-[13px] font-medium">Camera Active</span>
        </div>
        <div className="w-[45px]"></div> {/* Spacer */}
      </div>

      {/* Main Camera Area */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-black">
        {error ? (
          <div className="text-white text-center p-6 max-w-xs">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <p className="font-medium">{error}</p>
          </div>
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover"
          />
        )}
        
        {/* Scanner Guidelines Overlay */}
        <div className="absolute inset-0 pointer-events-none">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[75%] h-[55%] border border-white/20 rounded-[32px] overflow-hidden">
              {/* Corners */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-[4px]"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-[4px]"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-[4px]"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-[4px]"></div>
           </div>
        </div>

        {/* "Pro Tip" Notification - Compact & Bottom Right */}
        <div className="absolute bottom-8 right-6 max-w-[220px] pointer-events-none animate-fade-in delay-500 z-30">
           <div className="bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-xl p-2.5 flex items-center gap-3 shadow-2xl">
              <div className="w-7 h-7 bg-[#0071e3] rounded-full flex items-center justify-center flex-shrink-0 text-white shadow-lg shadow-blue-500/20">
                 <span className="text-xs">💡</span>
              </div>
              <div className="text-left">
                <p className="text-[11px] font-bold text-white mb-0.5">Round Bottle?</p>
                <p className="text-[10px] text-white/70 leading-tight">
                   Take left, center, & right photos.
                </p>
              </div>
           </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="h-44 bg-black/40 backdrop-blur-2xl border-t border-white/10 pb-8 pt-4 flex flex-col justify-end relative z-20">
         
         {/* Thumbnails Strip */}
         <div className="h-16 mb-4 flex gap-3 px-6 overflow-x-auto items-center scrollbar-hide">
            {capturedPhotos.length === 0 && (
              <div className="text-white/40 text-xs font-medium mx-auto">Photos will appear here</div>
            )}
            {capturedPhotos.map((file, idx) => (
              <div key={idx} className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border border-white/30 animate-fade-in">
                <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="thumbnail" />
              </div>
            ))}
         </div>

         <div className="flex items-center justify-between px-12">
            {/* Spacer / Gallery Button placeholder */}
            <div className="w-14"></div>

            {/* Shutter Button */}
            <button 
              onClick={takePhoto}
              disabled={!!error}
              className="w-20 h-20 rounded-full bg-white/20 border-4 border-white/30 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 active:scale-95 transition-all duration-200 shadow-2xl"
            >
              <div className="w-16 h-16 rounded-full bg-white shadow-inner"></div>
            </button>

            {/* Done Button */}
            <div className="w-14 flex justify-end">
              {capturedPhotos.length > 0 && (
                <button 
                  onClick={finishSession}
                  className="text-white font-semibold text-[15px] bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-full transition-colors shadow-lg shadow-blue-600/20 animate-fade-in"
                >
                  Done ({capturedPhotos.length})
                </button>
              )}
            </div>
         </div>
      </div>
    </div>
  );
};