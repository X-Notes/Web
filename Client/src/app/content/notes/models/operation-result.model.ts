export enum OperationResultAdditionalInfo {
  NoAccessRights,
  NotEnoughMemory
}

export interface OperationResult<T> {
  data: T;
  success: boolean;
  message?: OperationResultAdditionalInfo;
}
