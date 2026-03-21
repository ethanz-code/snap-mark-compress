import React from 'react';
import { WatermarkSettings, CompressionSettings } from '../types';
import { Sliders, Type, Grid, FileDown, RotateCw, Droplets, Maximize2, Palette, Download, Archive, Loader2 } from 'lucide-react';

interface SettingsPanelProps {
  watermarkSettings: WatermarkSettings;
  setWatermarkSettings: React.Dispatch<React.SetStateAction<WatermarkSettings>>;
  compressionSettings: CompressionSettings;
  setCompressionSettings: React.Dispatch<React.SetStateAction<CompressionSettings>>;
  onDownload: () => void;
  onDownloadAll?: () => void;
  onBatchProcess?: () => void;
  isProcessing: boolean;
  isBatchProcessing?: boolean;
  originalSize: number;
  processedSize: number | null;
  originalWidth: number;
  originalHeight: number;
  imageCount?: number;
  processedCount?: number;
  t: any;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  watermarkSettings,
  setWatermarkSettings,
  compressionSettings,
  setCompressionSettings,
  onDownload,
  onDownloadAll,
  onBatchProcess,
  isProcessing,
  isBatchProcessing = false,
  originalSize,
  processedSize,
  originalWidth,
  originalHeight,
  imageCount = 1,
  processedCount = 0,
  t
}) => {
  
  const updateWatermark = (key: keyof WatermarkSettings, value: any) => {
    setWatermarkSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateCompression = (key: keyof CompressionSettings, value: number) => {
    setCompressionSettings(prev => ({ ...prev, [key]: value }));
  };

  const formatSize = (bytes: number) => {
     if (bytes === 0) return '0 B';
     const k = 1024;
     const sizes = ['B', 'KB', 'MB', 'GB'];
     const i = Math.floor(Math.log(bytes) / Math.log(k));
     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const targetWidth = Math.floor(originalWidth * compressionSettings.scale);
  const targetHeight = Math.floor(originalHeight * compressionSettings.scale);

  return (
    <div className="w-full md:w-96 bg-paper-50 dark:bg-neutral-900 border-l-2 border-ink-light/10 h-auto md:h-full flex flex-col shadow-[-4px_0px_10px_rgba(0,0,0,0.05)] z-20">
      <div className="p-6 border-b-2 border-dashed border-ink-light/10">
        <h2 className="text-2xl font-bold text-ink dark:text-white flex items-center gap-2 transform -rotate-1">
          <Sliders className="w-6 h-6 text-crayon-orange" />
          {t.config}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
        
        {/* Compression Section */}
        <div className="space-y-4 bg-white dark:bg-neutral-800 p-4 rounded-xl shadow-sm border border-ink-light/5">
          <h3 className="text-lg font-bold text-crayon-blue flex items-center gap-2">
            <FileDown className="w-5 h-5" /> {t.compression}
          </h3>
          
          <div className="space-y-2">
            <div className="flex justify-between text-base font-medium">
              <span className="text-ink dark:text-neutral-300">{t.scale}</span>
              <div className="text-right">
                <span className="bg-crayon-blue/10 text-crayon-blue px-2 rounded-md block mb-1">
                    {Math.round(compressionSettings.scale * 100)}%
                </span>
                <span className="text-xs text-ink-dim block">
                    {targetWidth} x {targetHeight}
                </span>
              </div>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.01"
              value={compressionSettings.scale}
              onChange={(e) => updateCompression('scale', parseFloat(e.target.value))}
              className="w-full h-3 bg-paper-200 rounded-lg appearance-none cursor-pointer accent-crayon-blue"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-base font-medium">
              <span className="text-ink dark:text-neutral-300">{t.quality}</span>
              <span className="bg-crayon-blue/10 text-crayon-blue px-2 rounded-md">{Math.round(compressionSettings.quality * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={compressionSettings.quality}
              onChange={(e) => updateCompression('quality', parseFloat(e.target.value))}
              className="w-full h-3 bg-paper-200 rounded-lg appearance-none cursor-pointer accent-crayon-blue"
            />
          </div>
        </div>

        {/* Watermark Content */}
        <div className="space-y-4 bg-white dark:bg-neutral-800 p-4 rounded-xl shadow-sm border border-ink-light/5">
          <h3 className="text-lg font-bold text-crayon-green flex items-center gap-2">
            <Type className="w-5 h-5" /> {t.watermarkText}
          </h3>
          <input
            type="text"
            value={watermarkSettings.text}
            onChange={(e) => updateWatermark('text', e.target.value)}
            placeholder={t.placeholder}
            className="w-full px-4 py-3 bg-paper-50 dark:bg-neutral-700 border-b-2 border-ink-light/30 focus:border-crayon-green outline-none text-xl font-hand text-ink dark:text-white placeholder-ink-dim/50 transition-colors"
          />
          
          <div className="flex items-center gap-3 mt-2">
             <button
               onClick={() => updateWatermark('isTiled', !watermarkSettings.isTiled)}
               className={`flex-1 py-2 px-3 sketchy-border-sm text-base font-bold transition-all flex items-center justify-center gap-2 ${
                   watermarkSettings.isTiled 
                   ? 'bg-crayon-green text-white border-transparent shadow-[2px_2px_0px_0px_#14532d]' 
                   : 'bg-white dark:bg-neutral-700 border-2 border-ink-light/20 text-ink dark:text-neutral-300 hover:bg-paper-100'
               }`}
             >
               <Grid className="w-4 h-4" /> {t.tiled}
             </button>
             <div className="relative flex items-center gap-2 bg-white dark:bg-neutral-700 p-1 sketchy-border-sm border-2 border-ink-light/20 pl-3">
                <span className="text-sm font-bold text-ink-dim">{t.color}</span>
                <input
                    type="color"
                    value={watermarkSettings.color}
                    onChange={(e) => updateWatermark('color', e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border-none bg-transparent"
                />
             </div>
          </div>
        </div>

        {/* Watermark Appearance */}
        <div className="space-y-5 bg-white dark:bg-neutral-800 p-4 rounded-xl shadow-sm border border-ink-light/5">
          <h3 className="text-lg font-bold text-crayon-purple flex items-center gap-2">
            <Palette className="w-5 h-5" /> {t.appearance}
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-ink dark:text-neutral-300">
                    <Maximize2 className="w-4 h-4" />
                    <span className="text-base font-medium">{t.size}</span>
                </div>
                <input
                    type="range"
                    min="12"
                    max="200"
                    value={watermarkSettings.fontSize}
                    onChange={(e) => updateWatermark('fontSize', parseInt(e.target.value))}
                    className="w-32 h-3 bg-paper-200 rounded-lg appearance-none cursor-pointer accent-crayon-purple"
                />
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-ink dark:text-neutral-300">
                    <Droplets className="w-4 h-4" />
                    <span className="text-base font-medium">{t.opacity}</span>
                </div>
                <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={watermarkSettings.opacity}
                    onChange={(e) => updateWatermark('opacity', parseFloat(e.target.value))}
                    className="w-32 h-3 bg-paper-200 rounded-lg appearance-none cursor-pointer accent-crayon-purple"
                />
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-ink dark:text-neutral-300">
                    <RotateCw className="w-4 h-4" />
                    <span className="text-base font-medium">{t.angle}</span>
                </div>
                <input
                    type="range"
                    min="-180"
                    max="180"
                    value={watermarkSettings.rotate}
                    onChange={(e) => updateWatermark('rotate', parseInt(e.target.value))}
                    className="w-32 h-3 bg-paper-200 rounded-lg appearance-none cursor-pointer accent-crayon-purple"
                />
            </div>

            {watermarkSettings.isTiled && (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-ink dark:text-neutral-300">
                        <Grid className="w-4 h-4" />
                        <span className="text-base font-medium">{t.spacing}</span>
                    </div>
                    <input
                        type="range"
                        min="20"
                        max="300"
                        value={watermarkSettings.gap}
                        onChange={(e) => updateWatermark('gap', parseInt(e.target.value))}
                        className="w-32 h-3 bg-paper-200 rounded-lg appearance-none cursor-pointer accent-crayon-purple"
                    />
                </div>
            )}
          </div>
        </div>

      </div>

      {/* Footer / CTA */}
      <div className="p-6 bg-paper-100 dark:bg-neutral-800 border-t-2 border-dashed border-ink-light/20 space-y-4">
        <div className="flex justify-between items-center text-sm text-ink-dim font-bold font-mono">
             <span className="bg-white dark:bg-neutral-700 px-2 py-1 rounded border border-ink-light/20">{t.original}: {formatSize(originalSize)}</span>
             {processedSize && (
                 <span className={`${processedSize < originalSize ? 'text-green-600 dark:text-green-400' : 'text-ink-dim'} bg-white dark:bg-neutral-700 px-2 py-1 rounded border border-ink-light/20`}>
                    {t.est}: {formatSize(processedSize)}
                 </span>
             )}
        </div>
        
        {/* Single image download */}
        <button
          onClick={onDownload}
          disabled={isProcessing || isBatchProcessing}
          className="w-full flex items-center justify-center gap-2 bg-crayon-orange hover:bg-orange-500 text-white py-4 sketchy-border font-bold text-xl shadow-[4px_4px_0px_0px_#9a3412] hover:shadow-[2px_2px_0px_0px_#9a3412] hover:translate-x-[2px] hover:translate-y-[2px] transition-all transform disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
        >
          {isProcessing ? (
            <span className="animate-pulse">{t.processing}</span>
          ) : (
            <>
              <Download className="w-6 h-6" /> {t.download}
            </>
          )}
        </button>
        
        {/* Batch operations - show when multiple images */}
        {imageCount > 1 && (
          <div className="flex gap-2 mt-3">
            <button
              onClick={onBatchProcess}
              disabled={isBatchProcessing}
              className="flex-1 flex items-center justify-center gap-2 bg-crayon-blue hover:bg-blue-600 text-white py-3 sketchy-border font-bold text-base shadow-[3px_3px_0px_0px_#1e40af] hover:shadow-[1px_1px_0px_0px_#1e40af] hover:translate-x-[2px] hover:translate-y-[2px] transition-all transform disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isBatchProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <RotateCw className="w-5 h-5" /> {t.processAll}
                </>
              )}
            </button>
            
            <button
              onClick={onDownloadAll}
              disabled={isBatchProcessing}
              className="flex-1 flex items-center justify-center gap-2 bg-crayon-green hover:bg-green-600 text-white py-3 sketchy-border font-bold text-base shadow-[3px_3px_0px_0px_#166534] hover:shadow-[1px_1px_0px_0px_#166534] hover:translate-x-[2px] hover:translate-y-[2px] transition-all transform disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isBatchProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Archive className="w-5 h-5" /> {t.downloadZip}
                </>
              )}
            </button>
          </div>
        )}
        
        {/* Progress indicator */}
        {imageCount > 1 && (
          <div className="mt-3 text-center">
            <span className="text-sm font-mono text-ink-dim">
              {processedCount}/{imageCount} {t.images}
            </span>
            <div className="w-full h-2 bg-paper-200 dark:bg-neutral-700 rounded-full mt-1 overflow-hidden">
              <div 
                className="h-full bg-crayon-green transition-all duration-300"
                style={{ width: `${(processedCount / imageCount) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPanel;
