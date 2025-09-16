import "./Songs.css"
import { useEffect, useMemo, useRef, useState } from "react"
import axios from "axios"

const Songs = ({ mood }) => {
  const [tracks, setTracks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const audioRef = useRef(null)
  const activeSrc = useRef("")
  const [currentTrackId, setCurrentTrackId] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [durations, setDurations] = useState({}) // { [id]: seconds }
  const [currentTime, setCurrentTime] = useState(0)

  const queryMood = useMemo(() => (mood || "").toLowerCase(), [mood])

  useEffect(() => {
    const fetchSongs = async () => {
      setLoading(true)
      setError("")
      try {
        const params = queryMood ? { mood: queryMood } : {}
        const { data } = await axios.get("/api/song", { params })
        setTracks(data?.tracks || [])
      } catch (e) {
        setError("Failed to load songs")
      } finally {
        setLoading(false)
      }
    }
    fetchSongs()
  }, [queryMood])

  // Preload metadata to compute durations for all tracks
  useEffect(() => {
    const controllers = []
    tracks.forEach((t) => {
      if (t._id && t.audio && durations[t._id] == null) {
        const a = new Audio()
        a.preload = "metadata"
        a.src = t.audio
        const onLoaded = () => {
          setDurations((prev) => ({ ...prev, [t._id]: isFinite(a.duration) ? a.duration : 0 }))
          a.removeEventListener("loadedmetadata", onLoaded)
        }
        a.addEventListener("loadedmetadata", onLoaded)
        controllers.push(a)
      }
    })
    return () => {
      controllers.forEach((a) => {
        a.src = ""
      })
    }
  }, [tracks, durations])

  // Attach playback listeners
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onTime = () => setCurrentTime(audio.currentTime || 0)
    const onEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }
    audio.addEventListener("play", onPlay)
    audio.addEventListener("pause", onPause)
    audio.addEventListener("timeupdate", onTime)
    audio.addEventListener("ended", onEnded)
    return () => {
      audio.removeEventListener("play", onPlay)
      audio.removeEventListener("pause", onPause)
      audio.removeEventListener("timeupdate", onTime)
      audio.removeEventListener("ended", onEnded)
    }
  }, [])

  const formatTime = (s) => {
    if (!isFinite(s) || s <= 0) return "00:00"
    const minutes = Math.floor(s / 60)
    const seconds = Math.floor(s % 60)
    const m = String(minutes).padStart(2, "0")
    const sec = String(seconds).padStart(2, "0")
    return `${m}:${sec}`
  }

  const handlePlayPause = (track) => {
    if (!track?.audio) return
    const audio = audioRef.current
    if (!audio) return
    // Toggle if same track
    if (currentTrackId === track._id && activeSrc.current === track.audio) {
      if (audio.paused) {
        audio.play().catch(() => {})
      } else {
        audio.pause()
      }
      return
    }
    // Start new track
    activeSrc.current = track.audio
    setCurrentTrackId(track._id)
    setCurrentTime(0)
    audio.src = track.audio
    audio.play().catch(() => {})
  }

  return (
    <div className="songs-section">
      <audio ref={audioRef} style={{ display: "none" }} />
      <h2 className="songs-title">Recommended Tracks{queryMood ? ` - ${queryMood}` : ""}</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div className="tracks-list">
        {tracks.map((track) => {
          const isActive = currentTrackId === track._id
          const duration = durations[track._id]
          const left = isActive ? Math.max((duration || 0) - currentTime, 0) : duration
          return (
            <div key={track._id} className="track-item">
              <div className="track-info">
                <h4 className="track-title">{track.title}</h4>
                <p className="track-artist">{track.artist}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span className="track-duration" title="Duration">
                  {isActive ? `${formatTime(currentTime)} / ${formatTime(duration)}` : formatTime(duration)}
                </span>
                <button
                  className="play-btn"
                  aria-label={(isActive && isPlaying) ? `Pause ${track.title}` : `Play ${track.title}`}
                  onClick={() => handlePlayPause(track)}
                >
                  {(isActive && isPlaying) ? (
                    // Pause icon
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 5H10V19H6V5Z" fill="currentColor" />
                      <path d="M14 5H18V19H14V5Z" fill="currentColor" />
                    </svg>
                  ) : (
                    // Play icon
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 5V19L19 12L8 5Z" fill="currentColor" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )
        })}
        {!loading && tracks.length === 0 && (
          <p>No tracks found{queryMood ? ` for mood "${queryMood}"` : ""}.</p>
        )}
      </div>
    </div>
  )
}

export default Songs
