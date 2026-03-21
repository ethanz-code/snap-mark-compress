export interface WatermarkSettings {
  text: string;
  fontSize: number;
  color: string;
  opacity: number;
  rotate: number; // in degrees
  gap: number;
  isTiled: boolean;
}

export interface CompressionSettings {
  quality: number; // 0.1 to 1.0
  scale: number; // 0.1 to 1.0 (Resize factor)
}

export interface ImageFileState {
  id: string;
  file: File;
  previewSrc: string;
  imgElement: HTMLImageElement | null;
  originalWidth: number;
  originalHeight: number;
  originalSize: number; // in bytes
  processedSize: number | null; // in bytes
  processedBlob: Blob | null;
  isProcessing: boolean;
}
