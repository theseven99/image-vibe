"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Upload,
  Download,
  RotateCcw,
  Sun,
  Palette,
  Loader2,
  Maximize2,
  Settings2,
  History,
  Github,
  Zap,
  Shield,
  Layers,
  Code2,
  Globe,
  Terminal,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useImageProcessor,
  defaultSettings,
  type AdjustmentSettings,
} from "@/hooks/use-image-processor";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/global";

export function ImageSharpenClient() {
  const [settings, setSettings] = useState<AdjustmentSettings>(defaultSettings);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [canvasMounted, setCanvasMounted] = useState(false);
  const [dimensionLimit, setDimensionLimit] = useState<string>("1080p");
  const [customWidth, setCustomWidth] = useState<number>(1920);
  const [customHeight, setCustomHeight] = useState<number>(1080);

  const { originalImage, setOriginalImage, processImage } = useImageProcessor();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Invalid file format. Please upload an image.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          let targetWidth = img.width;
          let targetHeight = img.height;

          if (dimensionLimit !== "none") {
            let limitW = 0;
            let limitH = 0;

            if (dimensionLimit === "720p") {
              limitW = 1280;
              limitH = 720;
            } else if (dimensionLimit === "1080p") {
              limitW = 1920;
              limitH = 1080;
            } else if (dimensionLimit === "custom") {
              limitW = customWidth;
              limitH = customHeight;
            }

            if (img.width > limitW || img.height > limitH) {
              const ratio = Math.min(limitW / img.width, limitH / img.height);
              targetWidth = Math.round(img.width * ratio);
              targetHeight = Math.round(img.height * ratio);
            }
          }

          if (targetWidth !== img.width || targetHeight !== img.height) {
            const canvas = document.createElement("canvas");
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
              const resizedImg = new window.Image();
              resizedImg.onload = () => {
                setOriginalImage(resizedImg);
                setSettings(defaultSettings);
                toast.success(
                  `Image resized to ${targetWidth}x${targetHeight} for processing.`,
                );
              };
              resizedImg.src = canvas.toDataURL("image/png");
            }
          } else {
            setOriginalImage(img);
            setSettings(defaultSettings);
            toast.success("Image loaded successfully.");
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    },
    [setOriginalImage, dimensionLimit, customWidth, customHeight],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleImageUpload(file);
    },
    [],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageUpload(file);
  }, []);

  const handleReset = useCallback(() => {
    setSettings(defaultSettings);
    toast.info("Settings reset to defaults.");
  }, []);

  const handleDownload = useCallback(() => {
    if (!originalImage) return;

    const canvas = document.createElement("canvas");
    processImage(originalImage, settings, canvas);
    const processedImage = canvas.toDataURL("image/jpeg", 0.95);

    const link = document.createElement("a");
    link.href = processedImage;
    link.download = `enhanced-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Image exported successfully.");
  }, []);

  useEffect(() => {
    if (!originalImage || !previewCanvasRef.current || !canvasMounted) return;

    const updatePreview = () => {
      setIsProcessing(true);
      processImage(originalImage, settings, previewCanvasRef.current);
      setIsProcessing(false);
    };

    const rafId = requestAnimationFrame(updatePreview);
    return () => cancelAnimationFrame(rafId);
  }, [originalImage, settings, processImage, canvasMounted]);

  const updateSetting = useCallback(
    (key: keyof AdjustmentSettings, value: number) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-slate-900 dark:text-slate-200 pb-12 relative font-sans">
      {/* HUD-like background effect */}
      <div className="fixed inset-0 pointer-events-none opacity-5 dark:opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-primary)_1px,transparent_1px)] bg-size-[40px_40px]" />
      </div>

      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-white/5 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight">{APP_NAME}</h1>
                <span className="px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-white/5 text-[10px] font-bold text-zinc-500 border border-zinc-200 dark:border-white/10 mt-1">
                  V1.0
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                {`Professional Adjustment Tool`}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="hidden sm:flex border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5"
              aria-label="View on GitHub"
            >
              <a
                href="https://github.com/theseven99/image-vibe"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </a>
            </Button>
            {originalImage && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="hidden sm:flex"
                >
                  <RotateCcw className="w-4 h-4 mr-2" /> Reset
                </Button>
                <Button
                  size="sm"
                  variant="default"
                  onClick={handleDownload}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  aria-label="Export processed image"
                >
                  <Download className="w-4 h-4 mr-2" /> Export
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 relative z-10">
        {/* Preview Area */}
        <div className="space-y-6">
          <Card
            className={cn(
              "relative aspect-square sm:aspect-video flex items-center justify-center overflow-hidden transition-all duration-300",
              "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 shadow-xl rounded-2xl",
              isDragging &&
                "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 scale-[1.01]",
              !originalImage && "cursor-pointer group",
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !originalImage && fileInputRef.current?.click()}
          >
            <AnimatePresence mode="wait">
              {!originalImage ? (
                <motion.div
                  key="upload-prompt"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col items-center gap-6 p-8 text-center"
                >
                  <div className="w-20 h-20 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-600 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    <Upload className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold tracking-tight">
                      Upload Image
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs">
                      Drag and drop your image here or click to browse files
                    </p>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="relative w-full h-full p-4 flex items-center justify-center"
                >
                  <div className="relative w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-950 rounded-lg overflow-hidden border border-zinc-200 dark:border-white/5">
                    <canvas
                      ref={(node) => {
                        previewCanvasRef.current = node;
                        if (node && !canvasMounted) setCanvasMounted(true);
                      }}
                      className={cn(
                        "max-w-full max-h-full object-contain transition-opacity duration-300",
                        showOriginal
                          ? "opacity-0 invisible"
                          : "opacity-100 visible",
                      )}
                    />

                    {originalImage && (
                      <div
                        className={cn(
                          "absolute inset-0 transition-opacity duration-300",
                          showOriginal
                            ? "opacity-100 visible"
                            : "opacity-0 invisible",
                        )}
                      >
                        <img
                          src={originalImage.src}
                          alt="Original"
                          className="object-contain size-full"
                        />
                      </div>
                    )}

                    {/* Compare Button */}
                    <Button
                      onMouseDown={() => setShowOriginal(true)}
                      onMouseUp={() => setShowOriginal(false)}
                      onMouseLeave={() => setShowOriginal(false)}
                      onTouchStart={() => setShowOriginal(true)}
                      onTouchEnd={() => setShowOriginal(false)}
                      className="absolute bottom-4 right-4 bg-zinc-900/80 dark:bg-white/10 backdrop-blur text-white px-4 py-2 rounded-lg text-xs font-bold tracking-widest uppercase border border-white/10 hover:bg-zinc-900 dark:hover:bg-white/20 transition-colors z-20"
                      aria-label="Hold to compare with original image"
                    >
                      Hold to Compare
                    </Button>

                    {isProcessing && (
                      <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest shadow-lg z-20">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Processing...
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* Info Bar */}
          {originalImage && (
            <div className="flex justify-between items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 p-4 rounded-xl shadow-sm">
              <div className="flex gap-6">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">
                    Resolution
                  </span>
                  <span className="text-sm font-mono font-bold">
                    {originalImage.width} × {originalImage.height}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">
                    Total Pixels
                  </span>
                  <span className="text-sm font-mono font-bold">
                    {(
                      originalImage.width * originalImage.height
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setOriginalImage(null);
                  setCanvasMounted(false);
                }}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                aria-label="Clear current image"
              >
                Clear Image
              </Button>
            </div>
          )}
        </div>

        {/* Adjustments Sidebar */}
        <aside className="space-y-6">
          <Tabs defaultValue="exposure" className="w-full">
            <TabsList className="w-full grid grid-cols-3 h-11 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-white/5">
              <TabsTrigger
                value="exposure"
                className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-700 data-[state=active]:shadow-sm text-[10px] font-bold uppercase tracking-wider"
              >
                <Sun className="w-3.5 h-3.5 mr-2" /> Light
              </TabsTrigger>
              <TabsTrigger
                value="color"
                className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-700 data-[state=active]:shadow-sm text-[10px] font-bold uppercase tracking-wider"
              >
                <Palette className="w-3.5 h-3.5 mr-2" /> Color
              </TabsTrigger>
              <TabsTrigger
                value="detail"
                className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-700 data-[state=active]:shadow-sm text-[10px] font-bold uppercase tracking-wider"
              >
                <Settings2 className="w-3.5 h-3.5 mr-2" /> Detail
              </TabsTrigger>
            </TabsList>

            <div className="mt-6 space-y-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 p-6 rounded-2xl">
              {/* Exposure Tabs */}
              <TabsContent value="exposure" className="space-y-6 mt-0">
                <ControlGroup
                  label="Exposure"
                  value={settings.exposure}
                  min={-100}
                  max={100}
                  onChange={(v) => updateSetting("exposure", v)}
                />
                <ControlGroup
                  label="Contrast"
                  value={settings.contrast}
                  min={-100}
                  max={100}
                  onChange={(v) => updateSetting("contrast", v)}
                />
                <ControlGroup
                  label="Highlights"
                  value={settings.highlights}
                  min={-100}
                  max={100}
                  onChange={(v) => updateSetting("highlights", v)}
                />
                <ControlGroup
                  label="Shadows"
                  value={settings.shadows}
                  min={-100}
                  max={100}
                  onChange={(v) => updateSetting("shadows", v)}
                />
              </TabsContent>

              {/* Color Tabs */}
              <TabsContent value="color" className="space-y-6 mt-0">
                <ControlGroup
                  label="Temperature"
                  value={settings.temperature}
                  min={-100}
                  max={100}
                  onChange={(v) => updateSetting("temperature", v)}
                />
                <ControlGroup
                  label="Tint"
                  value={settings.tint}
                  min={-100}
                  max={100}
                  onChange={(v) => updateSetting("tint", v)}
                />
                <ControlGroup
                  label="Saturation"
                  value={settings.saturation}
                  min={-100}
                  max={100}
                  onChange={(v) => updateSetting("saturation", v)}
                />
              </TabsContent>

              {/* Detail Tabs */}
              <TabsContent value="detail" className="space-y-6 mt-0">
                <ControlGroup
                  label="Sharpening"
                  value={settings.sharpen}
                  min={0}
                  max={100}
                  onChange={(v) => updateSetting("sharpen", v)}
                  description="Enhances edge definition and micro-contrast"
                />
                <ControlGroup
                  label="Noise Reduction"
                  value={settings.noiseReduction}
                  min={0}
                  max={100}
                  onChange={(v) => updateSetting("noiseReduction", v)}
                  description="Smooths out digital noise and grain"
                />

                <div className="pt-6 border-t border-zinc-100 dark:border-white/5 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Maximize2 className="w-4 h-4 text-blue-600" />
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                      Output Resolution
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "none", label: "Native" },
                      { id: "720p", label: "720p HD" },
                      { id: "1080p", label: "1080p FHD" },
                      { id: "custom", label: "Custom" },
                    ].map((opt) => (
                      <Button
                        key={opt.id}
                        onClick={() => setDimensionLimit(opt.id)}
                        className={cn(
                          "px-3 py-2 text-[10px] font-bold uppercase tracking-wider border rounded-lg transition-all",
                          dimensionLimit === opt.id
                            ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 border-zinc-900 dark:border-white shadow-sm"
                            : "bg-zinc-50 dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-700",
                        )}
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </div>

                  {dimensionLimit === "custom" && (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-zinc-400">
                          Width
                        </Label>
                        <input
                          type="number"
                          value={customWidth}
                          onChange={(e) =>
                            setCustomWidth(Number(e.target.value))
                          }
                          className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-white/10 rounded-lg px-2 py-1.5 font-mono text-xs text-center focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-zinc-400">
                          Height
                        </Label>
                        <input
                          type="number"
                          value={customHeight}
                          onChange={(e) =>
                            setCustomHeight(Number(e.target.value))
                          }
                          className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-white/10 rounded-lg px-2 py-1.5 font-mono text-xs text-center focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <div className="flex justify-center items-center gap-2 opacity-50">
            <div className="h-px flex-1 bg-zinc-200 dark:bg-white/5" />
            <History className="w-3 h-3" />
            <div className="h-px flex-1 bg-zinc-200 dark:bg-white/5" />
          </div>
        </aside>
      </main>

      {/* SEO Optimized Info Section */}
      <footer className="max-w-7xl mx-auto px-4 py-16 border-t border-zinc-200 dark:border-white/5 space-y-20">
        {/* Intro */}
        <article className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-widest border border-blue-500/20">
            Professional Image Processing
          </div>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Professional Online Photo Enhancer
          </h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Image Vibe is a high-performance, browser-based image laboratory
            designed for photographers and designers who demand excellence in
            every pixel.
          </p>
        </article>

        {/* Features */}
        <article className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Zap className="w-5 h-5 text-yellow-500" />}
            title="Instant Processing"
            description="Real-time feedback with zero latency. See your changes as you make them."
          />
          <FeatureCard
            icon={<Palette className="w-5 h-5 text-purple-500" />}
            title="Pro-Grade Adjustments"
            description="Fine-tune Exposure, Contrast, Highlights, Sharpen, Noise Reduction, and more with surgical precision."
          />
          <FeatureCard
            icon={<Maximize2 className="w-5 h-5 text-blue-500" />}
            title="Intelligent Resizing"
            description="Native 720p, 1080p, and Custom dimension limits to optimize your output."
          />
          <FeatureCard
            icon={<Shield className="w-5 h-5 text-green-500" />}
            title="Privacy First"
            description="Your images never leave your machine. All processing happens locally."
          />
          <FeatureCard
            icon={<Sun className="w-5 h-5 text-orange-500" />}
            title="Micro-Contrast"
            description="Advanced convolution filters to extract hidden details and edge definition."
          />
          {/* <FeatureCard
            icon={<Maximize2 className="w-5 h-5 text-indigo-500" />}
            title="Noise Reduction"
            description="Advanced smoothing algorithm to reduce digital noise and grain while preserving detail."
          /> */}
          <FeatureCard
            icon={<Layers className="w-5 h-5 text-pink-500" />}
            title="Premium HUD UI"
            description="A stunning, glassmorphic interface designed for deep focus and clarity."
          />
        </article>

        {/* Tech Stack & Dev */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/5 p-8 rounded-3xl shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Code2 className="w-32 h-32" />
            </div>
            <div className="relative space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">The Tech Stack</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                  Built upon a foundation of modern web excellence.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <TechItem label="Vite" href="https://vitejs.dev/" />
                <TechItem label="React 19" href="https://react.dev/" />
                <TechItem
                  label="Tailwind CSS v4"
                  href="https://tailwindcss.com/"
                />
                <TechItem
                  label="Framer Motion"
                  href="https://www.framer.com/motion/"
                />
                <TechItem label="Radix UI" href="https://www.radix-ui.com/" />
                <TechItem label="Lucide Icons" href="https://lucide.dev/" />
              </div>
            </div>
          </Card>

          <Card className="bg-zinc-900 dark:bg-black border-white/10 p-8 rounded-3xl shadow-xl text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Terminal className="w-32 h-32 text-blue-500" />
            </div>
            <div className="relative space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Local Development</h3>
                <p className="text-zinc-400 text-sm">Get started in seconds.</p>
              </div>
              <div className="space-y-4 font-mono text-sm">
                <div className="space-y-2">
                  <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">
                    1. Clone repository
                  </p>
                  <code className="block bg-white/5 p-3 rounded-lg border border-white/10 text-blue-400">
                    git clone https://github.com/theseven99/image-vibe.git
                  </code>
                </div>
                <div className="space-y-2">
                  <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">
                    2. Install & Start
                  </p>
                  <code className="block bg-white/5 p-3 rounded-lg border border-white/10 text-blue-400">
                    npm install && npm run dev
                  </code>
                </div>
              </div>
              <div className="pt-4 flex items-center gap-4 text-xs text-zinc-500">
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3 h-3" />
                  <span>GitHub Pages Ready</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3 h-3" />
                  <span>Vercel Optimized</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="text-center pt-12">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-600 italic">
            Developed by theseven99 — Studio-quality image editing directly in
            your browser.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="p-6 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/5 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
      <div className="w-12 h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h4 className="font-bold text-lg mb-2">{title}</h4>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
        {description}
      </p>
    </Card>
  );
}

function TechItem({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-white/5 hover:border-blue-500/50 hover:bg-white dark:hover:bg-zinc-800 transition-all group"
    >
      <span className="text-sm font-semibold">{label}</span>
      <ArrowLeft className="w-3 h-3 rotate-135 opacity-0 group-hover:opacity-100 transition-opacity" />
    </a>
  );
}

interface ControlGroupProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  description?: string;
}

function ControlGroup({
  label,
  value,
  min,
  max,
  onChange,
  description,
}: ControlGroupProps) {
  return (
    <div className="space-y-3 group">
      <div className="flex justify-between items-end">
        <div className="flex flex-col">
          <Label className="text-xs font-bold tracking-tight mb-0.5">
            {label}
          </Label>
          {description && (
            <span className="text-[9px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-tighter">
              {description}
            </span>
          )}
        </div>
        <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
          {value > 0 ? `+${value}` : value}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={1}
        onValueChange={(vals) => onChange(vals[0])}
        className="cursor-pointer"
      />
    </div>
  );
}
