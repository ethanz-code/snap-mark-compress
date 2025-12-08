import React, { useState, useEffect, useRef, useCallback } from 'react';
import { WatermarkSettings, CompressionSettings, ImageFileState } from './types';
import DropZone from './components/DropZone';
import SettingsPanel from './components/SettingsPanel';
import PreviewCanvas from './components/PreviewCanvas';
import { loadImage, processImage } from './utils/canvasUtils';
import { Image as ImageIcon, X, RefreshCw, Globe } from 'lucide-react';

// Translations
const translations = {
  en: {
    title: "SnapMark",
    dragDrop: "Drag & Drop Image",
    orClick: "or click to browse",
    supports: "Supports JPG, PNG, WEBP",
    config: "Configuration",
    compression: "Compression",
    quality: "Quality",
    scale: "Resize",
    watermarkText: "Text",
    placeholder: "© Your Name",
    tiled: "Tiled",
    appearance: "Appearance",
    size: "Size",
    opacity: "Opacity",
    angle: "Angle",
    spacing: "Gap",
    processing: "Processing...",
    download: "Download Artwork",
    reset: "Start Over",
    heroTitle: "Mark it & Shrink it.",
    heroSubtitle: "Handcrafted style.",
    heroText: "Add your signature and optimize your images in a snap. Private, fast, and runs entirely in your browser.",
    loading: "Sketching preview...",
    original: "Original",
    est: "Est. Size",
    footer: "Jining Ruosen Software Development Center",
    contact: "business@itcox.cn",
    color: "Color"
  },
  zh: {
    title: "SnapMark",
    dragDrop: "把图片拖到这儿",
    orClick: "或者点击选择",
    supports: "支持 JPG, PNG, WEBP",
    config: "涂鸦配置",
    compression: "瘦身压缩",
    quality: "画质",
    scale: "缩放",
    watermarkText: "水印文字",
    placeholder: "© 你的名字",
    tiled: "铺满",
    appearance: "样式",
    size: "大小",
    opacity: "透明度",
    angle: "角度",
    spacing: "间距",
    processing: "处理中...",
    download: "下载图片",
    reset: "重新开始",
    heroTitle: "水印 & 压缩",
    heroSubtitle: "轻松搞定",
    heroText: "在浏览器中快速为图片添加个性水印并优化体积。隐私安全，即用即走。",
    loading: "正在描绘预览...",
    original: "原始大小",
    est: "预估大小",
    footer: "济宁若森软件开发中心",
    contact: "business@itcox.cn",
    color: "颜色"
  }
};

type Lang = 'zh' | 'en';

