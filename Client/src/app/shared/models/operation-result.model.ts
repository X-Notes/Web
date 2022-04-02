export enum OperationResultAdditionalInfo {
  NoAccessRights,
  NotEnoughMemory,
  FileSizeTooLarge,
  NoSupportExtension,
  NoAnyFile,
  RequestCancelled,
  NotFound,
  AnotherError,
  ContentLocked,
}

export interface OperationResult<T> {
  data: T;
  success: boolean;
  status?: OperationResultAdditionalInfo;
  message: string;
}
