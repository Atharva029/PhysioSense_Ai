// Webcam functionality

class WebcamManager {
  constructor(videoElement, canvasElement) {
    this.video = videoElement
    this.canvas = canvasElement
    this.ctx = canvasElement ? canvasElement.getContext("2d") : null
    this.stream = null
    this.isActive = false
  }

  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: false,
      })

      this.video.srcObject = this.stream
      await this.video.play()
      this.isActive = true

      // Set canvas dimensions to match video
      if (this.canvas) {
        this.canvas.width = this.video.videoWidth
        this.canvas.height = this.video.videoHeight
      }

      return true
    } catch (error) {
      console.error("Error accessing webcam:", error)
      throw error
    }
  }

  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop())
      this.stream = null
    }
    this.video.srcObject = null
    this.isActive = false
  }

  captureFrame() {
    if (!this.isActive || !this.canvas) return null

    this.ctx.drawImage(this.video, 0, 0)
    return this.canvas.toDataURL("image/jpeg", 0.8)
  }

  drawPoseOverlay(keypoints) {
    if (!this.ctx || !keypoints) return

    // Clear previous overlay
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    // Draw keypoints
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
}