const App: React.FC = () => {
  const [lang, setLang] = useState<Lang>('zh');
  const t = translations[lang];

  // Store the raw Image Object for the canvas
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);

  const [imageState, setImageState] = useState<ImageFileState>({
    file: null,
    previewSrc: null, // Used only for initial loading or fallback
    originalWidth: 0,
    originalHeight: 0,
    originalSize: 0,
    processedSize: null,
    processedBlob: null,
  });

  const [watermarkSettings, setWatermarkSettings] = useState<WatermarkSettings>({
    text: '',
    fontSize: 48,
    color: '#000000',
    opacity: 0.25,
    rotate: -30,
    gap: 150,
    isTiled: true,
  });

  const [compressionSettings, setCompressionSettings] = useState<CompressionSettings>({
    quality: 0.8,
    scale: 1.0,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const debounceTimer = useRef<number | null>(null);

  // Handle File Selection
  const onFileSelect = async (file: File) => {
    const url = URL.createObjectURL(file);
    const img = await loadImage(url);
    
    setImgElement(img);
    setImageState({
      file,
      previewSrc: url,
      originalWidth: img.width,
      originalHeight: img.height,
      originalSize: file.size,
      processedSize: null,
      processedBlob: null,
    });
    
    // Set default text if empty
    if (!watermarkSettings.text) {
        setWatermarkSettings(prev => ({...prev, text: 'SnapMark'}));
    }
  };

  const resetApp = () => {
    setImgElement(null);
    setImageState({
      file: null,
      previewSrc: null,
      originalWidth: 0,
      originalHeight: 0,
      originalSize: 0,
      processedSize: null,
      processedBlob: null,
    });
  };

  // Heavy task: Calculate final blob size
  // We debounce this so it doesn't run on every slider tick
  const calculateFinalSize = useCallback(async () => {
    if (!imgElement) return;

    setIsProcessing(true);
    
    try {
        const { blob, url } = await processImage(imgElement, watermarkSettings, compressionSettings);
        
        setImageState(prev => ({
            ...prev,
            processedBlob: blob,
            processedSize: blob.size,
            // We do NOT update previewSrc here to avoid flickering/re-renders of an <img> tag. 
            // The canvas handles the visuals.
        }));
        
        // Cleanup the temporary URL created for the blob calculation as we don't display it directly yet
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Error processing image size:", error);
    } finally {
        setIsProcessing(false);
    }
  }, [imgElement, watermarkSettings, compressionSettings]);

  useEffect(() => {
    if (!imgElement) return;

    if (debounceTimer.current) {
        window.clearTimeout(debounceTimer.current);
    }

    // Debounce the heavy calculation by 500ms
    // The PreviewCanvas updates instantly via props, so the user sees changes immediately.
    // This effect just updates the "Estimated Size" number.
    debounceTimer.current = window.setTimeout(() => {
        calculateFinalSize();
    }, 500);

    return () => {
        if (debounceTimer.current) window.clearTimeout(debounceTimer.current);
    };
  }, [watermarkSettings, compressionSettings, imgElement]);

  const handleDownload = async () => {
    // If for some reason we click download before the debounce finishes, force calculation
    let blob = imageState.processedBlob;
    
    if (!blob && imgElement) {
        const result = await processImage(imgElement, watermarkSettings, compressionSettings);
        blob = result.blob;
    }

    if (blob) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const originalName = imageState.file?.name.split('.')[0] || 'image';
      link.download = `${originalName}_snapmark.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-hand bg-paper-50 dark:bg-paper-dark text-ink dark:text-ink-dark transition-colors duration-300 bg-paper-pattern dark:bg-paper-pattern-dark">
      
      {/* Navbar */}
      <header className="h-20 flex items-center justify-between px-4 md:px-8 z-10 sticky top-0 bg-paper-50/90 dark:bg-paper-dark/90 backdrop-blur-sm border-b-2 border-ink-light/10 dark:border-ink-dark/10">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={resetApp}>
           <div className="w-10 h-10 bg-crayon-orange rounded-lg sketchy-border-sm flex items-center justify-center text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] group-hover:rotate-6 transition-transform">
              <ImageIcon className="w-6 h-6" />
           </div>
           <h1 className="text-2xl md:text-3xl font-bold tracking-wide text-ink dark:text-ink-dark">{t.title}</h1>
        </div>
        
        <div className="flex items-center gap-4">
             <button 
                onClick={() => setLang(l => l === 'en' ? 'zh' : 'en')}
                className="flex items-center gap-2 px-3 py-1 rounded-full border-2 border-ink-light/20 hover:bg-paper-200 dark:hover:bg-paper-800 transition-colors"
             >
                <Globe className="w-4 h-4" />
                <span className="uppercase text-sm font-bold">{lang}</span>
             </button>

            {imgElement && (
                <button 
                    onClick={resetApp}
                    className="text-lg font-bold text-crayon-red hover:rotate-2 transition-transform flex items-center gap-1"
                >
                    <X className="w-5 h-5" /> {t.reset}
                </button>
            )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {!imgElement ? (
          /* Empty State - Hero */
          <div className="w-full flex-1 flex flex-col items-center justify-center p-6 text-center">
             <div className="max-w-3xl w-full bg-white dark:bg-neutral-800 p-8 md:p-12 sketchy-border shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-none border-2 border-ink-light/10">
                <h2 className="text-5xl md:text-6xl font-bold text-ink dark:text-white mb-2 transform -rotate-1">
                    {t.heroTitle}
                </h2>
                <h3 className="text-3xl md:text-4xl font-bold text-crayon-blue mb-6 transform rotate-1">
                    {t.heroSubtitle}
                </h3>
                <p className="text-xl text-ink-dim dark:text-gray-300 mb-10 max-w-lg mx-auto leading-relaxed">
                    {t.heroText}
                </p>
                <DropZone onFileSelect={onFileSelect} t={t} />
             </div>
          </div>
        ) : (
          /* Workspace */
          <>
            {/* Preview Area */}
            <div className="flex-1 relative flex items-center justify-center p-4 md:p-10 overflow-hidden bg-paper-100 dark:bg-neutral-900/50">
               {/* Decorative background elements */}
               <div className="absolute top-10 left-10 w-32 h-32 border-4 border-dashed border-crayon-yellow/30 rounded-full animate-spin-slow pointer-events-none"></div>
               <div className="absolute bottom-10 right-10 w-24 h-24 bg-crayon-purple/10 sketchy-border pointer-events-none transform rotate-12"></div>

               <div className="relative z-10 max-w-full max-h-full shadow-xl sketchy-border bg-white dark:bg-neutral-800 p-2 border-2 border-ink-light">
                  {imgElement ? (
                      <PreviewCanvas 
                        image={imgElement}
                        watermarkSettings={watermarkSettings}
                        compressionSettings={compressionSettings}
                      />
                  ) : (
                      <div className="flex flex-col items-center gap-4 text-ink-dim p-20">
                          <RefreshCw className="animate-spin w-10 h-10 text-crayon-orange" /> 
                          <span className="text-xl font-bold">{t.loading}</span>
                      </div>
                  )}
               </div>
            </div>

            {/* Sidebar Controls */}
            <SettingsPanel 
                t={t}
                watermarkSettings={watermarkSettings}
                setWatermarkSettings={setWatermarkSettings}
                compressionSettings={compressionSettings}
                setCompressionSettings={setCompressionSettings}
                onDownload={handleDownload}
                isProcessing={isProcessing}
                originalSize={imageState.originalSize}
                processedSize={imageState.processedSize}
                originalWidth={imageState.originalWidth}
                originalHeight={imageState.originalHeight}
            />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 bg-paper-100 dark:bg-paper-dark border-t-2 border-dashed border-ink-light/20 text-center space-y-2">
        <p className="font-bold text-ink dark:text-ink-dark text-lg">
            {t.footer}
        </p>
        <p className="text-ink-dim dark:text-ink-dark/60 font-mono text-sm">
            📧 {t.contact}
        </p>
      </footer>
    </div>
  );
};

export default App;