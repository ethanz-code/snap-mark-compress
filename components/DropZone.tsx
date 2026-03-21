import React from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface DropZoneProps {
  onFilesSelect: (files: File[]) => void;
  t: any;
  multiple?: boolean;
}

const DropZone: React.FC<DropZoneProps> = ({ onFilesSelect, t, multiple = true }) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    if (files.length > 0) {
      onFilesSelect(files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      onFilesSelect(files);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="w-full max-w-xl mx-auto"
    >
      <label
        htmlFor="file-upload"
        className="group relative flex flex-col items-center justify-center w-full h-64 border-4 border-dashed border-ink-light/20 rounded-[2rem] cursor-pointer bg-paper-50 dark:bg-neutral-700/50 hover:bg-white dark:hover:bg-neutral-700 hover:border-crayon-orange hover:shadow-[4px_4px_0px_0px_#f97316] hover:-translate-y-1 transition-all duration-300"
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
          <div className="mb-4 p-4 bg-paper-200 dark:bg-neutral-600 rounded-full group-hover:scale-110 transition-transform border-2 border-ink-light/10">
            <Upload className="w-8 h-8 text-ink dark:text-white" />
          </div>
          <p className="mb-2 text-2xl font-bold text-ink dark:text-white transform group-hover:rotate-1 transition-transform">
            {t.dragDrop}
          </p>
          <p className="text-lg text-ink-dim dark:text-neutral-300 mb-4 font-medium">
            {t.orClick}
          </p>
          <div className="flex items-center gap-2 text-sm text-ink-dim/60 dark:text-neutral-400 font-bold bg-paper-200/50 dark:bg-neutral-800 px-3 py-1 rounded-full">
            <ImageIcon className="w-4 h-4" />
            <span>{t.supports}</span>
          </div>
        </div>
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          multiple={multiple}
          className="hidden"
          onChange={handleInputChange}
        />
      </label>
    </div>
  );
};

export default DropZone;
