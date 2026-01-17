// Webcam functionality with MediaPipe integration

class WebcamManager {
  constructor(videoElement, canvasElement) {
    this.video = videoElement
    this.canvas = canvasElement
    this.ctx = canvasElement ? canvasElement.getContext("2d") : null
    this.captureCanvas = null
    this.captureCtx = null
    this.captureWidth = 320
    this.captureHeight = 240
    this.stream = null
    this.isActive = false
    this.pose = null
    this.camera = null
    this.onResults = null // Callback for pose detection results
  }

  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30, max: 30 },
          facingMode: "user",
        },
        audio: false,
      })

      this.video.srcObject = this.stream
      await this.video.play()
      this.isActive = true

      // Set canvas dimensions to match video
      if (this.canvas) {
        this.canvas.width = this.video.videoWidth || 640
        this.canvas.height = this.video.videoHeight || 480
      }

      // Initialize a separate (small) capture canvas for backend inference
      this.captureCanvas = document.createElement("canvas")
      this.captureCanvas.width = this.captureWidth
      this.captureCanvas.height = this.captureHeight
      this.captureCtx = this.captureCanvas.getContext("2d")

      // Initialize MediaPipe Pose if available
      if (typeof Pose !== "undefined") {
        this.initializeMediaPipe()
      }

      return true
    } catch (error) {
      console.error("Error accessing webcam:", error)
      throw error
    }
  }

  initializeMediaPipe() {
    if (this.pose) return // Already initialized

    // Wait for video dimensions to be available
    const initPose = () => {
      if (this.video.videoWidth === 0 || this.video.videoHeight === 0) {
        setTimeout(initPose, 100)
        return
      }

      this.pose = new Pose({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
        },
      })

      this.pose.setOptions({
        modelComplexity: 0,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      })

      this.pose.onResults((results) => {
        if (this.onResults) {
          this.onResults(results)
        }
        this.drawMediaPipeResults(results)
      })

      // Start MediaPipe camera processing
      if (typeof Camera !== "undefined") {
        this.camera = new Camera(this.video, {
          onFrame: async () => {
            if (this.pose && this.isActive) {
              await this.pose.send({ image: this.video })
            }
          },
          width: this.video.videoWidth,
          height: this.video.videoHeight,
        })
        this.camera.start()
      }
    }

    initPose()
  }

  drawMediaPipeResults(results) {
    if (!this.ctx) return

    // Clear previous overlay
    this.ctx.save()
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    // Draw pose landmarks and connections if available
    if (results.poseLandmarks) {
      // Try to use MediaPipe drawing utilities if available
      if (typeof drawConnectors !== "undefined" && typeof drawLandmarks !== "undefined") {
        try {
          // POSE_CONNECTIONS should be available from the pose module
          // If not, we'll use a fallback
          const connections = window.POSE_CONNECTIONS || this.getDefaultPoseConnections()
          
          drawConnectors(this.ctx, results.poseLandmarks, connections, {
            color: "#00FF00",
            lineWidth: 2,
          })
          
          drawLandmarks(this.ctx, results.poseLandmarks, {
            color: "#FF0000",
            lineWidth: 1,
            radius: 3,
          })
        } catch (e) {
          // Fallback to manual drawing
          this.drawPoseManually(results.poseLandmarks)
        }
      } else {
        // Fallback: draw basic landmarks manually
        this.drawPoseManually(results.poseLandmarks)
      }
    }

    this.ctx.restore()
  }

  drawPoseManually(landmarks) {
    // Draw pose connections manually
    const connections = [
      [11, 12], [11, 13], [13, 15], [15, 17], [15, 19], [15, 21], [17, 19],
      [12, 14], [14, 16], [16, 18], [16, 20], [16, 22], [18, 20],
      [11, 23], [12, 24], [23, 24],
      [23, 25], [25, 27], [27, 29], [27, 31],
      [24, 26], [26, 28], [28, 30], [28, 32],
    ]

    // Draw connections
    this.ctx.strokeStyle = "#00FF00"
    this.ctx.lineWidth = 2
    connections.forEach(([start, end]) => {
      if (landmarks[start] && landmarks[end]) {
        const startX = landmarks[start].x * this.canvas.width
        const startY = landmarks[start].y * this.canvas.height
        const endX = landmarks[end].x * this.canvas.width
        const endY = landmarks[end].y * this.canvas.height

        this.ctx.beginPath()
        this.ctx.moveTo(startX, startY)
        this.ctx.lineTo(endX, endY)
        this.ctx.stroke()
      }
    })

    // Draw landmarks
    landmarks.forEach((landmark) => {
      const x = landmark.x * this.canvas.width
      const y = landmark.y * this.canvas.height

      this.ctx.beginPath()
      this.ctx.arc(x, y, 5, 0, 2 * Math.PI)
      this.ctx.fillStyle = "#FF0000"
      this.ctx.fill()
    })
  }

  getDefaultPoseConnections() {
    // Default MediaPipe pose connections (33 landmarks)
    return [
      [0, 1], [1, 2], [2, 3], [3, 7],
      [0, 4], [4, 5], [5, 6], [6, 8],
      [9, 10],
      [11, 12], [11, 13], [13, 15], [15, 17], [15, 19], [15, 21], [17, 19],
      [12, 14], [14, 16], [16, 18], [16, 20], [16, 22], [18, 20],
      [11, 23], [12, 24], [23, 24],
      [23, 25], [25, 27], [27, 29], [27, 31],
      [24, 26], [26, 28], [28, 30], [28, 32],
    ]
  }

  stop() {
    if (this.camera) {
      this.camera.stop()
      this.camera = null
    }
    if (this.pose) {
      this.pose.close()
      this.pose = null
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop())
      this.stream = null
    }
    this.video.srcObject = null
    this.isActive = false
    this.captureCanvas = null
    this.captureCtx = null
    this.clearOverlay()
  }

  captureFrame() {
    if (!this.isActive || !this.captureCanvas || !this.captureCtx) return null

    this.captureCtx.drawImage(this.video, 0, 0, this.captureWidth, this.captureHeight)
    return this.captureCanvas.toDataURL("image/jpeg", 0.6)
  }

  drawPoseOverlay(keypoints) {
    if (!this.ctx || !keypoints) return

    // This method is kept for backward compatibility
    // MediaPipe handles drawing automatically via drawMediaPipeResults
    // But we can still use this for custom keypoint drawing if needed
    keypoints.forEach((point) => {
      if (point.score > 0.3) {
        this.ctx.beginPath()
        this.ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI)
        this.ctx.fillStyle = "#0ea5e9"
        this.ctx.fill()
      }
    })
  }

  clearOverlay() {
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }
  }

  // Set callback for pose detection results
  setOnResults(callback) {
    this.onResults = callback
  }
}
