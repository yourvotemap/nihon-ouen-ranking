export interface PointPlan {
  id: string;
  points: number;
  amount: number;
  currency: string;
}

export const POINT_PLANS: PointPlan[] = [
  { id: 'points_100',   points: 100,   amount: 100,   currency: 'jpy' },
  { id: 'points_500',   points: 500,   amount: 500,   currency: 'jpy' },
  { id: 'points_1000',  points: 1000,  amount: 1000,  currency: 'jpy' },
  { id: 'points_3000',  points: 3000,  amount: 3000,  currency: 'jpy' },
  { id: 'points_10000', points: 10000, amount: 10000, currency: 'jpy' },
];

export function getPlanById(id: string): PointPlan | undefined {
  return POINT_PLANS.find(p => p.id === id);
}
