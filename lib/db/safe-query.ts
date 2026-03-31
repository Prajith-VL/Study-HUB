export type DbErrorLike = {
  code?: string
  message?: string
}

export function isRecoverableQueryError(error: DbErrorLike | null | undefined): boolean {
  const code = error?.code
  return code === "42P01" || code === "42501" || code === "PGRST200" || code === "PGRST204" || code === "PGRST205"
}

export function safeData<T>(result: { data: T | null; error: DbErrorLike | null }, fallback: T): T {
  if (result.error && !isRecoverableQueryError(result.error)) {
    throw new Error(result.error.message ?? "Database query failed.")
  }
  return result.data ?? fallback
}

