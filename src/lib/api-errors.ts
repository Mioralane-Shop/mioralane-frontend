/**
 * Turns a thrown error / failed response into one display string.
 *
 * The backend returns two error shapes:
 *
 *  - Mongoose-era:       400 { success: false, message: 'Validation failed',
 *                               errors: ['Email invalid'] }
 *  - Zod-era (P0-3.2+):  400 { success: false, message: 'Validation failed',
 *                               errors: [{ path: 'body.email', message: 'Required' }] }
 *
 * Reading only `message` therefore shows the content-free **"Validation failed"**
 * for every rejected payload, with no hint of which field failed. This handles both
 * shapes, and still prefers a specific backend message when one is sent (409s, 404s,
 * rate limits, coupon rule violations), because those are already human-readable.
 *
 * Ported from `mioralane-admin/lib/api-errors.ts` so both apps render backend errors
 * identically. Casts avoid `any`; the frontend has none either.
 */

type ApiErrorPayload = {
    message?: unknown;
    errors?: unknown;
};

/** Reads `error.response.data` without assuming it is an object. */
const readApiErrorPayload = (error: unknown): ApiErrorPayload | undefined => {
    const response = (error as { response?: { data?: unknown } } | undefined)?.response;
    const data = response?.data;

    return data && typeof data === "object" ? (data as ApiErrorPayload) : undefined;
};

/** Empty and whitespace-only strings count as "no message". */
const readMessage = (value: unknown): string | undefined =>
    typeof value === "string" && value.trim() !== "" ? value : undefined;

/** `[{ path, message }]` and `['message']` both collapse to a readable string. */
const readErrorDetails = (errors: unknown): string | undefined => {
    if (!Array.isArray(errors)) {
        return undefined;
    }

    const details = (errors as unknown[])
        .map((entry) =>
            typeof entry === "string"
                ? entry
                : readMessage((entry as { message?: unknown } | undefined)?.message) ?? "",
        )
        .filter(Boolean);

    return details.length > 0 ? details.join(", ") : undefined;
};

/**
 * @param error    anything thrown, usually an Axios error
 * @param fallback shown when nothing usable can be extracted
 */
export function formatApiError(error: unknown, fallback = "Something went wrong"): string {
    const data = readApiErrorPayload(error);

    if (!data) {
        // No response body: a network failure, timeout or cancellation. The thrown
        // Error's own message is the only context left.
        return readMessage((error as { message?: unknown } | undefined)?.message) ?? fallback;
    }

    const message = readMessage(data.message);

    // "Validation failed" is the generic envelope wrapper, so the real detail is in
    // `errors` — don't stop at the wrapper.
    if (message !== undefined && message !== "Validation failed") {
        return message;
    }

    return readErrorDetails(data.errors) ?? message ?? fallback;
}
