"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { isAxiosError } from "axios";
import { CheckCircle2, Image as ImageIcon, Loader2, RefreshCw, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToastStore } from "@/store/toast.store";
import {
  ImageOptimizationError,
  generateImageOptimizationComparison,
  type ImageOptimizationResult,
  type ImageOptimizationComparisonResult,
} from "@/lib/image-optimizer";
import { uploadOptimizedImage, type ImageKitTestUploadData } from "@/services/image-upload-test.service";

type PreviewState = {
  originalUrl: string;
  optimizedUrl: string;
};

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const formatDimensions = (width: number, height: number): string => `${width} x ${height}`;

const formatPercent = (value: number): string => `${value.toFixed(0)}%`;

export function ImageUploadTest() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const addToast = useToastStore((state) => state.addToast);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [optimization, setOptimization] = useState<ImageOptimizationResult | null>(null);
  const [comparison, setComparison] = useState<ImageOptimizationComparisonResult | null>(null);
  const [previews, setPreviews] = useState<PreviewState | null>(null);
  const [comparisonPreviews, setComparisonPreviews] = useState<string[]>([]);
  const [expandedCandidateIndex, setExpandedCandidateIndex] = useState<number | null>(null);
  const [uploadResult, setUploadResult] = useState<ImageKitTestUploadData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!selectedFile || !optimization) {
      setPreviews(null);
      return;
    }

    const originalUrl = URL.createObjectURL(selectedFile);
    const optimizedUrl =
      optimization.file === selectedFile ? originalUrl : URL.createObjectURL(optimization.file);

    setPreviews({ originalUrl, optimizedUrl });

    return () => {
      URL.revokeObjectURL(originalUrl);
      if (optimizedUrl !== originalUrl) {
        URL.revokeObjectURL(optimizedUrl);
      }
    };
  }, [optimization, selectedFile]);

  useEffect(() => {
    setExpandedCandidateIndex(null);

    if (!comparison?.candidates.length) {
      setComparisonPreviews([]);
      return;
    }

    const urls = comparison.candidates.map((candidate) => URL.createObjectURL(candidate.file));
    setComparisonPreviews(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [comparison]);

  const summary = useMemo(() => {
    if (!optimization) return null;

    const reduction = optimization.compressionPercent;
    return {
      original: `${formatDimensions(optimization.originalWidth, optimization.originalHeight)} - ${formatBytes(optimization.originalSize)}`,
      optimized: `${formatDimensions(optimization.optimizedWidth, optimization.optimizedHeight)} - ${formatBytes(optimization.optimizedSize)}`,
      reduction: reduction > 0 ? `${formatPercent(reduction)} smaller` : "No compression needed",
      format: optimization.outputMimeType,
      quality:
        optimization.qualityUsed === null ? "n/a" : optimization.qualityUsed.toFixed(2),
      targetReached: optimization.targetSizeReached ? "Yes" : "No",
    };
  }, [optimization]);

  const reset = () => {
    setSelectedFile(null);
    setOptimization(null);
    setComparison(null);
    setPreviews(null);
    setComparisonPreviews([]);
    setExpandedCandidateIndex(null);
    setUploadResult(null);
    setError(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";

    setUploadResult(null);
    setError(null);

    if (!file) {
      reset();
      return;
    }

    setSelectedFile(file);
    setOptimization(null);
    setPreviews(null);
    setIsOptimizing(true);

    try {
      const result = await generateImageOptimizationComparison(file);
      setOptimization(result.optimization);
      setComparison(result);
    } catch (err) {
      const message =
        err instanceof ImageOptimizationError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Image optimization failed";

      setSelectedFile(null);
      setComparison(null);
      setError(message);
      addToast(message, "error");
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleUpload = async () => {
    if (!optimization) {
      setError("Select and optimize an image first.");
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadResult(null);

    try {
      const response = await uploadOptimizedImage(optimization.file);
      setUploadResult(response);
      addToast("Optimized image uploaded successfully", "success");
    } catch (err) {
      const message = isAxiosError(err)
        ? err.response?.data?.message ?? err.message
        : err instanceof Error
          ? err.message
          : "Upload failed";

      setError(message);
      addToast(message, "error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8">
      <div className="rounded-[2rem] border border-brand-100 bg-gradient-to-br from-brand-50 via-white to-amber-50 p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-500">
          Development only
        </p>
        <h1 className="mt-3 text-3xl font-light tracking-tight text-neutral-800 md:text-4xl">
          Image optimization test
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500">
          Select a JPEG, PNG, or WebP image, optimize it in the browser, then upload the optimized file to the backend test endpoint.
        </p>
      </div>

      <Card className="border-brand-100">
        <CardHeader>
          <CardTitle className="text-neutral-800">Select image</CardTitle>
          <CardDescription>
            The browser will validate the file signature, preserve aspect ratio, and keep the upload under the temporary 5 MB test limit.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => {
              void handleSelect(event);
            }}
            className="max-w-xl"
          />

          {isOptimizing && (
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <Loader2 className="h-4 w-4 animate-spin text-brand-500" />
              Optimizing image in browser...
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {optimization && summary && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <Card className="border-brand-100">
            <CardHeader>
              <CardTitle className="text-neutral-800">Original</CardTitle>
              <CardDescription>{summary.original}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <PreviewFrame title={selectedFile?.name ?? "Original file"} src={previews?.originalUrl} />
            </CardContent>
          </Card>

          <Card className="border-brand-100">
            <CardHeader>
              <CardTitle className="text-neutral-800">Optimized</CardTitle>
              <CardDescription>
                {summary.optimized}
                <br />
                {summary.reduction}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <PreviewFrame title={optimization.file.name} src={previews?.optimizedUrl} />

              <div className="grid gap-3 text-sm text-neutral-600 sm:grid-cols-2">
                <Stat label="Detected type" value={optimization.detectedMimeType} />
                <Stat label="Output format" value={summary.format} />
                <Stat label="Quality used" value={summary.quality} />
                <Stat label="<= 2 MB target" value={summary.targetReached} />
                <Stat
                  label="Transparency"
                  value={optimization.preservedTransparency ? "Preserved" : "Not present"}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {optimization && (
        <Card className="border-brand-100">
          <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-800">
                Ready to upload optimized file
              </p>
              <p className="mt-1 text-sm text-neutral-500">
      Upload will send the optimized File object, not the original.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={reset} disabled={isUploading}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset
              </Button>
              <Button onClick={() => void handleUpload()} disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Optimized Image
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {comparison?.candidates.length ? (
        <Card className="border-brand-100">
          <CardHeader>
            <CardTitle className="text-neutral-800">Diagnostic comparison</CardTitle>
            <CardDescription>
              Same resized canvas, same output format, different quality floors for visual inspection.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 lg:grid-cols-3">
              {comparison.candidates.map((candidate, index) => (
                <button
                  key={`${candidate.qualityUsed}-${candidate.outputMimeType}`}
                  type="button"
                  onClick={() => setExpandedCandidateIndex(index)}
                  className="group overflow-hidden rounded-3xl border border-brand-100 bg-[#FAF8F5] text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-center justify-between border-b border-brand-100 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-neutral-800">
                        Quality {candidate.qualityUsed.toFixed(2)}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {candidate.outputMimeType === "image/webp" ? "WebP" : "JPEG"}
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                      Enlarge
                    </span>
                  </div>

                  <div className="p-4">
                    <div className="flex min-h-[260px] items-center justify-center overflow-hidden rounded-2xl border border-white/70 bg-white/70 p-3">
                      {comparisonPreviews[index] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={comparisonPreviews[index]}
                          alt={`Diagnostic preview quality ${candidate.qualityUsed.toFixed(2)}`}
                          className="max-h-[420px] w-full max-w-full cursor-zoom-in object-contain"
                        />
                      ) : null}
                    </div>

                    <div className="mt-4 grid gap-2 text-sm text-neutral-600">
                      <Stat label="Dimensions" value={formatDimensions(candidate.optimizedWidth, candidate.optimizedHeight)} />
                      <Stat label="File size" value={formatBytes(candidate.optimizedSize)} />
                      <Stat label="Output format" value={candidate.outputMimeType} />
                      <Stat label="Quality used" value={candidate.qualityUsed.toFixed(2)} />
                      <Stat label="Reduction" value={`${formatPercent(candidate.compressionPercent)} smaller`} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {uploadResult && (
        <Card className="border-emerald-100 bg-emerald-50/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-800">
              <CheckCircle2 className="h-5 w-5" />
              Upload successful
            </CardTitle>
            <CardDescription className="text-emerald-800/70">
              The optimized file reached the backend and was uploaded to ImageKit.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="overflow-x-auto rounded-2xl bg-white p-4 text-xs leading-6 text-neutral-700">
              {JSON.stringify(uploadResult, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {expandedCandidateIndex !== null && comparison?.candidates[expandedCandidateIndex] && comparisonPreviews[expandedCandidateIndex] ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setExpandedCandidateIndex(null)}
        >
          <div
            className="max-h-[90vh] max-w-[96vw] overflow-hidden rounded-[2rem] border border-white/20 bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
              <div>
                <p className="text-sm font-medium text-neutral-800">
                  Quality {comparison.candidates[expandedCandidateIndex].qualityUsed.toFixed(2)}
                </p>
                <p className="text-xs text-neutral-500">
                  {comparison.candidates[expandedCandidateIndex].outputMimeType} -{" "}
                  {formatBytes(comparison.candidates[expandedCandidateIndex].optimizedSize)}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setExpandedCandidateIndex(null)}>
                Close
              </Button>
            </div>
            <div className="max-h-[calc(90vh-72px)] overflow-auto bg-neutral-950 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={comparisonPreviews[expandedCandidateIndex]}
                alt={`Expanded diagnostic preview quality ${comparison.candidates[expandedCandidateIndex].qualityUsed.toFixed(2)}`}
                className="mx-auto max-h-[calc(90vh-104px)] max-w-[96vw] object-contain"
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PreviewFrame({
  title,
  src,
}: {
  title: string;
  src?: string | null;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-brand-100 bg-[#FAF8F5]">
      <div className="flex items-center justify-between border-b border-brand-100 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-neutral-800">{title}</p>
          <p className="text-xs text-neutral-500">Local preview</p>
        </div>
        <ImageIcon className="h-4 w-4 text-brand-400" />
      </div>
      <div className="flex min-h-[280px] items-center justify-center p-4">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={title}
            className="max-h-[340px] max-w-full rounded-2xl object-contain shadow-sm"
          />
        ) : (
          <div className="text-sm text-neutral-400">Preview not available</div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-brand-100 bg-white px-4 py-3">
      <div className="text-xs uppercase tracking-[0.2em] text-neutral-400">{label}</div>
      <div className="mt-1 break-all text-sm font-medium text-neutral-800">{value}</div>
    </div>
  );
}
