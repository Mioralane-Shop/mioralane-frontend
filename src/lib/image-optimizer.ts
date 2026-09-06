export type OptimizedImageMimeType = "image/jpeg" | "image/png" | "image/webp";

export interface ImageOptimizationResult {
  file: File;
  originalSize: number;
  optimizedSize: number;
  originalWidth: number;
  originalHeight: number;
  optimizedWidth: number;
  optimizedHeight: number;
  compressionPercent: number;
  wasOptimized: boolean;
  detectedMimeType: OptimizedImageMimeType;
  preservedTransparency: boolean;
  outputMimeType: OptimizedImageMimeType;
  qualityUsed: number | null;
  targetSizeReached: boolean;
}

export interface ImageCompressionComparisonCandidate {
  file: File;
  optimizedSize: number;
  optimizedWidth: number;
  optimizedHeight: number;
  compressionPercent: number;
  outputMimeType: Exclude<OptimizedImageMimeType, "image/png">;
  qualityUsed: number;
  targetSizeReached: boolean;
}

export interface ImageOptimizationComparisonResult {
  optimization: ImageOptimizationResult;
  candidates: ImageCompressionComparisonCandidate[];
}

export class ImageOptimizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageOptimizationError";
  }
}

const MAX_INPUT_SIZE_BYTES = 25 * 1024 * 1024;
const MAX_LONGEST_SIDE = 3000;
const NO_RECOMPRESS_SIZE_BYTES = 2 * 1024 * 1024;
const TARGET_SIZE_BYTES = 2 * 1024 * 1024;
const QUALITY_STEPS = [0.85, 0.8, 0.75];
const WEBP_MIN_RELATIVE_SAVINGS = 0.12;
const WEBP_MIN_ABSOLUTE_SAVINGS_BYTES = 64 * 1024;

const MIME_TO_EXTENSION: Record<OptimizedImageMimeType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const bytesToHex = (bytes: Uint8Array): string =>
  Array.from(bytes)
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");

export async function detectImageMimeType(file: File): Promise<OptimizedImageMimeType> {
  const header = new Uint8Array(await file.slice(0, 32).arrayBuffer());

  if (
    header.length >= 8 &&
    header[0] === 0x89 &&
    header[1] === 0x50 &&
    header[2] === 0x4e &&
    header[3] === 0x47 &&
    header[4] === 0x0d &&
    header[5] === 0x0a &&
    header[6] === 0x1a &&
    header[7] === 0x0a
  ) {
    return "image/png";
  }

  if (header.length >= 3 && header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff) {
    return "image/jpeg";
  }

  if (header.length >= 12) {
    const riff = new TextDecoder().decode(header.slice(0, 4));
    const webp = new TextDecoder().decode(header.slice(8, 12));
    if (riff === "RIFF" && webp === "WEBP") {
      return "image/webp";
    }
  }

  throw new ImageOptimizationError(
    `Unsupported image format. Detected signature: ${bytesToHex(header.slice(0, 12))}`
  );
}

function isCanvasSupported(): boolean {
  return typeof document !== "undefined";
}

function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

async function loadImage(file: File): Promise<{ image: HTMLImageElement; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new window.Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        image,
        width: image.naturalWidth || image.width,
        height: image.naturalHeight || image.height,
      });
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new ImageOptimizationError("Failed to decode image"));
    };

    image.decoding = "async";
    image.src = objectUrl;
  });
}

async function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: OptimizedImageMimeType,
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new ImageOptimizationError("Failed to encode optimized image"));
          return;
        }

        resolve(blob);
      },
      type,
      quality
    );
  });
}

async function encodeCanvas(
  canvas: HTMLCanvasElement,
  mimeType: OptimizedImageMimeType,
  quality?: number
): Promise<Blob> {
  return canvasToBlob(canvas, mimeType, quality);
}

