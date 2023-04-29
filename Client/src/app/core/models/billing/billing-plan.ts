import { BillingPlanId } from './billing-plan-id.enum';

export class BillingPlan {
  id: BillingPlanId;

  maxSize: number;

  maxNotes: number;

  maxFolders: number;

  maxLabels: number;

  maxRelatedNotes: number;

  name: string;

  price: number;

  constructor(obj: Partial<BillingPlan>) {
    Object.assign(this, obj);
  }

  get memoryKBytes(): number {
    return this.maxSize / Math.pow(1024, 1);
  }

  get memoryMBytes(): number {
    return this.maxSize / Math.pow(1024, 2);
  }

  get memoryGBytes(): number {
    return this.maxSize / Math.pow(1024, 3);
  }

  get getMemoryMb(): string {
    if (this.memoryMBytes >= 1000) {
      return this.memoryMBytes / 1000 + '.000mb';
    }
    return this.memoryMBytes + 'mb';
  }
}
