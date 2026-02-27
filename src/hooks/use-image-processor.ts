"use client";

import { useState, useCallback, useRef } from "react";

export interface AdjustmentSettings {
  exposure: number;
  contrast: number;
  highlights: number;
  shadows: number;
  whites: number;
  blacks: number;
  temperature: number;
  tint: number;
  saturation: number;
  sharpen: number;
  noiseReduction: number;
}

export const defaultSettings: AdjustmentSettings = {
  exposure: 0,
  contrast: 0,
  highlights: 0,
  shadows: 0,
  whites: 0,
  blacks: 0,
  temperature: 0,
  tint: 0,
  saturation: 0,
  sharpen: 0, // Medium default
  noiseReduction: 0,
};

export function useImageProcessor() {
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(
    null,
  );
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(
    null,
  );
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const processImage = useCallback(
    (
      image: HTMLImageElement,
      settings: AdjustmentSettings,
      targetCanvas?: HTMLCanvasElement | null,
    ) => {
      const canvas =
        targetCanvas || canvasRef.current || document.createElement("canvas");
      if (!targetCanvas) canvasRef.current = canvas;

      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) return;

      // Only resize if needed
      if (canvas.width !== image.width || canvas.height !== image.height) {
        canvas.width = image.width;
        canvas.height = image.height;
      }

      ctx.drawImage(image, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // 1. Basic Adjustments (Per Pixel)
      const {
        exposure,
        contrast,
        highlights,
        shadows,
        whites,
        blacks,
        temperature,
        tint,
        saturation,
        sharpen,
        noiseReduction,
      } = settings;

      const expShift = exposure * 2.55;
      const contrastFactor =
        (259 * (contrast + 255)) / (255 * (259 - contrast));

      const tempR = temperature > 0 ? temperature * 0.5 : 0;
      const tempB = temperature < 0 ? -temperature * 0.5 : 0;
      const tintG = tint < 0 ? -tint * 0.5 : 0;
      const tintM = tint > 0 ? tint * 0.5 : 0;

      for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // Exposure
        r += expShift;
        g += expShift;
        b += expShift;

        // Contrast
        r = contrastFactor * (r - 128) + 128;
        g = contrastFactor * (g - 128) + 128;
        b = contrastFactor * (b - 128) + 128;

        // Temperature / Tint
        r += tempR + tintM;
        g += tintG;
        b += tempB + tintM;

        // Simple Saturation
        const gray = 0.2989 * r + 0.587 * g + 0.114 * b;
        const satFactor = (saturation + 100) / 100;
        r = gray + (r - gray) * satFactor;
        g = gray + (g - gray) * satFactor;
        b = gray + (b - gray) * satFactor;

        // Highlights / Shadows (Simplified)
        if (r > 190) r += highlights * 0.5 + whites * 0.5;
        else if (r < 64) r += shadows * 0.5 + blacks * 0.5;

        if (g > 190) g += highlights * 0.5 + whites * 0.5;
        else if (g < 64) g += shadows * 0.5 + blacks * 0.5;

        if (b > 190) b += highlights * 0.5 + whites * 0.5;
        else if (b < 64) b += shadows * 0.5 + blacks * 0.5;

        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
      }

      ctx.putImageData(imageData, 0, 0);

      // 2. Sharpen (Convolution)
      if (sharpen > 0) {
        const sharpenAmount = (sharpen / 100) * 1.5;
        const kernel = [
          0,
          -sharpenAmount,
          0,
          -sharpenAmount,
          1 + 4 * sharpenAmount,
          -sharpenAmount,
          0,
          -sharpenAmount,
          0,
        ];

        const sharpenedData = applyConvolution(
          ctx,
          canvas.width,
          canvas.height,
          kernel,
        );
        if (sharpenedData) {
          ctx.putImageData(sharpenedData, 0, 0);
        }
      }

      // 3. Noise Reduction (Smoothing Convolution)
      if (noiseReduction > 0) {
        // Simple 3x3 box blur kernel
        const blurAmount = noiseReduction / 100;
        const v = blurAmount / 9;
        const center = 1 - blurAmount + v;
        const kernel = [v, v, v, v, center, v, v, v, v];

        const smoothedData = applyConvolution(
          ctx,
          canvas.width,
          canvas.height,
          kernel,
        );
        if (smoothedData) {
          ctx.putImageData(smoothedData, 0, 0);
        }
      }

      // If we are not rendering to a visible canvas, update the URL (for download)
      if (!targetCanvas) {
        setProcessedImageUrl(canvas.toDataURL("image/jpeg", 0.9));
      }
    },
    [],
  );

  return {
    originalImage,
    setOriginalImage,
    processedImageUrl,
    processImage,
    canvasRef,
  };
}

function applyConvolution(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  kernel: number[],
) {
  const input = ctx.getImageData(0, 0, width, height);
  const output = ctx.createImageData(width, height);
  const inputData = input.data;
  const outputData = output.data;

  const side = Math.round(Math.sqrt(kernel.length));
  const halfSide = Math.floor(side / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dstOff = (y * width + x) * 4;
      let r = 0,
        g = 0,
        b = 0;

      for (let ky = 0; ky < side; ky++) {
        for (let kx = 0; kx < side; kx++) {
          const scy = y + ky - halfSide;
          const scx = x + kx - halfSide;

          if (scy >= 0 && scy < height && scx >= 0 && scx < width) {
            const srcOff = (scy * width + scx) * 4;
            const wt = kernel[ky * side + kx];
            r += inputData[srcOff] * wt;
            g += inputData[srcOff + 1] * wt;
            b += inputData[srcOff + 2] * wt;
          }
        }
      }

      outputData[dstOff] = r;
      outputData[dstOff + 1] = g;
      outputData[dstOff + 2] = b;
      outputData[dstOff + 3] = inputData[dstOff + 3];
    }
  }
  return output;
}
