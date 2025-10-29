"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const POSES = {
  POSE_3: 3,
  POSE_2: 2,
  POSE_1: 1,
}

export function CameraModal({ open, onClose, onCapture }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const handsRef = useRef(null)
  const cameraRef = useRef(null)
  
  const [currentPose, setCurrentPose] = useState(3)
  const [countdown, setCountdown] = useState(null)
  const [capturedPhoto, setCapturedPhoto] = useState(null)
  const [isDetecting, setIsDetecting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (open && videoRef.current) {
      initializeHands()
    }
    return () => {
      cleanup()
    }
  }, [open])

  const cleanup = () => {
    if (cameraRef.current) {
      if (cameraRef.current instanceof MediaStream) {
        const tracks = cameraRef.current.getTracks()
        tracks.forEach(track => track.stop())
      }
      cameraRef.current = null
    }
    if (handsRef.current) {
      handsRef.current.close()
      handsRef.current = null
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject
      const tracks = stream.getTracks()
      tracks.forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
  }

  const loadMediaPipeHands = useCallback(async () => {
    if (typeof window === 'undefined') return null
    
    if (window.Hands) {
      return window.Hands
    }
    
    return new Promise((resolve, reject) => {
      const existingScript = document.querySelector('script[data-mediapipe-hands]')
      if (existingScript) {
        const checkInterval = setInterval(() => {
          if (window.Hands) {
            clearInterval(checkInterval)
            resolve(window.Hands)
          }
        }, 100)
        setTimeout(() => {
          clearInterval(checkInterval)
          if (window.Hands) {
            resolve(window.Hands)
          } else {
            reject(new Error('Hands not loaded after timeout'))
          }
        }, 5000)
        return
      }
      
      const script = document.createElement('script')
      script.setAttribute('data-mediapipe-hands', 'true')
      script.type = 'module'
      const importCode = ['import', ' { Hands }', ' from', " 'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4/hands.js';", '\n        window.Hands = Hands;', '\n        window.dispatchEvent(new Event(\'mediapipe-hands-loaded\'));']
      script.textContent = importCode.join('')
      
      const handleLoad = () => {
        if (window.Hands) {
          resolve(window.Hands)
        } else {
          reject(new Error('Hands not available after load'))
        }
      }
      
      window.addEventListener('mediapipe-hands-loaded', handleLoad, { once: true })
      script.onerror = () => {
        window.removeEventListener('mediapipe-hands-loaded', handleLoad)
        reject(new Error('Failed to load MediaPipe Hands from CDN'))
      }
      
      document.head.appendChild(script)
      
      setTimeout(() => {
        if (window.Hands) {
          resolve(window.Hands)
        }
      }, 10000)
    })
  }, [])

  const initializeHands = async () => {
    try {
      setError(null)
      
      const Hands = await loadMediaPipeHands()
      if (!Hands) {
        throw new Error('Unable to load MediaPipe Hands')
      }
      
      const hands = new Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        }
      })

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      })

      hands.onResults(onResults)
      handsRef.current = hands

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play()
          setIsDetecting(true)
          startDetectionLoop()
        }
      }

      cameraRef.current = stream
    } catch (err) {
      console.error('Error initializing camera:', err)
      setError('Failed to access camera. Please allow camera permissions.')
    }
  }

  const startDetectionLoop = async () => {
    const detect = async () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && handsRef.current && !countdown && !capturedPhoto) {
        try {
          await handsRef.current.send({ image: videoRef.current })
        } catch (err) {
          console.error('Error in detection:', err)
        }
      }
      if (!capturedPhoto && isDetecting) {
        requestAnimationFrame(detect)
      }
    }
    detect()
  }

  const detectPose = (landmarks) => {
    if (!landmarks || landmarks.length < 21) return null

    const THUMB_TIP = 4
    const INDEX_TIP = 8
    const MIDDLE_TIP = 12
    const RING_TIP = 16
    const PINKY_TIP = 20
    
    const THUMB_IP = 3
    const INDEX_PIP = 6
    const MIDDLE_PIP = 10
    const RING_PIP = 14
    const PINKY_PIP = 18

    const isThumbUp = landmarks[THUMB_TIP].x > landmarks[THUMB_IP].x
    const isIndexUp = landmarks[INDEX_TIP].y < landmarks[INDEX_PIP].y
    const isMiddleUp = landmarks[MIDDLE_TIP].y < landmarks[MIDDLE_PIP].y
    const isRingUp = landmarks[RING_TIP].y < landmarks[RING_PIP].y
    const isPinkyUp = landmarks[PINKY_TIP].y < landmarks[PINKY_PIP].y

    if (isIndexUp && isMiddleUp && isRingUp && !isThumbUp && !isPinkyUp) {
      return POSES.POSE_3
    }
    if (isIndexUp && isMiddleUp && !isRingUp && !isThumbUp && !isPinkyUp) {
      return POSES.POSE_2
    }
    if (isIndexUp && !isMiddleUp && !isRingUp && !isThumbUp && !isPinkyUp) {
      return POSES.POSE_1
    }

    return null
  }

  const onResults = (results) => {
    if (!canvasRef.current || !videoRef.current) return

    const container = videoRef.current.parentElement
    if (container) {
      canvasRef.current.width = container.offsetWidth
      canvasRef.current.height = container.offsetHeight
    }

    const canvasCtx = canvasRef.current.getContext('2d')
    canvasCtx.save()
    canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    canvasCtx.drawImage(
      results.image,
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    )

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0 && !countdown && !capturedPhoto) {
      const landmarks = results.multiHandLandmarks[0]
      const detectedPose = detectPose(landmarks)

      if (detectedPose && detectedPose === currentPose) {
        const x = Math.min(...landmarks.map(l => l.x)) * canvasRef.current.width
        const y = Math.min(...landmarks.map(l => l.y)) * canvasRef.current.height
        const width = (Math.max(...landmarks.map(l => l.x)) - Math.min(...landmarks.map(l => l.x))) * canvasRef.current.width
        const height = (Math.max(...landmarks.map(l => l.y)) - Math.min(...landmarks.map(l => l.y))) * canvasRef.current.height
        
        canvasCtx.strokeStyle = '#22c55e'
        canvasCtx.lineWidth = 3
        canvasCtx.strokeRect(x, y, width, height)
        
        canvasCtx.fillStyle = '#22c55e'
        canvasCtx.fillRect(x, y - 30, 80, 30)
        canvasCtx.fillStyle = 'white'
        canvasCtx.font = '16px Arial'
        canvasCtx.fillText(`Pose ${detectedPose}`, x + 5, y - 10)

        if (detectedPose === POSES.POSE_3) {
          setTimeout(() => {
            setCurrentPose(POSES.POSE_2)
          }, 1000)
        } else if (detectedPose === POSES.POSE_2) {
          setTimeout(() => {
            setCurrentPose(POSES.POSE_1)
          }, 1000)
        } else if (detectedPose === POSES.POSE_1) {
          startCountdown()
        }
      } else if (detectedPose) {
        const x = Math.min(...landmarks.map(l => l.x)) * canvasRef.current.width
        const y = Math.min(...landmarks.map(l => l.y)) * canvasRef.current.height
        const width = (Math.max(...landmarks.map(l => l.x)) - Math.min(...landmarks.map(l => l.x))) * canvasRef.current.width
        const height = (Math.max(...landmarks.map(l => l.y)) - Math.min(...landmarks.map(l => l.y))) * canvasRef.current.height
        
        canvasCtx.strokeStyle = '#ef4444'
        canvasCtx.lineWidth = 3
        canvasCtx.strokeRect(x, y, width, height)
      }

      if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
          canvasCtx.fillStyle = '#00FFFF'
          canvasCtx.strokeStyle = '#00FFFF'
          canvasCtx.lineWidth = 2

          for (let i = 0; i < landmarks.length; i++) {
            const x = landmarks[i].x * canvasRef.current.width
            const y = landmarks[i].y * canvasRef.current.height
            canvasCtx.beginPath()
            canvasCtx.arc(x, y, 3, 0, 2 * Math.PI)
            canvasCtx.fill()
          }
        }
      }
    }

    if (countdown !== null && countdown > 0) {
      canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.5)'
      canvasCtx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      canvasCtx.fillStyle = 'white'
      canvasCtx.font = 'bold 72px Arial'
      canvasCtx.textAlign = 'center'
      canvasCtx.textBaseline = 'middle'
      canvasCtx.fillText(
        `Capturing photo in ${countdown}`,
        canvasRef.current.width / 2,
        canvasRef.current.height / 2 - 50
      )
      canvasCtx.font = 'bold 120px Arial'
      canvasCtx.fillText(
        countdown.toString(),
        canvasRef.current.width / 2,
        canvasRef.current.height / 2 + 50
      )
    }

    canvasCtx.restore()
  }

  const startCountdown = () => {
    let timer = 3
    setCountdown(timer)

    const countdownInterval = setInterval(() => {
      timer--
      setCountdown(timer)

      if (timer <= 0) {
        clearInterval(countdownInterval)
        capturePhoto()
      }
    }, 1000)
  }

  const capturePhoto = () => {
    if (!videoRef.current || !videoRef.current.videoWidth) return

    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    const ctx = canvas.getContext('2d')
    
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
    
    const dataUrl = canvas.toDataURL('image/png')
    setCapturedPhoto(dataUrl)
    setCountdown(null)
    setIsDetecting(false)
    cleanup()
  }

  const handleRetake = () => {
    setCapturedPhoto(null)
    setCurrentPose(3)
    setCountdown(null)
    setIsDetecting(true)
    initializeHands()
  }

  const handleSubmit = () => {
    if (capturedPhoto && onCapture) {
      fetch(capturedPhoto)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'profile-photo.png', { type: 'image/png' })
          onCapture(file)
          handleClose()
        })
    }
  }

  const handleClose = () => {
    cleanup()
    setCapturedPhoto(null)
    setCurrentPose(3)
    setCountdown(null)
    setIsDetecting(false)
    setError(null)
    onClose()
  }

  const getPoseInstructions = () => {
    if (currentPose === POSES.POSE_3) return "Show 3 fingers (index, middle, ring)"
    if (currentPose === POSES.POSE_2) return "Show 2 fingers (index, middle) - peace sign"
    if (currentPose === POSES.POSE_1) return "Show 1 finger (index)"
    return ""
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-xl font-semibold">Raise Your Hand to Capture</DialogTitle>
          <DialogDescription className="text-base">
            We&apos;ll take the photo once your hand pose is detected.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6">
          <div className="relative w-full bg-black rounded-lg overflow-hidden mb-4" style={{ aspectRatio: '4/3' }}>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full"
              style={{ width: '100%', height: '100%' }}
            />
            
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                <p className="text-white text-center px-4">{error}</p>
              </div>
            )}

            {!isDetecting && !capturedPhoto && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                <p className="text-white">Loading camera...</p>
              </div>
            )}
          </div>

          {capturedPhoto && (
            <div className="mb-4">
              <img
                src={capturedPhoto}
                alt="Captured photo"
                className="w-full rounded-lg"
                style={{ aspectRatio: '4/3', objectFit: 'cover' }}
              />
            </div>
          )}

          {!capturedPhoto && (
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">
                To take a picture, follow the hand poses in the order shown below. The system will automatically capture the image once the final pose is detected.
              </p>
              
              <div className="flex items-center justify-center gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 border-2 border-gray-300 rounded-lg flex items-center justify-center bg-white p-2">
                    <Image
                      src="/pose-3.svg"
                      alt="Pose 3"
                      width={48}
                      height={48}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-xs text-gray-500 mt-2">Pose 3</span>
                </div>
                
                <span className="text-gray-400">&gt;</span>
                
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 border-2 border-gray-300 rounded-lg flex items-center justify-center bg-white p-2">
                    <Image
                      src="/pose-2.svg"
                      alt="Pose 2"
                      width={48}
                      height={48}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-xs text-gray-500 mt-2">Pose 2</span>
                </div>
                
                <span className="text-gray-400">&gt;</span>
                
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 border-2 border-gray-300 rounded-lg flex items-center justify-center bg-white p-2">
                    <Image
                      src="/pose-1.svg"
                      alt="Pose 1"
                      width={48}
                      height={48}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-xs text-gray-500 mt-2">Pose 1</span>
                </div>
              </div>
              
              {currentPose && (
                <p className="text-center text-sm text-teal-600 font-medium mt-4">
                  Current: {getPoseInstructions()}
                </p>
              )}
            </div>
          )}

          <div className="flex gap-3">
            {capturedPhoto ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleRetake}
                  className="flex-1"
                >
                  Retake photo
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
                >
                  Submit
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                onClick={handleClose}
                className="w-full"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