function fitWithinBounds(width: number, height: number, maxSide: number): { width: number; height: number } {
  const longestSide = Math.max(width, height);
  if (longestSide <= maxSide) {
    return { width, height };
  }

  const scale = maxSide / longestSide;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

async function detectTransparency(image: HTMLImageElement, width: number, height: number): Promise<boolean> {
  const sampleWidth = Math.min(128, width);
  const sampleHeight = Math.min(128, height);
  const canvas = createCanvas(sampleWidth, sampleHeight);
  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) {
    return false;
  }

  context.drawImage(image, 0, 0, sampleWidth, sampleHeight);
  const pixels = context.getImageData(0, 0, sampleWidth, sampleHeight).data;

  for (let index = 3; index < pixels.length; index += 4) {
    if (pixels[index] < 255) {
      return true;
    }
  }

  return false;
}

function createOptimizedName(originalName: string, mimeType: OptimizedImageMimeType): string {
  const baseName = originalName.replace(/\.[^.]+$/, "").replace(/[^\w.-]+/g, "-").replace(/-+/g, "-");
  const extension = MIME_TO_EXTENSION[mimeType];
  return `${baseName || "image"}-optimized.${extension}`;
}

function createDiagnosticName(
  originalName: string,
  mimeType: Exclude<OptimizedImageMimeType, "image/png">,
  quality: number
): string {
  const baseName = originalName.replace(/\.[^.]+$/, "").replace(/[^\w.-]+/g, "-").replace(/-+/g, "-");
  const extension = MIME_TO_EXTENSION[mimeType];
  const qualityTag = Math.round(quality * 100).toString().padStart(2, "0");
  return `${baseName || "image"}-q${qualityTag}.${extension}`;
}

function isMeaningfullySmaller(candidateSize: number, baselineSize: number): boolean {
  if (baselineSize <= 0) {
    return true;
  }

  const absoluteSavings = baselineSize - candidateSize;
  const relativeSavings = absoluteSavings / baselineSize;
  return absoluteSavings >= WEBP_MIN_ABSOLUTE_SAVINGS_BYTES && relativeSavings >= WEBP_MIN_RELATIVE_SAVINGS;
}

async function chooseBestOpaqueOutput(
  canvas: HTMLCanvasElement
): Promise<{ mimeType: Exclude<OptimizedImageMimeType, "image/png">; blob: Blob }> {
  const initialQuality = QUALITY_STEPS[0];
  const jpegBlob = await encodeCanvas(canvas, "image/jpeg", initialQuality);

  try {
    const webpBlob = await encodeCanvas(canvas, "image/webp", initialQuality);
    const shouldUseWebp =
      (jpegBlob.size > TARGET_SIZE_BYTES && webpBlob.size <= TARGET_SIZE_BYTES) ||
      (webpBlob.size < jpegBlob.size && isMeaningfullySmaller(webpBlob.size, jpegBlob.size));

    return {
      mimeType: shouldUseWebp ? "image/webp" : "image/jpeg",
      blob: shouldUseWebp ? webpBlob : jpegBlob,
    };
  } catch {
    return {
      mimeType: "image/jpeg",
      blob: jpegBlob,
    };
  }
}

async function encodeWithAdaptiveQuality(
  canvas: HTMLCanvasElement,
  mimeType: OptimizedImageMimeType,
  initialBlob?: Blob
): Promise<{ blob: Blob; qualityUsed: number | null }> {
  if (mimeType === "image/png") {
    return {
      blob: await encodeCanvas(canvas, mimeType),
      qualityUsed: null,
    };
  }

  let fallbackBlob = initialBlob ?? null;

  for (let index = 0; index < QUALITY_STEPS.length; index += 1) {
    const quality = QUALITY_STEPS[index];
    const blob = index === 0 && initialBlob ? initialBlob : await encodeCanvas(canvas, mimeType, quality);
    fallbackBlob = blob;

    if (blob.size <= TARGET_SIZE_BYTES) {
      return { blob, qualityUsed: quality };
    }
  }

  if (!fallbackBlob) {
    throw new ImageOptimizationError("Failed to encode optimized image");
  }

  return { blob: fallbackBlob, qualityUsed: QUALITY_STEPS[QUALITY_STEPS.length - 1] };
}

