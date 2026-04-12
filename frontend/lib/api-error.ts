export function getApiErrorMessage(error: unknown, fallback = "Không thể thực hiện thao tác này."): string {
  const candidates = collectErrorCandidates(error);

  for (const value of candidates) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return fallback;
}

export function getApiNotificationMessage(error: unknown, fallback = "Không thể thực hiện thao tác này."): string {
  return getApiErrorMessage(error, fallback);
}

function collectErrorCandidates(error: unknown): unknown[] {
  if (!error || typeof error !== "object") {
    return [error];
  }

  const source = error as Record<string, any>;
  const responseData = source.response?.data ?? source.data;

  return [
    source.message,
    source.description,
    source.detail,
    source.title,
    source.error?.message,
    source.error?.description,
    source.error?.detail,
    source.error?.title,
    source.code,
    source.errors && flattenErrors(source.errors),
    responseData?.error?.message,
    responseData?.error?.description,
    responseData?.error?.detail,
    responseData?.error?.title,
    responseData?.message,
    responseData?.description,
    responseData?.detail,
    responseData?.title,
    responseData?.errorMessage,
    responseData?.errors && flattenErrors(responseData.errors),
    responseData?.value?.error?.message,
    responseData?.value?.error?.description,
    responseData?.value?.error?.detail,
    responseData?.value?.message,
    responseData?.value?.description,
    responseData?.value?.detail,
    responseData?.value?.title,
    responseData?.value?.errors && flattenErrors(responseData.value.errors),
    source.data?.error?.message,
    source.data?.error?.description,
    source.data?.error?.detail,
    source.data?.message,
    source.data?.description,
    source.data?.detail,
    source.data?.title,
    source.data?.errors && flattenErrors(source.data.errors),
  ];
}

function flattenErrors(errors: unknown): string {
  if (!errors || typeof errors !== "object") {
    return String(errors ?? "");
  }

  const values = Object.values(errors as Record<string, unknown>)
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .filter((value) => typeof value === "string" && value.trim()) as string[];

  return values.join(" ");
}
