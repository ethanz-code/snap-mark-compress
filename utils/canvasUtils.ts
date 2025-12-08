import { WatermarkSettings, CompressionSettings } from '../types';

export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
};

export const getScaledSettings = (
  watermarkSettings: WatermarkSettings,
  scale: number
): WatermarkSettings => {
  return {
    ...watermarkSettings,
    fontSize: watermarkSettings.fontSize * scale,
    gap: watermarkSettings.gap * scale,
  };
};

export const drawWatermark = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  settings: WatermarkSettings
) => {
  const { text, fontSize, color, opacity, rotate, gap, isTiled } = settings;

  if (!text) return;

  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = opacity;
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';

  // Measure text
  const metrics = ctx.measureText(text);
  const textWidth = metrics.width;
  const textHeight = fontSize; // Approximation

  if (isTiled) {
    // Tiling Logic
    // Rotate entire context around center
    const cx = width / 2;
    const cy = height / 2;
    
    ctx.translate(cx, cy);
    ctx.rotate((rotate * Math.PI) / 180);
    ctx.translate(-cx, -cy);

    // To cover the rotated area, we need to draw over a larger area
    const diagonal = Math.sqrt(width * width + height * height);
    const limit = diagonal * 1.5; 
    
    const xStep = textWidth + gap;
    const yStep = textHeight + gap + (gap * 0.5); // Add some vertical breathing room

    // Start drawing from negative coordinates to cover rotation
    for (let y = -limit; y < limit; y += yStep) {
        // Offset every other row for brick-like pattern
        const xOffset = (Math.floor(y / yStep) % 2 === 0) ? 0 : xStep / 2;
        
        for (let x = -limit; x < limit; x += xStep) {
            ctx.fillText(text, cx + x + xOffset, cy + y);
        }
    }
  } else {
    // Single Watermark (Bottom Right)
    ctx.translate(width / 2, height / 2);
    ctx.rotate((rotate * Math.PI) / 180);
    ctx.fillText(text, 0, 0); // Center
  }

  ctx.restore();
};

export const processImage = async (
  img: HTMLImageElement,
  watermarkSettings: WatermarkSettings,
  compressionSettings: CompressionSettings
): Promise<{ blob: Blob; url: string }> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('Could not get canvas context');

  // Apply scaling (Resize)
  const targetWidth = Math.floor(img.width * compressionSettings.scale);
  const targetHeight = Math.floor(img.height * compressionSettings.scale);

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  // Draw original image
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  // Draw watermark with scaled settings
  const scaledWatermarkSettings = getScaledSettings(watermarkSettings, compressionSettings.scale);
  drawWatermark(ctx, targetWidth, targetHeight, scaledWatermarkSettings);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve({
            blob,
            url: URL.createObjectURL(blob),
          });
        } else {
          reject(new Error('Canvas to Blob failed'));
        }
      },
      'image/jpeg', // Force JPEG for compression control
      compressionSettings.quality
    );
  });
};

export const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};