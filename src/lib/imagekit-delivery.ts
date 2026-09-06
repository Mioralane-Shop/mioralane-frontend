export const IMAGEKIT_IMAGE_SIZES = {
  thumbnail: 160,
  small: 320,
  productCard: 500,
  pdpMain: 1200,
  pdpLarge: 2000,
} as const;

export const IMAGEKIT_WIDTHS = [160, 320, 500, 750, 1200, 2000] as const;

export type ImageKitImagePreset = keyof typeof IMAGEKIT_IMAGE_SIZES;
export type ImageKitWidth = (typeof IMAGEKIT_WIDTHS)[number];

interface ImageKitDeliveryOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: "auto";
  crop?: "at_max" | "maintain_ratio" | "force" | "at_least" | "crop";
  preset?: ImageKitImagePreset;
  maxWidth?: number;
}

interface ImageKitLoaderOptions {
  preset?: ImageKitImagePreset;
  maxWidth?: number;
  quality?: number;
  crop?: ImageKitDeliveryOptions["crop"];
}

interface ImageKitLoaderParams {
  src: string;
  width: number;
  quality?: number;
}

const IMAGEKIT_HOSTNAME = "ik.imagekit.io";
const DEFAULT_IMAGE_QUALITY = 82;
const IMAGEKIT_PRESET_MAX_WIDTHS: Record<ImageKitImagePreset, ImageKitWidth> = {
  thumbnail: 320,
  small: 320,
  productCard: 750,
  pdpMain: 1200,
  pdpLarge: 2000,
};

function isImageKitParsedUrl(url: URL) {
  return url.hostname === IMAGEKIT_HOSTNAME || url.hostname.endsWith(`.${IMAGEKIT_HOSTNAME}`);
}

export function isImageKitUrl(src: string | null | undefined) {
  if (!src) return false;

  try {
    return isImageKitParsedUrl(new URL(src));
  } catch {
    return false;
  }
}

export function quantizeImageKitWidth(
  width: number,
  maxWidth: number = IMAGEKIT_WIDTHS[IMAGEKIT_WIDTHS.length - 1],
): ImageKitWidth {
  const safeWidth = Number.isFinite(width) && width > 0 ? width : IMAGEKIT_WIDTHS[0];
  const safeMaxWidth = Number.isFinite(maxWidth) && maxWidth > 0 ? maxWidth : IMAGEKIT_WIDTHS[IMAGEKIT_WIDTHS.length - 1];
  const cappedWidth = Math.min(safeWidth, safeMaxWidth);

  return IMAGEKIT_WIDTHS.find((candidate) => candidate >= cappedWidth) ?? IMAGEKIT_WIDTHS[IMAGEKIT_WIDTHS.length - 1];
}

function buildTransformation(options: ImageKitDeliveryOptions) {
  const presetMaxWidth = options.maxWidth ?? (options.preset ? IMAGEKIT_PRESET_MAX_WIDTHS[options.preset] : undefined);
  const requestedWidth = options.width ?? (options.preset ? IMAGEKIT_IMAGE_SIZES[options.preset] : undefined);
  const width = requestedWidth ? quantizeImageKitWidth(requestedWidth, presetMaxWidth) : undefined;
  const quality = options.quality ?? DEFAULT_IMAGE_QUALITY;
  const transformations: string[] = [];

  if (width && Number.isFinite(width) && width > 0) {
    transformations.push(`w-${Math.round(width)}`);
  }

  if (options.height && Number.isFinite(options.height) && options.height > 0) {
    transformations.push(`h-${Math.round(options.height)}`);
  }

  if (options.crop) {
    transformations.push(`c-${options.crop}`);
  }

  transformations.push(`q-${quality}`);

  if (options.format === "auto" || options.format === undefined) {
    transformations.push("f-auto");
  }

  return transformations.join(",");
}

function removePathTransformation(url: URL) {
  const segments = url.pathname.split("/");
  const firstSegment = segments[1] ? decodeURIComponent(segments[1]) : "";

  if (firstSegment.startsWith("tr:") || firstSegment.startsWith("tr-")) {
    url.pathname = `/${segments.slice(2).join("/")}`;
  }
}

export function getImageKitUrl(src: string | null | undefined, options: ImageKitDeliveryOptions = {}) {
  if (!src) return "";

  try {
    const url = new URL(src);

    if (!isImageKitParsedUrl(url)) {
      return src;
    }

    const transformation = buildTransformation(options);
    if (!transformation) return src;

    removePathTransformation(url);
    url.searchParams.delete("tr");
    url.searchParams.set("tr", transformation);
    return url.toString();
  } catch {
    return src;
  }
}

export function createImageKitLoader(options: ImageKitLoaderOptions = {}) {
  return function imageKitLoader({ src, width }: ImageKitLoaderParams) {
    const maxWidth = options.maxWidth ?? (options.preset ? IMAGEKIT_PRESET_MAX_WIDTHS[options.preset] : undefined);

    return getImageKitUrl(src, {
      width,
      maxWidth,
      quality: options.quality ?? DEFAULT_IMAGE_QUALITY,
      crop: options.crop,
      preset: options.preset,
    });
  };
}

export function getImageKitPresetMaxWidth(preset: ImageKitImagePreset) {
  return IMAGEKIT_PRESET_MAX_WIDTHS[preset];
}
