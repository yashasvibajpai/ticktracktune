import { useState, useRef } from 'react';
import YouTube from 'react-youtube';
import type { YouTubeProps } from 'react-youtube';
import type { SessionType } from '../types';
import { Volume2, VolumeX, Music, Coffee } from 'lucide-react';

interface MusicPlayerProps {
  mode: SessionType;
}

// Using single video IDs if playlists are flaky for embedded
const FOCUS_VIDEO_ID = 'jfKfPfyJRdk'; // Lofi Girl live
const BREAK_VIDEO_ID = '5qap5aO4i9A'; // Lofi Girl chillhop/relax

export default function MusicPlayer({ mode }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const playerRef = useRef<any>(null);

  const isWork = mode === 'work';
  const currentVideoId = isWork ? FOCUS_VIDEO_ID : BREAK_VIDEO_ID;

  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target;
    // Autoplay policy usually requires mute
    event.target.setVolume(50);
    if (isMuted) {
      event.target.mute();
    } else {
      event.target.unMute();
    }
  };

  const togglePlay = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (playerRef.current) {
      if (isMuted) {
        playerRef.current.unMute();
      } else {
        playerRef.current.mute();
      }
      setIsMuted(!isMuted);
    }
  };

  const onStateChange: YouTubeProps['onStateChange'] = (event) => {
    // 1 = playing, 2 = paused
    if (event.data === 1) setIsPlaying(true);
    if (event.data === 2) setIsPlaying(false);
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-between mb-4 border-b border-wood-400 pb-2">
        <h2 className="text-xl font-bold text-wood-900 flex items-center gap-2">
          {isWork ? <Music size={20} /> : <Coffee size={20} />}
          Vibes: {isWork ? 'Deep Focus' : 'Chill Break'}
        </h2>
        <div className="flex gap-2">
           <button
             onClick={toggleMute}
             className="p-2 text-wood-600 hover:text-wood-900 hover:bg-wood-400/30 rounded-full transition-colors"
             title={isMuted ? "Unmute" : "Mute"}
           >
             {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
           </button>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <button
          onClick={togglePlay}
          className={`flex-1 py-3 rounded-lg font-semibold transition-colors shadow-sm flex justify-center items-center gap-2 ${
            isPlaying
              ? 'bg-wood-800 text-wood-100 hover:bg-wood-900'
              : 'bg-wood-400 text-wood-900 hover:bg-wood-600 hover:text-wood-100'
          }`}
        >
          {isPlaying ? 'Pause Vibe' : 'Play Vibe'}
        </button>
      </div>

      {/* Hidden YouTube Player */}
      <div className="hidden">
        <YouTube
          videoId={currentVideoId}
          opts={{
            height: '0',
            width: '0',
            playerVars: {
              autoplay: 0,
              controls: 0,
              disablekb: 1,
              fs: 0,
              modestbranding: 1,
              playsinline: 1,
            },
          }}
          onReady={onPlayerReady}
          onStateChange={onStateChange}
        />
      </div>
    </div>
  );
}
