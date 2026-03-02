import { useRef, useEffect, useState } from 'react';
import { Loader, Play, Pause, Volume2, VolumeX, Maximize, Minimize, RotateCcw, RotateCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface VideoPlayerProps {
  mediaUrl: string;
  mediaType?: 'video' | 'image' | 'animation';
  fileName?: string;
  isActive?: boolean;
  autoPlay?: boolean;
  courseWatermark?: string | null;
  inModal?: boolean;
}

export default function VideoPlayer({
  mediaUrl,
  mediaType = 'video',
  fileName,
  isActive = false,
  autoPlay = false,
  courseWatermark = null,
  inModal = false,
}: VideoPlayerProps) {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rewindAnimation, setRewindAnimation] = useState(false);
  const [forwardAnimation, setForwardAnimation] = useState(false);
  const [isShortVideo, setIsShortVideo] = useState(false);
  const [watermarkPosition, setWatermarkPosition] = useState({ x: 20, y: 20 });
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [showBlurredBg, setShowBlurredBg] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const studentName = user?.first_name
    ? `${user.first_name}${user.last_name ? ' ' + user.last_name : ''}`
    : user?.telegram_username
    ? `@${user.telegram_username}`
    : user?.email
    ? user.email
    : 'Student';

  const watermarkText = courseWatermark
    ? `${courseWatermark} | ${studentName}`
    : studentName;

  useEffect(() => {
    const interval = setInterval(() => {
      setWatermarkPosition({
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!videoRef.current) return;
    if (mediaType === 'animation') {
      if (isActive) {
        videoRef.current.play().catch(err => console.error('Error playing animation:', err));
      } else {
        videoRef.current.pause();
      }
      return;
    }
    if (mediaType !== 'video') return;
    if (autoPlay && isShortVideo) {
      if (isActive) {
        videoRef.current.play().catch(err => console.error('Error playing video:', err));
      } else {
        videoRef.current.pause();
      }
    }
  }, [isActive, autoPlay, isShortVideo, mediaType]);

  useEffect(() => {
    if (videoRef.current && autoPlay && !autoPlay && mediaType === 'video') {
      videoRef.current.play().catch(err => console.error('Error playing video:', err));
    }
  }, [mediaUrl, autoPlay, mediaType]);

  useEffect(() => {
    if (mediaType !== 'video' && mediaType !== 'animation') return;
    const video = videoRef.current;
    if (!video) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (!containerRef.current?.contains(document.activeElement)) return;
      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skipBackward();
          break;
        case 'ArrowRight':
          e.preventDefault();
          skipForward();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    };

    const handleFullscreenChange = () => {
      const fsEl =
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement;
      setIsFullscreen(!!fsEl);
    };

    document.addEventListener('keydown', handleKeyPress);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
    };
  }, [mediaType]);

  const skipBackward = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, video.currentTime - 5);
    setRewindAnimation(true);
    setTimeout(() => setRewindAnimation(false), 300);
  };

  const skipForward = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(video.duration, video.currentTime + 5);
    setForwardAnimation(true);
    setTimeout(() => setForwardAnimation(false), 300);
  };

  const togglePlayPause = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (video.paused) {
        await video.play();
        setIsPlaying(true);
      } else {
        video.pause();
        setIsPlaying(false);
      }
    } catch (err) {
      console.error('Error toggling playback:', err);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const toggleFullscreen = async () => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    const fsEl =
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement;

    try {
      if (!fsEl) {
        if (isMobile) {
          if ((video as any).webkitEnterFullscreen) {
            (video as any).webkitEnterFullscreen();
          } else if (video.requestFullscreen) {
            await video.requestFullscreen();
          }
        } else {
          if (container.requestFullscreen) {
            await container.requestFullscreen();
          } else if ((container as any).webkitRequestFullscreen) {
            (container as any).webkitRequestFullscreen();
          } else if ((container as any).mozRequestFullScreen) {
            (container as any).mozRequestFullScreen();
          }
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          (document as any).mozCancelFullScreen();
        }
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error('Error toggling fullscreen:', err);
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
    setProgress((video.currentTime / video.duration) * 100);
  };

  const extractThumbnail = () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) return;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        setThumbnailUrl(canvas.toDataURL('image/jpeg', 0.7));
      }
    } catch (err) {
      console.error('Error extracting thumbnail:', err);
    }
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration);
    setIsShortVideo(video.duration <= 10);
    setLoading(false);
    setShowBlurredBg(true);
    video.currentTime = 0.1;
    video.addEventListener('seeked', extractThumbnail, { once: true });
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * video.duration;
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const Watermark = () => (
    <div
      className="absolute pointer-events-none select-none z-20 transition-all duration-[4000ms] ease-in-out"
      style={{
        left: `${watermarkPosition.x}%`,
        top: `${watermarkPosition.y}%`,
        textShadow:
          '0 0 8px rgba(0,0,0,0.9), 0 0 16px rgba(0,0,0,0.7), 0 0 4px rgba(255,255,255,0.3), 1px 1px 0 rgba(0,0,0,1), -1px -1px 0 rgba(0,0,0,1)',
        opacity: 0.3,
        transform: 'translate(-50%, -50%) rotate(-15deg)',
        fontSize: '0.875rem',
      }}
    >
      <p className="text-white font-semibold tracking-wide whitespace-nowrap">{watermarkText}</p>
    </div>
  );

  if (mediaType === 'animation') {
    return (
      <div className="relative w-full overflow-hidden bg-black">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
            <Loader className="w-8 h-8 text-white animate-spin" />
          </div>
        )}
        <Watermark />
        <video
          ref={videoRef}
          src={mediaUrl}
          className="w-full h-auto object-contain"
          onLoadedMetadata={() => {
            setLoading(false);
            videoRef.current?.play().catch(() => {});
          }}
          onError={() => setLoading(false)}
          onContextMenu={(e) => e.preventDefault()}
          muted
          autoPlay
          loop
          playsInline
          preload="auto"
          controlsList="nodownload noremoteplayback"
          disablePictureInPicture
          crossOrigin="anonymous"
        />
      </div>
    );
  }

  if (mediaType === 'image') {
    return (
      <div
        className="relative w-full flex items-center justify-center bg-black overflow-hidden"
        style={{ minHeight: inModal ? '400px' : undefined }}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-30">
            <Loader className="w-8 h-8 text-white animate-spin" />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center z-30">
            <p className="text-white text-sm">{error}</p>
          </div>
        )}
        <div
          className="absolute inset-0 bg-cover bg-center scale-110"
          style={{
            backgroundImage: `url(${mediaUrl})`,
            filter: 'blur(40px) brightness(0.5)',
          }}
        />
        <Watermark />
        <img
          ref={imageRef}
          src={mediaUrl}
          alt={fileName || 'Image'}
          className={inModal ? 'max-w-full max-h-[85vh] w-auto h-auto object-contain relative z-10' : 'w-full h-auto object-contain relative z-10'}
          onLoad={(e) => {
            const img = e.currentTarget;
            setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
            setLoading(false);
          }}
          onError={() => {
            setLoading(false);
            setError('Failed to load image');
          }}
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden group ${
        isFullscreen ? 'fixed inset-0 z-[9999] rounded-none bg-black flex items-center justify-center' : 'rounded-t-lg'
      }`}
      tabIndex={0}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(isPlaying ? false : true)}
    >
      <div
        className={`relative w-full bg-black overflow-hidden ${
          isFullscreen ? 'w-full h-full' : 'aspect-video'
        }`}
      >
        {(showBlurredBg || thumbnailUrl) && (
          <div
            className="absolute inset-0 scale-110 z-0"
            style={{
              backgroundImage: thumbnailUrl ? `url(${thumbnailUrl})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(40px) brightness(0.5)',
            }}
          >
            {!thumbnailUrl && (
              <video
                src={mediaUrl}
                className="w-full h-full object-cover"
                muted
                playsInline
                crossOrigin="anonymous"
              />
            )}
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-40">
            <Loader className="w-8 h-8 text-white animate-spin" />
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-40">
            <p className="text-white text-sm">{error}</p>
          </div>
        )}

        <video
          ref={videoRef}
          src={mediaUrl}
          className="absolute inset-0 w-full h-full object-contain z-10"
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          onError={() => {
            setLoading(false);
            setError('Failed to load video');
          }}
          onContextMenu={(e) => e.preventDefault()}
          onTouchStart={(e) => {
            if (e.touches.length > 1) e.preventDefault();
          }}
          controlsList="nodownload noremoteplayback"
          disablePictureInPicture
          preload="auto"
          playsInline
          loop={isShortVideo}
          crossOrigin="anonymous"
        />

        <Watermark />

        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 transition-opacity duration-300 z-30 pointer-events-none ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-6 pointer-events-auto">
            <button
              onClick={skipBackward}
              className={`w-14 h-14 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-all ${
                rewindAnimation ? 'scale-90' : 'scale-100'
              }`}
              title="Назад 5 сек"
            >
              <RotateCcw className="w-6 h-6 text-white" />
              <span className="absolute text-xs text-white font-bold mt-0.5">5</span>
            </button>

            <button
              onClick={togglePlayPause}
              className="w-16 h-16 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-all"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 text-white" fill="white" />
              ) : (
                <Play className="w-8 h-8 text-white ml-1" fill="white" />
              )}
            </button>

            <button
              onClick={skipForward}
              className={`w-14 h-14 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-all ${
                forwardAnimation ? 'scale-90' : 'scale-100'
              }`}
              title="Вперёд 5 сек"
            >
              <RotateCw className="w-6 h-6 text-white" />
              <span className="absolute text-xs text-white font-bold mt-0.5">5</span>
            </button>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2 pointer-events-auto">
            <div
              className="w-full h-1 bg-white/30 rounded-full cursor-pointer group/progress"
              onClick={handleProgressClick}
            >
              <div
                className="h-full bg-teal-500 rounded-full transition-all group-hover/progress:bg-teal-400"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlayPause}
                  className="p-1.5 hover:bg-white/10 rounded transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-white" />
                  ) : (
                    <Play className="w-5 h-5 text-white" />
                  )}
                </button>

                <button
                  onClick={toggleMute}
                  className="p-1.5 hover:bg-white/10 rounded transition-colors"
                  title="Mute (M)"
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5 text-white" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-white" />
                  )}
                </button>

                <span className="text-white text-sm font-medium">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <button
                onClick={toggleFullscreen}
                className="p-1.5 hover:bg-white/10 rounded transition-colors"
                title="Fullscreen (F)"
              >
                {isFullscreen ? (
                  <Minimize className="w-5 h-5 text-white" />
                ) : (
                  <Maximize className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
