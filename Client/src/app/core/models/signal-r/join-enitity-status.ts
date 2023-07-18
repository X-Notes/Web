import { OperationResult } from "src/app/shared/models/operation-result.model";

export interface JoinEntityStatus {
  entityId: string;
  result: OperationResult<boolean>;
}
