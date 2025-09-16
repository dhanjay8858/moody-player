"use client"

import { useRef, useEffect, useState } from "react"
import * as faceapi from "face-api.js"
import Songs from "./Songs"
import "./FacialExpression.css"
import { motion, AnimatePresence } from "framer-motion"

export default function FacialExpression() {
  const videoRef = useRef(null)
  const [isDetecting, setIsDetecting] = useState(false)
  const [currentMood, setCurrentMood] = useState("")

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models"
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL)
      await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
      startVideo()
    }
    loadModels()
  }, [])

  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream
      })
      .catch((err) => console.error("Camera error:", err))
  }

  const detectMood = async () => {
    if (videoRef.current) {
      setIsDetecting(true)
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions()

      if (detections && detections.length > 0) {
        const expressions = detections[0].expressions
        const mood = Object.keys(expressions).reduce((a, b) =>
          expressions[a] > expressions[b] ? a : b
        )
        setCurrentMood(mood)
        console.log("Detected mood:", mood)
      } else {
        console.log("No face detected")
      }
      setIsDetecting(false)
    }
  }

  // 🔥 Scroll animation logic
  useEffect(() => {
    const elements = document.querySelectorAll(".fade-in-section")
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible")
          }
        })
      },
      { threshold: 0.2 }
    )
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="app-container">
      <header className="app-header fade-in-section">
        <div className="header-content">
          <div className="logo">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"
                fill="currentColor"
              />
            </svg>
            <span>Moody Player</span>
          </div>
        </div>
      </header>

      <main className="main-content">
        <h1 className="section-title fade-in-section">Live Mood Detection</h1>

        <div className="mood-detection-section fade-in-section">
          <div className="video-container">
            <video ref={videoRef} autoPlay muted className="mood-video" />
          </div>

          <div className="mood-info">
            <h3 className="mood-title">Live Mood Detection</h3>
            <p className="mood-description">
              Your current mood is being analyzed in real-time. Enjoy music
              tailored to your feelings.
            </p>
            <button
              className="start-listening-btn"
              onClick={detectMood}
              disabled={isDetecting}
            >
              {isDetecting ? "Analyzing..." : "Start Listening"}
            </button>

            <AnimatePresence mode="wait">
              {currentMood && (
                <motion.p
                  key={currentMood}
                  className="detected-mood"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  Current mood: {currentMood}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="fade-in-section">
          <Songs mood={currentMood} />
        </div>
      </main>
    </div>
  )
}
