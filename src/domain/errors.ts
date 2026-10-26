export type AppErrorCode =
  | 'INVALID_VOLUME'
  | 'INVALID_GOAL'
  | 'ENTRY_NOT_FOUND'
  | 'ENTRY_NOT_EDITABLE'
  | 'STORAGE_CORRUPTED'
  | 'STORAGE_ERROR';

export interface AppError {
  code: AppErrorCode;
  message: string;
}

export type Result<T> = { ok: true; value: T } | { ok: false; error: AppError };

export const ERROR_MESSAGES: Record<AppErrorCode, string> = {
  INVALID_VOLUME: 'Informe um volume inteiro entre 1 e 5.000 ml.',
  INVALID_GOAL: 'Informe uma meta inteira entre 500 e 10.000 ml.',
  ENTRY_NOT_FOUND: 'Registro não encontrado.',
  ENTRY_NOT_EDITABLE: 'Este registro não pertence mais ao dia atual.',
  STORAGE_CORRUPTED: 'Não foi possível ler os dados anteriores. Um backup foi criado.',
  STORAGE_ERROR: 'Não foi possível acessar o armazenamento. Tente novamente.',
};

export function appError(code: AppErrorCode, message?: string): AppError {
  return { code, message: message ?? ERROR_MESSAGES[code] };
}

export function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

export function fail<T>(code: AppErrorCode, message?: string): Result<T> {
  return { ok: false, error: appError(code, message) };
}
