export type ActionResult<T> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string }

