export enum OperationResultAdditionalInfo {
  NoAccessRights,
}

export interface OperationResult<T> {
  data: T;
  success: boolean;
  message: OperationResultAdditionalInfo;
}
