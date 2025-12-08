import React, { useRef, useEffect } from 'react';
import { WatermarkSettings, CompressionSettings } from '../types';
import { drawWatermark, getScaledSettings } from '../utils/canvasUtils';

interface PreviewCanvasProps {
  image: HTMLImageElement | null;
  watermarkSettings: WatermarkSettings;
  compressionSettings: CompressionSettings;
  className?: string;
}

const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
  image,
  watermarkSettings,
  compressionSettings,
  className
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate target dimensions
    const targetWidth = Math.floor(image.width * compressionSettings.scale);
    const targetHeight = Math.floor(image.height * compressionSettings.scale);

    // Update canvas size
    // Note: Changing canvas dimensions clears it automatically
    // To prevent flicker or extreme layout shifts, the parent container should handle max-width/height
    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
    } else {
        // Explicitly clear if dimensions didn't change but content did
        ctx.clearRect(0, 0, targetWidth, targetHeight);
    }

    // Draw background image
    ctx.drawImage(image, 0, 0, targetWidth, targetHeight);

    // Draw watermark
    // We scale the watermark settings so they look consistent with the resized image
    const scaledWatermarkSettings = getScaledSettings(watermarkSettings, compressionSettings.scale);
    
    drawWatermark(ctx, targetWidth, targetHeight, scaledWatermarkSettings);

  }, [image, watermarkSettings, compressionSettings]);

  return (
    <canvas 
      ref={canvasRef} 
      className={`max-w-full max-h-[75vh] object-contain shadow-lg ${className}`} 
    />
  );
};

export default PreviewCanvas;