async function encodeDiagnosticCandidates(
  canvas: HTMLCanvasElement,
  originalName: string,
  outputMimeType: Exclude<OptimizedImageMimeType, "image/png">,
  originalSize: number,
  width: number,
  height: number
): Promise<ImageCompressionComparisonCandidate[]> {
  const qualities = [0.75, 0.7, 0.65];
  const candidates: ImageCompressionComparisonCandidate[] = [];

  for (const quality of qualities) {
    const blob = await encodeCanvas(canvas, outputMimeType, quality);
    const optimizedFile = new File([blob], createDiagnosticName(originalName, outputMimeType, quality), {
      type: blob.type || outputMimeType,
      lastModified: Date.now(),
    });

    const optimizedSize = optimizedFile.size;
    candidates.push({
      file: optimizedFile,
      optimizedSize,
      optimizedWidth: width,
      optimizedHeight: height,
      compressionPercent: originalSize === 0
        ? 0
        : Math.max(0, Math.round((1 - optimizedSize / originalSize) * 100)),
      outputMimeType,
      qualityUsed: quality,
      targetSizeReached: optimizedSize <= TARGET_SIZE_BYTES,
    });
  }

  return candidates;
}

async function prepareImageOptimizationCanvas(file: File): Promise<{
  file: File;
  detectedMimeType: OptimizedImageMimeType;
  image: HTMLImageElement;
  originalWidth: number;
  originalHeight: number;
  originalSize: number;
  hasTransparency: boolean;
  targetDimensions: { width: number; height: number };
  canvas: HTMLCanvasElement;
}> {
  if (!isCanvasSupported()) {
    throw new ImageOptimizationError("Image optimization is only available in the browser");
  }

  if (file.size > MAX_INPUT_SIZE_BYTES) {
    throw new ImageOptimizationError("File exceeds the 25 MB input limit");
  }

  const detectedMimeType = await detectImageMimeType(file);
  const { image, width: originalWidth, height: originalHeight } = await loadImage(file);
  const originalSize = file.size;
  const hasTransparency = detectedMimeType === "image/png"
    ? await detectTransparency(image, originalWidth, originalHeight)
    : false;
  const targetDimensions = fitWithinBounds(originalWidth, originalHeight, MAX_LONGEST_SIDE);
  const canvas = createCanvas(targetDimensions.width, targetDimensions.height);
  const context = canvas.getContext("2d");

  if (!context) {
    throw new ImageOptimizationError("Canvas rendering is not supported in this browser");
  }

  context.drawImage(image, 0, 0, targetDimensions.width, targetDimensions.height);

  return {
    file,
    detectedMimeType,
    image,
    originalWidth,
    originalHeight,
    originalSize,
    hasTransparency,
    targetDimensions,
    canvas,
  };
}

