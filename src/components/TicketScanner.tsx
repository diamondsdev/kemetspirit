import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Camera, Upload, X, CheckCircle2, AlertTriangle, Sparkles, RefreshCw, QrCode, Search, HelpCircle, Image } from 'lucide-react';
import jsQR from 'jsqr';
import { Booking } from '../types';

interface TicketScannerProps {
  bookings: Booking[];
  onVerifyCheckIn: (bookingId: string) => void;
  onClose: () => void;
}

export default function TicketScanner({ bookings, onVerifyCheckIn, onClose }: TicketScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'manual'>('camera');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [scannerError, setScannerError] = useState<string>('');
  const [scannedResult, setScannedResult] = useState<{
    rawText: string;
    parsedData?: {
      ticketId: string;
      traveler: string;
      tour: string;
      issuedAt?: string;
    };
    matchedBooking?: Booking;
  } | null>(null);

  const [verificationSuccess, setVerificationSuccess] = useState<boolean>(false);
  const [manualCode, setManualCode] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Active camera stream & animation frame tracking
  const activeStreamRef = useRef<MediaStream | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  // Start video stream
  const startCamera = async () => {
    try {
      setScannerError('');
      setScannedResult(null);
      setVerificationSuccess(false);

      stopCamera();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode }
      });

      activeStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play().catch(() => {});
      }

      setHasCameraPermission(true);
      setIsScanning(true);
    } catch (err: any) {
      console.error('Camera stream access failed:', err);
      setHasCameraPermission(false);
      setScannerError(
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? 'Camera permission was denied. You can allow camera access in browser settings or upload a QR image from your gallery below.'
          : 'Unable to initialize camera stream. Ensure no other application is using your camera or upload a QR image below.'
      );
    }
  };

  // Stop video stream
  const stopCamera = () => {
    setIsScanning(false);
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach((track) => track.stop());
      activeStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Frame scanner loop
  const scanFrame = () => {
    if (!isScanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert'
        });

        if (code) {
          handleDecodedValue(code.data);
          return;
        }
      }
    }

    if (isScanning) {
      animationFrameIdRef.current = requestAnimationFrame(scanFrame);
    }
  };

  // Trigger frame scanner loop when camera starts
  useEffect(() => {
    if (isScanning) {
      animationFrameIdRef.current = requestAnimationFrame(scanFrame);
    }
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [isScanning]);

  // Handle facing mode or tab changes
  useEffect(() => {
    if (activeTab === 'camera' && !scannedResult && !verificationSuccess) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [facingMode, activeTab]);

  const toggleFacingMode = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Process decoded QR text
  const handleDecodedValue = (text: string) => {
    stopCamera();
    let parsedData: any = null;
    let matchedBooking: Booking | undefined = undefined;

    try {
      const json = JSON.parse(text);
      if (json && json.ticketId) {
        parsedData = {
          ticketId: json.ticketId,
          traveler: json.traveler || 'Unknown Voyager',
          tour: json.tour || 'Sacred Expedition',
          issuedAt: json.issuedAt
        };
        matchedBooking = bookings.find(b => b.id === json.ticketId);
      }
    } catch (e) {
      const cleanText = text.trim();
      matchedBooking = bookings.find(b => b.id === cleanText || b.id.includes(cleanText));
      if (matchedBooking) {
        parsedData = {
          ticketId: matchedBooking.id,
          traveler: matchedBooking.travelerName,
          tour: matchedBooking.excursionTitle
        };
      }
    }

    setScannedResult({
      rawText: text,
      parsedData,
      matchedBooking
    });
  };

  // Drag and drop event handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processImageFile(file);
    }
  };

  // Decode from file upload
  const processImageFile = (file: File) => {
    setScannerError('');
    setScannedResult(null);
    setVerificationSuccess(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code) {
            handleDecodedValue(code.data);
          } else {
            setScannerError('Could not locate any sacred QR glyph inside this image. Please select another screenshot or type the code manually.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Handle manual code check-in
  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    
    setScannerError('');
    const cleanCode = manualCode.trim();
    const matched = bookings.find(b => b.id.toLowerCase() === cleanCode.toLowerCase() || b.id.toLowerCase().includes(cleanCode.toLowerCase()));

    if (matched) {
      setScannedResult({
        rawText: matched.id,
        parsedData: {
          ticketId: matched.id,
          traveler: matched.travelerName,
          tour: matched.excursionTitle
        },
        matchedBooking: matched
      });
      setManualCode('');
    } else {
      setScannerError(`No expedition records match the code "${cleanCode}".`);
    }
  };

  // Handle check-in approval action
  const handleConfirmCheckIn = () => {
    if (scannedResult && scannedResult.matchedBooking) {
      onVerifyCheckIn(scannedResult.matchedBooking.id);
      setVerificationSuccess(true);
      
      window.dispatchEvent(new CustomEvent('kemet_celebrate'));

      setTimeout(() => {
        onClose();
      }, 3000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-[#19130e] border-2 border-[#d4af37]/60 rounded-2xl overflow-hidden shadow-[0_0_25px_rgba(212,175,55,0.25)] relative"
      id="ticket-scanner-container"
    >
      {/* Decorative Golden Egyptian Headers */}
      <div className="bg-[#140e0a] border-b border-[#d4af37]/35 p-4 flex justify-between items-center relative">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent"></div>
        <div className="flex items-center gap-2">
          <span className="text-[#d4af37] text-lg font-serif">𓂀</span>
          <h3 className="font-serif text-sm uppercase tracking-wider text-[#e6c280] font-bold">
            Sacred Registrar Portal
          </h3>
          <span className="text-stone-500 font-mono text-[9px] uppercase tracking-widest px-1.5 py-0.5 bg-stone-900 border border-stone-800 rounded">
            QR Scanner
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-stone-400 hover:text-[#d4af37] transition-all cursor-pointer p-1 bg-stone-900/60 border border-stone-800 hover:border-[#d4af37]/40 rounded-full"
          title="Seal portal"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 space-y-5">
        {/* Verification Success View */}
        {verificationSuccess && scannedResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8 px-4 space-y-4 bg-emerald-950/20 border border-emerald-500/40 rounded-xl"
          >
            <div className="w-16 h-16 bg-emerald-500/10 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-400 relative">
              <CheckCircle2 className="w-9 h-9" />
              <motion.div
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 border border-emerald-400/30 rounded-full pointer-events-none"
              />
            </div>
            <div className="space-y-1">
              <h4 className="font-serif text-xl uppercase text-emerald-400 tracking-wider">
                𓋹 Passage Authorized 𓋹
              </h4>
              <p className="text-stone-300 text-xs font-mono">
                Booking ID: #{scannedResult.matchedBooking?.id.slice(-6).toUpperCase()} verified!
              </p>
            </div>
            <div className="p-3 bg-[#140e0a] rounded-lg border border-[#d4af37]/25 text-left max-w-sm mx-auto space-y-1.5 font-sans">
              <div className="text-[10px] text-stone-500 uppercase font-mono tracking-wider">Confirmed Traveler:</div>
              <div className="text-sm font-bold text-[#e6c280]">{scannedResult.matchedBooking?.travelerName}</div>
              <div className="text-[10px] text-stone-500 uppercase font-mono tracking-wider mt-1">Expedition:</div>
              <div className="text-xs text-stone-200">{scannedResult.matchedBooking?.excursionTitle}</div>
              <div className="flex justify-between text-[10px] text-stone-400 font-mono mt-2 border-t border-stone-800/80 pt-1.5">
                <span>Date: {scannedResult.matchedBooking?.date}</span>
                <span>Guests: {scannedResult.matchedBooking?.numberOfGuests}</span>
              </div>
            </div>
            <p className="text-[10px] text-emerald-400/80 italic font-mono uppercase tracking-widest animate-pulse">
              𓂀 Alignment validated. Sacred scarabs released! 𓆣
            </p>
          </motion.div>
        )}

        {/* Decoded/Result View before verification */}
        {!verificationSuccess && scannedResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {scannedResult.matchedBooking ? (
              <div className="border border-[#d4af37] bg-[#221710] rounded-xl p-4 space-y-3 shadow-inner">
                <div className="flex items-center gap-2 text-[#d4af37]">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  <span className="font-serif text-xs uppercase tracking-wider font-bold">
                    Divine Seal Detected
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="border-l-2 border-[#d4af37] pl-3 py-1 space-y-0.5">
                    <span className="text-[10px] text-stone-500 uppercase font-mono block">Traveler:</span>
                    <span className="text-base font-serif font-black text-[#e6c280] uppercase tracking-wide">
                      {scannedResult.matchedBooking.travelerName}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs text-stone-300 pt-2 border-t border-stone-800/80">
                    <div>
                      <span className="text-stone-500 text-[10px] uppercase font-mono block">Excursion:</span>
                      <span className="font-medium text-stone-200">{scannedResult.matchedBooking.excursionTitle}</span>
                    </div>
                    <div>
                      <span className="text-stone-500 text-[10px] uppercase font-mono block">Travel Date:</span>
                      <span className="font-medium text-stone-200">{scannedResult.matchedBooking.date}</span>
                    </div>
                    <div>
                      <span className="text-stone-500 text-[10px] uppercase font-mono block">Status:</span>
                      <span className="font-bold text-[#d4af37] font-mono">{scannedResult.matchedBooking.status}</span>
                    </div>
                    <div>
                      <span className="text-stone-500 text-[10px] uppercase font-mono block">Passage Size:</span>
                      <span className="font-medium text-stone-200">
                        {scannedResult.matchedBooking.numberOfGuests} {scannedResult.matchedBooking.numberOfGuests === 1 ? 'Explorer' : 'Explorers'}
                      </span>
                    </div>
                  </div>

                  {scannedResult.matchedBooking.status === 'Completed' && (
                    <div className="bg-emerald-950/20 border border-emerald-500/30 rounded p-2 text-center text-[11px] text-emerald-400 font-mono uppercase tracking-widest">
                      ✓ Voyager Already Checked-In!
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleConfirmCheckIn}
                    className="flex-1 bg-gradient-to-r from-[#d4af37] to-[#b08e23] hover:from-[#fbf5e6] hover:to-[#d4af37] text-black rounded-lg py-2 text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95"
                  >
                    Confirm Check-In Passage
                  </button>
                  <button
                    onClick={() => {
                      setScannedResult(null);
                      if (activeTab === 'camera') startCamera();
                    }}
                    className="border border-stone-700 text-stone-400 hover:text-white px-3 rounded-lg text-xs font-mono hover:bg-stone-900 transition-colors cursor-pointer"
                  >
                    Scan Again
                  </button>
                </div>
              </div>
            ) : (
              <div className="border border-amber-500/40 bg-amber-950/10 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-amber-400">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-serif text-xs uppercase tracking-wider font-black">
                    Unrecognized Seal
                  </span>
                </div>
                <p className="text-stone-300 text-xs leading-relaxed">
                  The decoded QR code contains raw text, but does not match any booking in our active ledger:
                </p>
                <div className="bg-[#140e0a] rounded border border-stone-800 p-2 text-xs font-mono text-[#d4af37] break-all max-h-24 overflow-y-auto">
                  {scannedResult.rawText}
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => {
                      setScannedResult(null);
                      if (activeTab === 'camera') startCamera();
                    }}
                    className="flex-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-lg py-2 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Scan Another QR Code
                  </button>
                  <button
                    onClick={() => {
                      if (scannedResult.parsedData?.ticketId) {
                        const directMatched = bookings.find(b => b.id === scannedResult.parsedData?.ticketId);
                        if (directMatched) {
                          setScannedResult({
                            ...scannedResult,
                            matchedBooking: directMatched
                          });
                          return;
                        }
                      }
                      setScannedResult(null);
                    }}
                    className="border border-stone-800 text-stone-500 hover:text-stone-300 hover:border-stone-700 px-3 rounded-lg text-xs font-mono cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Tab Selection Navigation */}
        {!verificationSuccess && !scannedResult && (
          <div className="space-y-4">
            <div className="flex border-b border-stone-800 gap-1 pb-1">
              <button
                onClick={() => setActiveTab('camera')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-t-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeTab === 'camera'
                    ? 'bg-[#241a10] text-[#e6c280] border-t-2 border-x border-[#d4af37]'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/50'
                }`}
              >
                <Camera className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Live Camera</span>
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-t-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeTab === 'upload'
                    ? 'bg-[#241a10] text-[#e6c280] border-t-2 border-x border-[#d4af37]'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/50'
                }`}
              >
                <Upload className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Gallery Image</span>
              </button>
              <button
                onClick={() => setActiveTab('manual')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-t-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeTab === 'manual'
                    ? 'bg-[#241a10] text-[#e6c280] border-t-2 border-x border-[#d4af37]'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/50'
                }`}
              >
                <Search className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Input Code</span>
              </button>
            </div>

            {/* TAB 1: LIVE CAMERA VIEWPORT */}
            {activeTab === 'camera' && (
              <div className="space-y-3">
                <div className="relative aspect-video w-full max-w-md mx-auto bg-black rounded-xl overflow-hidden border border-stone-800 group shadow-inner">
                  {isScanning ? (
                    <>
                      <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        playsInline
                        muted
                      />
                      <canvas ref={canvasRef} className="hidden" />

                      {/* Golden Egyptian Target Overlay */}
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[#d4af37]"></div>
                        <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[#d4af37]"></div>
                        <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-[#d4af37]"></div>
                        <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-[#d4af37]"></div>

                        {/* Oscillating laser line */}
                        <motion.div
                          animate={{ y: ['-100%', '100%'] }}
                          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                          className="absolute left-3 right-3 h-[2px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent shadow-[0_0_10px_rgba(212,175,55,0.9)]"
                        />

                        <div className="w-32 h-32 border border-[#d4af37]/40 rounded-xl flex items-center justify-center bg-black/10">
                          <QrCode className="w-10 h-10 text-[#d4af37]/30 animate-pulse" />
                        </div>
                      </div>

                      {/* Camera Overlay Controls */}
                      <div className="absolute top-2 right-2 flex gap-1.5 z-10">
                        <button
                          type="button"
                          onClick={toggleFacingMode}
                          className="p-1.5 bg-black/70 hover:bg-black/90 border border-stone-700 hover:border-[#d4af37]/60 text-stone-200 hover:text-[#d4af37] rounded-md text-[10px] font-mono transition-all cursor-pointer flex items-center gap-1"
                          title="Switch camera orientation"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Flip</span>
                        </button>
                        <button
                          type="button"
                          onClick={stopCamera}
                          className="p-1.5 bg-red-950/70 hover:bg-red-950/90 border border-red-900/60 text-red-300 rounded-md text-[10px] font-mono transition-all cursor-pointer"
                        >
                          Pause
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center space-y-3 bg-[#110c09]">
                      <Camera className="w-10 h-10 text-stone-600 animate-pulse" />
                      <div className="space-y-1">
                        <p className="text-xs text-stone-300 font-medium">Camera is currently paused or inactive.</p>
                        {scannerError && <p className="text-[10px] text-amber-400 font-mono max-w-xs mx-auto leading-relaxed">{scannerError}</p>}
                      </div>
                      <button
                        type="button"
                        onClick={startCamera}
                        className="bg-gradient-to-r from-[#d4af37] to-[#b08e23] hover:from-[#fbf5e6] hover:to-[#d4af37] text-[#140f0a] font-serif font-bold text-xs uppercase px-4 py-2 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Start Camera Scan</span>
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-stone-400 font-mono text-center">
                  Point your camera directly at the booking ticket QR code to verify traveler passage.
                </p>
              </div>
            )}

            {/* TAB 2: GALLERY DROPZONE */}
            {activeTab === 'upload' && (
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-6 border-2 border-dashed rounded-2xl text-center space-y-3 cursor-pointer transition-all ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-950/20'
                    : 'border-[#d4af37]/40 hover:border-[#d4af37] bg-black/40 hover:bg-black/60'
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center mx-auto text-[#d4af37]">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="font-serif text-sm uppercase tracking-wider text-[#e6c280] font-bold">
                    Upload Ticket QR Image
                  </p>
                  <p className="text-xs text-stone-400 max-w-xs mx-auto">
                    Select a saved QR screenshot or image file from your device's photo gallery
                  </p>
                </div>

                {scannerError && (
                  <p className="text-xs text-amber-400 font-mono bg-amber-950/30 border border-amber-500/30 rounded-lg p-2 max-w-sm mx-auto">
                    {scannerError}
                  </p>
                )}

                <button
                  type="button"
                  className="bg-gradient-to-r from-[#d4af37] to-[#b08e23] hover:from-[#fbf5e6] hover:to-[#d4af37] text-[#140f0a] font-serif font-bold text-xs uppercase px-4 py-2 rounded-xl shadow-md transition-all pointer-events-none"
                >
                  Choose Photo from Gallery
                </button>
              </div>
            )}

            {/* TAB 3: MANUAL INPUT */}
            {activeTab === 'manual' && (
              <form
                onSubmit={handleManualSearch}
                className="bg-[#140e0a] p-4 rounded-xl border border-stone-800 space-y-3"
              >
                <label className="text-xs font-serif uppercase tracking-wider text-[#e6c280] font-bold block flex items-center gap-1.5">
                  <Search className="w-4 h-4 text-[#d4af37]" />
                  <span>Verify Directly by Booking ID Code</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="e.g. b-1784... or ticket token"
                    className="flex-1 bg-black/60 border border-stone-800 focus:border-[#d4af37] text-stone-100 text-xs rounded-lg px-3 py-2.5 focus:outline-none font-mono"
                  />
                  <button
                    type="submit"
                    className="bg-[#d4af37] hover:bg-amber-300 text-[#140f0a] px-4 py-2.5 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer"
                  >
                    Check Code
                  </button>
                </div>
                {scannerError && (
                  <p className="text-xs text-amber-400 font-mono bg-amber-950/30 border border-amber-500/30 rounded-lg p-2">
                    {scannerError}
                  </p>
                )}
              </form>
            )}
          </div>
        )}
      </div>

      {/* Decorative Footer Symbol */}
      <div className="bg-[#140e0a] border-t border-stone-900 px-4 py-2 text-center">
        <span className="text-[9px] font-mono text-stone-600 uppercase tracking-widest block">
          𓋹 SECURE AMULET SCANNER PROTOCOL 𓋹
        </span>
      </div>
    </motion.div>
  );
}

