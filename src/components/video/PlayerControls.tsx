"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import type Hls from "hls.js";
import {
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  RotateCcw,
  RotateCw,
  PictureInPicture2,
  Loader2,
  Check,
} from "lucide-react";

interface PlayerControlsProps {
  videoRef: RefObject<HTMLVideoElement>;
  hlsRef: RefObject<Hls | null>;
  /** 容器 ref — 用於全螢幕與滑鼠/觸控偵測 */
  containerRef: RefObject<HTMLDivElement>;
  /** HLS manifest 解析完成後遞增，用來重新讀取畫質清單 */
  levelsVersion?: number;
}

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
const VOLUME_KEY = "vns_player_volume";
const MUTED_KEY = "vns_player_muted";
const SPEED_KEY = "vns_player_speed";
const AUTO_HIDE_MS = 3000;

function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) sec = 0;
  const total = Math.floor(sec);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

interface QualityLevel {
  index: number; // -1 = 自動
  label: string;
}

export function PlayerControls({
  videoRef,
  hlsRef,
  containerRef,
  levelsVersion = 0,
}: PlayerControlsProps) {
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [pipActive, setPipActive] = useState(false);
  const [pipSupported, setPipSupported] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [visible, setVisible] = useState(true);
  const [menu, setMenu] = useState<null | "speed" | "quality">(null);
  const [scrubbing, setScrubbing] = useState(false);
  const [scrubPreview, setScrubPreview] = useState(0);

  const [levels, setLevels] = useState<QualityLevel[]>([]);
  const [currentLevel, setCurrentLevel] = useState(-1);

  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTapRef = useRef(0);

  // ---- 初始化：從 localStorage 還原音量/靜音/倍速 ----
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    try {
      const v = localStorage.getItem(VOLUME_KEY);
      const m = localStorage.getItem(MUTED_KEY);
      const sp = localStorage.getItem(SPEED_KEY);
      if (v !== null) {
        const parsed = Math.min(1, Math.max(0, Number(v)));
        if (Number.isFinite(parsed)) {
          video.volume = parsed;
          setVolume(parsed);
        }
      }
      if (m !== null) {
        const isMuted = m === "1";
        video.muted = isMuted;
        setMuted(isMuted);
      }
      if (sp !== null) {
        const parsed = Number(sp);
        if (SPEED_OPTIONS.includes(parsed)) {
          video.playbackRate = parsed;
          setSpeed(parsed);
        }
      }
    } catch {
      /* localStorage 不可用時忽略 */
    }
    setPipSupported(
      typeof document !== "undefined" &&
        "pictureInPictureEnabled" in document &&
        document.pictureInPictureEnabled &&
        typeof video.requestPictureInPicture === "function"
    );
  }, [videoRef]);

  // ---- 監聽 video 事件 ----
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTimeUpdate = () => {
      if (!scrubbing) setCurrent(video.currentTime);
    };
    const onDuration = () => setDuration(video.duration || 0);
    const onWaiting = () => setWaiting(true);
    const onStalled = () => setWaiting(true);
    const onPlaying = () => setWaiting(false);
    const onCanPlay = () => setWaiting(false);
    const onVolume = () => {
      setVolume(video.volume);
      setMuted(video.muted);
    };
    const onRate = () => setSpeed(video.playbackRate);
    const onProgress = () => {
      try {
        const len = video.buffered.length;
        if (len > 0) {
          // 取涵蓋目前播放點的 buffer 末端
          let end = 0;
          for (let i = 0; i < len; i++) {
            if (
              video.buffered.start(i) <= video.currentTime &&
              video.buffered.end(i) >= video.currentTime
            ) {
              end = video.buffered.end(i);
              break;
            }
            end = video.buffered.end(i);
          }
          setBuffered(end);
        }
      } catch {
        /* buffered 存取在某些狀態下會丟錯 */
      }
    };
    const onEnterPip = () => setPipActive(true);
    const onLeavePip = () => setPipActive(false);

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("durationchange", onDuration);
    video.addEventListener("loadedmetadata", onDuration);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("stalled", onStalled);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("volumechange", onVolume);
    video.addEventListener("ratechange", onRate);
    video.addEventListener("progress", onProgress);
    video.addEventListener("enterpictureinpicture", onEnterPip);
    video.addEventListener("leavepictureinpicture", onLeavePip);

    // 初始狀態同步
    setPlaying(!video.paused);
    setCurrent(video.currentTime);
    setDuration(video.duration || 0);
    setVolume(video.volume);
    setMuted(video.muted);
    setSpeed(video.playbackRate);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("durationchange", onDuration);
      video.removeEventListener("loadedmetadata", onDuration);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("stalled", onStalled);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("volumechange", onVolume);
      video.removeEventListener("ratechange", onRate);
      video.removeEventListener("progress", onProgress);
      video.removeEventListener("enterpictureinpicture", onEnterPip);
      video.removeEventListener("leavepictureinpicture", onLeavePip);
    };
  }, [videoRef, scrubbing]);

  // ---- 畫質清單（hls.levels）----
  useEffect(() => {
    const hls = hlsRef.current;
    if (!hls) {
      setLevels([]);
      return;
    }
    const list: QualityLevel[] = (hls.levels || []).map((lv, i) => ({
      index: i,
      label: lv.height ? `${lv.height}p` : `${Math.round((lv.bitrate || 0) / 1000)}k`,
    }));
    // 由高到低排序顯示，但保留原始 index
    list.sort((a, b) => b.index - a.index);
    setLevels(list);
    setCurrentLevel(hls.currentLevel ?? -1);
  }, [hlsRef, levelsVersion]);

  // 同步 hls 自動切換時的 currentLevel
  useEffect(() => {
    const hls = hlsRef.current;
    if (!hls) return;
    const id = setInterval(() => {
      if (hls.autoLevelEnabled) {
        setCurrentLevel(-1);
      } else {
        setCurrentLevel(hls.currentLevel ?? -1);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [hlsRef, levelsVersion]);

  // ---- 全螢幕狀態監聽 ----
  useEffect(() => {
    const onFsChange = () =>
      setFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, [containerRef]);

  // ---- 控制列自動隱藏 ----
  const showControls = useCallback(() => {
    setVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      // 播放中且沒開選單、沒拖曳才隱藏
      const video = videoRef.current;
      if (video && !video.paused && menu === null && !scrubbing) {
        setVisible(false);
      }
    }, AUTO_HIDE_MS);
  }, [menu, scrubbing, videoRef]);

  useEffect(() => {
    showControls();
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [showControls]);

  // 暫停/開選單/拖曳時保持顯示
  useEffect(() => {
    if (!playing || menu !== null || scrubbing) {
      setVisible(true);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    } else {
      showControls();
    }
  }, [playing, menu, scrubbing, showControls]);

  // ---- 動作 ----
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [videoRef]);

  const seekBy = useCallback(
    (delta: number) => {
      const video = videoRef.current;
      if (!video) return;
      const dur = video.duration || 0;
      video.currentTime = Math.min(
        dur || video.currentTime + delta,
        Math.max(0, video.currentTime + delta)
      );
      setCurrent(video.currentTime);
      showControls();
    },
    [videoRef, showControls]
  );

  const setVolumeValue = useCallback(
    (v: number) => {
      const video = videoRef.current;
      if (!video) return;
      const clamped = Math.min(1, Math.max(0, v));
      video.volume = clamped;
      video.muted = clamped === 0;
      setVolume(clamped);
      setMuted(clamped === 0);
      try {
        localStorage.setItem(VOLUME_KEY, String(clamped));
        localStorage.setItem(MUTED_KEY, clamped === 0 ? "1" : "0");
      } catch {
        /* ignore */
      }
    },
    [videoRef]
  );

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const next = !video.muted;
    video.muted = next;
    // 解除靜音但音量為 0 時補一點音量
    if (!next && video.volume === 0) {
      video.volume = 0.5;
      setVolume(0.5);
    }
    setMuted(next);
    try {
      localStorage.setItem(MUTED_KEY, next ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [videoRef]);

  const changeSpeed = useCallback(
    (rate: number) => {
      const video = videoRef.current;
      if (!video) return;
      video.playbackRate = rate;
      setSpeed(rate);
      setMenu(null);
      try {
        localStorage.setItem(SPEED_KEY, String(rate));
      } catch {
        /* ignore */
      }
    },
    [videoRef]
  );

  const changeQuality = useCallback(
    (index: number) => {
      const hls = hlsRef.current;
      if (hls) {
        hls.currentLevel = index; // -1 = 自動
      }
      setCurrentLevel(index);
      setMenu(null);
    },
    [hlsRef]
  );

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement === el) {
      document.exitFullscreen().catch(() => {});
    } else {
      el.requestFullscreen().catch(() => {});
    }
  }, [containerRef]);

  const togglePip = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement === video) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch {
      /* PiP 不被支援或被拒絕 */
    }
  }, [videoRef]);

  // ---- 進度條拖曳 ----
  const seekFromClientX = useCallback(
    (clientX: number, barEl: HTMLElement) => {
      const rect = barEl.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      return ratio * (videoRef.current?.duration || 0);
    },
    [videoRef]
  );

  const onScrubStart = useCallback(
    (clientX: number, barEl: HTMLElement) => {
      setScrubbing(true);
      setScrubPreview(seekFromClientX(clientX, barEl));
    },
    [seekFromClientX]
  );

  const onScrubMove = useCallback(
    (clientX: number, barEl: HTMLElement) => {
      setScrubPreview(seekFromClientX(clientX, barEl));
    },
    [seekFromClientX]
  );

  const onScrubEnd = useCallback(
    (clientX: number, barEl: HTMLElement) => {
      const t = seekFromClientX(clientX, barEl);
      const video = videoRef.current;
      if (video) {
        video.currentTime = t;
        setCurrent(t);
      }
      setScrubbing(false);
    },
    [seekFromClientX, videoRef]
  );

  // ---- 鍵盤快捷鍵 ----
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        target?.isContentEditable
      ) {
        return;
      }
      switch (e.key) {
        case " ":
        case "k":
        case "K":
          e.preventDefault();
          togglePlay();
          showControls();
          break;
        case "ArrowLeft":
          e.preventDefault();
          seekBy(-10);
          break;
        case "ArrowRight":
          e.preventDefault();
          seekBy(10);
          break;
        case "ArrowUp":
          e.preventDefault();
          setVolumeValue((videoRef.current?.volume ?? 0) + 0.1);
          showControls();
          break;
        case "ArrowDown":
          e.preventDefault();
          setVolumeValue((videoRef.current?.volume ?? 0) - 0.1);
          showControls();
          break;
        case "f":
        case "F":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "m":
        case "M":
          e.preventDefault();
          toggleMute();
          showControls();
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    togglePlay,
    seekBy,
    setVolumeValue,
    toggleFullscreen,
    toggleMute,
    showControls,
    videoRef,
  ]);

  // ---- 手機觸控：雙擊左右半屏 ±10s、單擊 toggle 控制列 ----
  const onSurfaceTouch = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const now = Date.now();
      const rect = e.currentTarget.getBoundingClientRect();
      const isRight = e.clientX - rect.left > rect.width / 2;
      if (now - lastTapRef.current < 300) {
        // 雙擊
        seekBy(isRight ? 10 : -10);
        lastTapRef.current = 0;
      } else {
        lastTapRef.current = now;
        // 單擊：toggle 控制列顯示
        if (visible) {
          setVisible(false);
          if (hideTimer.current) clearTimeout(hideTimer.current);
        } else {
          showControls();
        }
      }
    },
    [seekBy, visible, showControls]
  );

  const displayCurrent = scrubbing ? scrubPreview : current;
  const progressPct = duration > 0 ? (displayCurrent / duration) * 100 : 0;
  const bufferedPct = duration > 0 ? (buffered / duration) * 100 : 0;

  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  const btn =
    "flex items-center justify-center text-white/90 hover:text-white transition-colors rounded p-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-nail-gold disabled:opacity-40";

  return (
    <>
      {/* 點擊/觸控感應層（播放暫停 + 雙擊快轉） */}
      <div
        className="absolute inset-0 z-10"
        onClick={onSurfaceTouch}
        onDoubleClick={(e) => e.preventDefault()}
        aria-hidden="true"
      />

      {/* 緩衝轉圈 */}
      {waiting && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <Loader2 size={48} className="animate-spin text-white drop-shadow-lg" />
        </div>
      )}

      {/* 中央大播放鈕（暫停時） */}
      {!playing && !waiting && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label="播放"
          className="absolute inset-0 z-20 flex items-center justify-center group"
        >
          <span className="bg-black/40 group-hover:bg-nail-gold/80 transition-colors rounded-full p-5 backdrop-blur-sm">
            <Play size={36} className="text-white translate-x-0.5" fill="currentColor" />
          </span>
        </button>
      )}

      {/* 控制列 */}
      <div
        className={`absolute inset-x-0 bottom-0 z-30 transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onMouseMove={showControls}
        onMouseEnter={showControls}
      >
        {/* 漸層底 */}
        <div className="bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-10 px-3 pb-2 sm:px-4 sm:pb-3">
          {/* 進度條 */}
          <ProgressBar
            progressPct={progressPct}
            bufferedPct={bufferedPct}
            duration={duration}
            previewTime={scrubbing ? scrubPreview : null}
            onScrubStart={onScrubStart}
            onScrubMove={onScrubMove}
            onScrubEnd={onScrubEnd}
          />

          {/* 按鈕列 */}
          <div className="flex items-center gap-1 sm:gap-2 mt-1.5 text-white">
            <button
              type="button"
              onClick={togglePlay}
              className={btn}
              aria-label={playing ? "暫停" : "播放"}
            >
              {playing ? <Pause size={20} /> : <Play size={20} fill="currentColor" />}
            </button>

            <button
              type="button"
              onClick={() => seekBy(-10)}
              className={btn}
              aria-label="倒退 10 秒"
            >
              <RotateCcw size={18} />
            </button>
            <button
              type="button"
              onClick={() => seekBy(10)}
              className={btn}
              aria-label="快轉 10 秒"
            >
              <RotateCw size={18} />
            </button>

            {/* 音量 */}
            <div className="flex items-center group/vol">
              <button
                type="button"
                onClick={toggleMute}
                className={btn}
                aria-label={muted ? "取消靜音" : "靜音"}
              >
                <VolumeIcon size={20} />
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                onChange={(e) => setVolumeValue(Number(e.target.value))}
                aria-label="音量"
                className="w-0 group-hover/vol:w-16 focus:w-16 transition-all duration-200 h-1 accent-nail-gold cursor-pointer"
              />
            </div>

            {/* 時間 */}
            <div className="text-xs sm:text-sm tabular-nums text-white/90 ml-1 select-none">
              {formatTime(displayCurrent)}
              <span className="text-white/50"> / {formatTime(duration)}</span>
            </div>

            <div className="flex-1" />

            {/* 倍速 */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenu(menu === "speed" ? null : "speed")}
                className={`${btn} text-xs sm:text-sm font-medium min-w-[2.5rem]`}
                aria-label="播放速度"
                aria-haspopup="menu"
                aria-expanded={menu === "speed"}
              >
                {speed}x
              </button>
              {menu === "speed" && (
                <div
                  role="menu"
                  className="absolute bottom-full right-0 mb-2 bg-gray-900/95 backdrop-blur rounded-lg py-1 min-w-[5rem] shadow-xl border border-white/10"
                >
                  {SPEED_OPTIONS.map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      role="menuitemradio"
                      aria-checked={speed === rate}
                      onClick={() => changeSpeed(rate)}
                      className={`flex items-center justify-between w-full px-3 py-1.5 text-sm hover:bg-white/10 ${
                        speed === rate ? "text-nail-gold" : "text-white/90"
                      }`}
                    >
                      <span>{rate === 1 ? "正常" : `${rate}x`}</span>
                      {speed === rate && <Check size={14} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 畫質（僅 hls.js 有 levels 時顯示） */}
            {levels.length > 1 && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenu(menu === "quality" ? null : "quality")}
                  className={btn}
                  aria-label="畫質設定"
                  aria-haspopup="menu"
                  aria-expanded={menu === "quality"}
                >
                  <Settings size={20} />
                </button>
                {menu === "quality" && (
                  <div
                    role="menu"
                    className="absolute bottom-full right-0 mb-2 bg-gray-900/95 backdrop-blur rounded-lg py-1 min-w-[7rem] shadow-xl border border-white/10"
                  >
                    <button
                      type="button"
                      role="menuitemradio"
                      aria-checked={currentLevel === -1}
                      onClick={() => changeQuality(-1)}
                      className={`flex items-center justify-between w-full px-3 py-1.5 text-sm hover:bg-white/10 ${
                        currentLevel === -1 ? "text-nail-gold" : "text-white/90"
                      }`}
                    >
                      <span>自動</span>
                      {currentLevel === -1 && <Check size={14} />}
                    </button>
                    {levels.map((lv) => (
                      <button
                        key={lv.index}
                        type="button"
                        role="menuitemradio"
                        aria-checked={currentLevel === lv.index}
                        onClick={() => changeQuality(lv.index)}
                        className={`flex items-center justify-between w-full px-3 py-1.5 text-sm hover:bg-white/10 ${
                          currentLevel === lv.index ? "text-nail-gold" : "text-white/90"
                        }`}
                      >
                        <span>{lv.label}</span>
                        {currentLevel === lv.index && <Check size={14} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* PiP */}
            {pipSupported && (
              <button
                type="button"
                onClick={togglePip}
                className={btn}
                aria-label={pipActive ? "離開子母畫面" : "子母畫面"}
              >
                <PictureInPicture2 size={20} />
              </button>
            )}

            {/* 全螢幕 */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className={btn}
              aria-label={fullscreen ? "離開全螢幕" : "全螢幕"}
            >
              {fullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ---------------- 進度條子元件 ----------------

interface ProgressBarProps {
  progressPct: number;
  bufferedPct: number;
  duration: number;
  previewTime: number | null;
  onScrubStart: (clientX: number, barEl: HTMLElement) => void;
  onScrubMove: (clientX: number, barEl: HTMLElement) => void;
  onScrubEnd: (clientX: number, barEl: HTMLElement) => void;
}

function ProgressBar({
  progressPct,
  bufferedPct,
  duration,
  previewTime,
  onScrubStart,
  onScrubMove,
  onScrubEnd,
}: ProgressBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  // 拖曳期間綁全域事件，移出進度條也能持續拖
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!draggingRef.current || !barRef.current) return;
      onScrubMove(e.clientX, barRef.current);
    };
    const onUp = (e: PointerEvent) => {
      if (!draggingRef.current || !barRef.current) return;
      draggingRef.current = false;
      onScrubEnd(e.clientX, barRef.current);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [onScrubMove, onScrubEnd]);

  const handleDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!barRef.current) return;
    e.preventDefault();
    draggingRef.current = true;
    onScrubStart(e.clientX, barRef.current);
  };

  return (
    <div
      ref={barRef}
      onPointerDown={handleDown}
      role="slider"
      aria-label="影片進度"
      aria-valuemin={0}
      aria-valuemax={Math.floor(duration)}
      aria-valuenow={Math.floor((progressPct / 100) * duration)}
      tabIndex={0}
      className="relative h-3 flex items-center cursor-pointer group/bar touch-none"
    >
      {/* 軌道 */}
      <div className="absolute inset-x-0 h-1 group-hover/bar:h-1.5 transition-all bg-white/25 rounded-full overflow-hidden">
        {/* buffered */}
        <div
          className="absolute inset-y-0 left-0 bg-white/40"
          style={{ width: `${bufferedPct}%` }}
        />
        {/* played */}
        <div
          className="absolute inset-y-0 left-0 bg-nail-gold"
          style={{ width: `${progressPct}%` }}
        />
      </div>
      {/* 拖曳把手 */}
      <div
        className="absolute w-3 h-3 -ml-1.5 bg-nail-gold rounded-full shadow opacity-0 group-hover/bar:opacity-100 transition-opacity"
        style={{ left: `${progressPct}%` }}
      />
      {/* 拖曳時間提示 */}
      {previewTime !== null && (
        <div
          className="absolute -top-7 -translate-x-1/2 bg-gray-900/90 text-white text-[10px] px-1.5 py-0.5 rounded tabular-nums pointer-events-none"
          style={{ left: `${progressPct}%` }}
        >
          {formatTime(previewTime)}
        </div>
      )}
    </div>
  );
}
