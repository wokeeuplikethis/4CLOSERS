'use client'

import { useEffect, useRef, useState } from 'react'
import { Play, Pause } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  src: string
  className?: string
}

function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export function AudioPlayer({ src, className }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Пытаемся узнать реальную длительность
  function readDuration(audio: HTMLAudioElement) {
    const d = audio.duration
    if (Number.isFinite(d) && d > 0) {
      setDuration(d)
    } else {
      // Иногда duration = Infinity. Попробуем вычислить через seek в большой
      // таймстемп, чтобы браузер догрузил метаданные.
      try {
        audio.currentTime = 1e101
        const onSeeked = () => {
          audio.removeEventListener('seeked', onSeeked)
          const real = audio.duration
          audio.currentTime = 0
          if (Number.isFinite(real) && real > 0) setDuration(real)
        }
        audio.addEventListener('seeked', onSeeked)
      } catch {
        // ничего
      }
    }
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onLoaded = () => readDuration(audio)
    const onDurationChange = () => readDuration(audio)
    const onTime = () => setCurrent(audio.currentTime)
    const onEnd = () => {
      setPlaying(false)
      setCurrent(0)
    }
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onError = () => {
      setError('не удалось загрузить')
      setPlaying(false)
    }

    audio.addEventListener('loadedmetadata', onLoaded)
    audio.addEventListener('durationchange', onDurationChange)
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('ended', onEnd)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('error', onError)

    // Форсируем загрузку метаданных, если браузер ленится
    audio.load()

    return () => {
      audio.removeEventListener('loadedmetadata', onLoaded)
      audio.removeEventListener('durationchange', onDurationChange)
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('ended', onEnd)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('error', onError)
    }
  }, [src])

  function toggle() {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      audio.play().catch((e) => {
        console.error('Audio play error:', e)
        setError('не удалось воспроизвести')
      })
    } else {
      audio.pause()
    }
  }

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const audio = audioRef.current
    if (!audio) return

    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))

    // 1) Если знаем duration — просто устанавливаем currentTime
    if (Number.isFinite(audio.duration) && audio.duration > 0) {
      audio.currentTime = ratio * audio.duration
      setCurrent(audio.currentTime)
      return
    }

    // 2) Если duration = Infinity, но браузер сообщил seekable — считаем от конца
    if (audio.seekable.length > 0) {
      const end = audio.seekable.end(audio.seekable.length - 1)
      if (Number.isFinite(end) && end > 0) {
        audio.currentTime = ratio * end
        setCurrent(audio.currentTime)
      }
    }
  }

  const progress = duration > 0 ? (current / duration) * 100 : 0

  return (
    <div
      className={cn(
        'flex items-center gap-3',
        'rounded-md border border-ash bg-void/60',
        'px-3 py-2',
        className
      )}
    >
      <audio ref={audioRef} src={src} preload="metadata" />

      <button
        type="button"
        onClick={toggle}
        className={cn(
          'shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full',
          'border border-ash text-bone',
          'hover:border-signal hover:text-signal transition-colors',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-signal'
        )}
        aria-label={playing ? 'Пауза' : 'Играть'}
      >
        {playing ? (
          <Pause className="h-3.5 w-3.5" aria-hidden="true" />
        ) : (
          <Play className="h-3.5 w-3.5 translate-x-[1px]" aria-hidden="true" />
        )}
      </button>

      <div
        role="slider"
        aria-label="Прогресс"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        tabIndex={0}
        onClick={seek}
        className="relative flex-1 h-4 flex items-center cursor-pointer group"
      >
        <div className="absolute inset-x-0 h-[2px] bg-ash rounded-full" />
        <div
          className="absolute left-0 h-[2px] bg-signal rounded-full"
          style={{ width: `${progress}%` }}
        />
        <div
          className="absolute h-2.5 w-2.5 rounded-full bg-signal transition-transform duration-150 group-hover:scale-125"
          style={{ left: `calc(${progress}% - 5px)` }}
        />
      </div>

      <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-bone/50 tabular-nums">
        {formatTime(current)} / {formatTime(duration)}
      </span>

      {error && (
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-signal">
          {error}
        </span>
      )}
    </div>
  )
}