export type ApiError = { code?: string; description?: string; message?: string };

export type ResultLike<T> = {
  isSuccess: boolean;
  value: T;
  error?: ApiError;
};

export function isResultLike<T>(x: any): x is ResultLike<T> {
  return x && typeof x === "object" && "isSuccess" in x && "value" in x;
}

export function unwrapOrThrow<T>(data: any): T {
  if (isResultLike<T>(data)) {
    if (data.isSuccess) return data.value;
    const msg = data.error?.message || data.error?.description || "Request failed";
    throw new Error(msg);
  }
  return data as T; // raw payload
}