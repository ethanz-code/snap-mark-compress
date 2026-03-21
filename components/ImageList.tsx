import React from 'react';
import { ImageFileState } from '../types';
import { X, CheckCircle, Loader2 } from 'lucide-react';
import { formatBytes } from '../utils/canvasUtils';

interface ImageListProps {
  images: ImageFileState[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  t: any;
}

const ImageList: React.FC<ImageListProps> = ({ 
  images, 
  selectedId, 
  onSelect, 
  onRemove,
  t 
}) => {
  if (images.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto p-2 bg-paper-100 dark:bg-neutral-800/50 border-b-2 border-dashed border-ink-light/10">
      {images.map((image) => (
        <div
          key={image.id}
          onClick={() => onSelect(image.id)}
          className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
            selectedId === image.id
              ? 'border-crayon-orange shadow-[2px_2px_0px_0px_#f97316] scale-105'
              : 'border-ink-light/20 hover:border-crayon-orange/50'
          }`}
        >
          <img
            src={image.previewSrc}
            alt={image.file.name}
            className="w-full h-full object-cover"
          />
          
          {/* Processing indicator */}
          {image.isProcessing && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
          
          {/* Processed indicator */}
          {image.processedBlob && !image.isProcessing && (
            <div className="absolute bottom-1 right-1">
              <CheckCircle className="w-4 h-4 text-green-500 drop-shadow-md" />
            </div>
          )}
          
          {/* Remove button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(image.id);
            }}
            className="absolute top-1 right-1 w-5 h-5 bg-crayon-red text-white rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity group-hover:opacity-100"
            style={{ opacity: selectedId === image.id ? 1 : undefined }}
          >
            <X className="w-3 h-3" />
          </button>
          
          {/* File size */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-1 py-0.5">
            <span className="text-[10px] text-white font-mono">
              {formatBytes(image.processedSize || image.originalSize, 1)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImageList;
