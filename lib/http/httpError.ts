export class HttpError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function asHttpError(err: unknown): HttpError | null {
  if (err && typeof err === "object" && "status" in err && "message" in err) {
    const status = (err as any).status;
    const message = (err as any).message;
    if (typeof status === "number" && typeof message === "string") {
      return err as HttpError;
    }
  }
  return null;
}