export async function generateImageOptimizationComparison(file: File): Promise<ImageOptimizationComparisonResult> {
  const {
    detectedMimeType,
    originalWidth,
    originalHeight,
    originalSize,
    hasTransparency,
    targetDimensions,
    canvas,
  } = await prepareImageOptimizationCanvas(file);

  const longestSide = Math.max(originalWidth, originalHeight);

  if (originalSize <= NO_RECOMPRESS_SIZE_BYTES && longestSide <= MAX_LONGEST_SIDE) {
    const optimization: ImageOptimizationResult = {
      file,
      originalSize,
      optimizedSize: originalSize,
      originalWidth,
      originalHeight,
      optimizedWidth: originalWidth,
      optimizedHeight: originalHeight,
      compressionPercent: 0,
      wasOptimized: false,
      detectedMimeType,
      preservedTransparency: hasTransparency,
      outputMimeType: detectedMimeType,
      qualityUsed: null,
      targetSizeReached: true,
    };

    return {
      optimization,
      candidates: [],
    };
  }

  let outputMimeType: OptimizedImageMimeType;
  let optimizedBlob: Blob;
  let qualityUsed: number | null = null;

  if (detectedMimeType === "image/png" && hasTransparency) {
    outputMimeType = "image/png";
    optimizedBlob = await encodeCanvas(canvas, outputMimeType);
  } else {
    const selected = await chooseBestOpaqueOutput(canvas);
    outputMimeType = selected.mimeType;
    const adaptive = await encodeWithAdaptiveQuality(canvas, outputMimeType, selected.blob);
    optimizedBlob = adaptive.blob;
    qualityUsed = adaptive.qualityUsed;
  }

  const optimizedFile = new File([optimizedBlob], createOptimizedName(file.name, outputMimeType), {
    type: optimizedBlob.type || outputMimeType,
    lastModified: Date.now(),
  });

  const optimizedSize = optimizedFile.size;
  const optimization: ImageOptimizationResult = {
    file: optimizedFile,
    originalSize,
    optimizedSize,
    originalWidth,
    originalHeight,
    optimizedWidth: targetDimensions.width,
    optimizedHeight: targetDimensions.height,
    compressionPercent: originalSize === 0
      ? 0
      : Math.max(0, Math.round((1 - optimizedSize / originalSize) * 100)),
    wasOptimized: optimizedSize < originalSize || targetDimensions.width !== originalWidth || targetDimensions.height !== originalHeight,
    detectedMimeType,
    preservedTransparency: detectedMimeType === "image/png" ? hasTransparency : false,
    outputMimeType,
    qualityUsed,
    targetSizeReached: optimizedSize <= TARGET_SIZE_BYTES,
  };

  if (detectedMimeType === "image/png" && hasTransparency) {
    return {
      optimization,
      candidates: [],
    };
  }

  const candidates = await encodeDiagnosticCandidates(
    canvas,
    file.name,
    outputMimeType as Exclude<OptimizedImageMimeType, "image/png">,
    originalSize,
    targetDimensions.width,
    targetDimensions.height
  );

  return {
    optimization,
    candidates,
  };
}

export async function optimizeImageFile(file: File): Promise<ImageOptimizationResult> {
  const {
    detectedMimeType,
    originalWidth,
    originalHeight,
    originalSize,
    hasTransparency,
    targetDimensions,
    canvas,
  } = await prepareImageOptimizationCanvas(file);

  const longestSide = Math.max(originalWidth, originalHeight);

  if (originalSize <= NO_RECOMPRESS_SIZE_BYTES && longestSide <= MAX_LONGEST_SIDE) {
    return {
      file,
      originalSize,
      optimizedSize: originalSize,
      originalWidth,
      originalHeight,
      optimizedWidth: originalWidth,
      optimizedHeight: originalHeight,
      compressionPercent: 0,
      wasOptimized: false,
      detectedMimeType,
      preservedTransparency: hasTransparency,
      outputMimeType: detectedMimeType,
      qualityUsed: null,
      targetSizeReached: true,
    };
  }

  let outputMimeType: OptimizedImageMimeType;
  let blob: Blob;
  let qualityUsed: number | null = null;

  if (detectedMimeType === "image/png" && hasTransparency) {
    outputMimeType = "image/png";
    blob = await encodeCanvas(canvas, outputMimeType);
  } else {
    const selected = await chooseBestOpaqueOutput(canvas);
    outputMimeType = selected.mimeType;
    const adaptive = await encodeWithAdaptiveQuality(canvas, outputMimeType, selected.blob);
    blob = adaptive.blob;
    qualityUsed = adaptive.qualityUsed;
  }

  const optimizedFile = new File([blob], createOptimizedName(file.name, outputMimeType), {
    type: blob.type || outputMimeType,
    lastModified: Date.now(),
  });

  const optimizedSize = optimizedFile.size;

  return {
    file: optimizedFile,
    originalSize,
    optimizedSize,
    originalWidth,
    originalHeight,
    optimizedWidth: targetDimensions.width,
    optimizedHeight: targetDimensions.height,
    compressionPercent: originalSize === 0
      ? 0
      : Math.max(0, Math.round((1 - optimizedSize / originalSize) * 100)),
    wasOptimized: optimizedSize < originalSize || targetDimensions.width !== originalWidth || targetDimensions.height !== originalHeight,
    detectedMimeType,
    preservedTransparency: detectedMimeType === "image/png" ? hasTransparency : false,
    outputMimeType,
    qualityUsed,
    targetSizeReached: optimizedSize <= TARGET_SIZE_BYTES,
  };
}
