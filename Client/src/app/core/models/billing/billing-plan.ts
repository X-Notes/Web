import { BillingPlanId } from './billing-plan-id.enum';

export interface BillingPlan {
  id: BillingPlanId;

  maxSize: number;

  maxNotes: number;

  maxFolders: number;

  maxLabels: number;

  maxRelatedNotes: number;

  name: string;

  price: number;
}
