import { Pose } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { POSE_CONNECTIONS } from '@mediapipe/pose';

let pose = null;
let camera = null;

/**
 * Initialize MediaPipe Pose
 * @param {HTMLVideoElement} videoElement - Video element for camera input
 * @param {HTMLCanvasElement} canvasElement - Canvas element for drawing
 * @param {Function} onResults - Callback function for pose results
 * @returns {Promise<void>}
 */
export async function initializePose(videoElement, canvasElement, onResults) {
  pose = new Pose({
    locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
    },
  });

  pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    smoothSegmentation: false,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });

  pose.onResults((results) => {
    // Draw pose landmarks on canvas
    const ctx = canvasElement.getContext('2d');
    ctx.save();
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    ctx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    // Draw pose connections and landmarks
    if (results.poseLandmarks) {
      drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, {
        color: '#00FF00',
        lineWidth: 2,
      });
      drawLandmarks(ctx, results.poseLandmarks, {
        color: '#FF0000',
        lineWidth: 1,
        radius: 3,
      });
    }

    // Call the callback with results
    if (onResults) {
      onResults(results);
    }

    ctx.restore();
  });

  // Initialize camera
  camera = new Camera(videoElement, {
    onFrame: async () => {
      await pose.send({ image: videoElement });
    },
    width: 640,
    height: 480,
  });

  await camera.start();
}

/**
 * Stop pose estimation and camera
 */
export function stopPose() {
  if (camera) {
    camera.stop();
    camera = null;
  }
  if (pose) {
    pose.close();
    pose = null;
  }
}

/**
 * Extract keypoints from pose results
 * @param {Object} results - MediaPipe pose results
 * @returns {Array} Array of keypoint objects
 */
export function extractKeypoints(results) {
  if (!results.poseLandmarks) {
    return [];
  }

  return results.poseLandmarks.map((landmark, index) => ({
    x: landmark.x,
    y: landmark.y,
    z: landmark.z,
    visibility: landmark.visibility,
    index,
  }));
}

/**
 * Calculate angle between three points
 * @param {Object} point1 - First point {x, y}
 * @param {Object} point2 - Second point (vertex) {x, y}
 * @param {Object} point3 - Third point {x, y}
 * @returns {number} Angle in degrees
 */
export function calculateAngle(point1, point2, point3) {
  const radians =
    Math.atan2(point3.y - point2.y, point3.x - point2.x) -
    Math.atan2(point1.y - point2.y, point1.x - point2.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) {
    angle = 360 - angle;
  }
  return angle;
}

/**
 * Calculate distance between two points
 * @param {Object} point1 - First point {x, y}
 * @param {Object} point2 - Second point {x, y}
 * @returns {number} Distance
 */
export function calculateDistance(point1, point2) {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
}
