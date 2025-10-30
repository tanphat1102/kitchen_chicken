import { api } from './api';

export interface Step {
  id: number;
  name: string;
  description?: string;
  categoryId: number;
  categoryName: string;
  stepNumber: number;
  isActive: boolean;
}

const ENDPOINT = '/steps';

class StepsService {
  async getAllSteps(token?: string): Promise<Step[]> {
    const { data: result } = await api.get<any>(
      ENDPOINT,
      token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
    );
    const raw = (result && typeof result === 'object' && 'data' in result) ? (result as any).data : result;
    const arr: any[] = Array.isArray(raw) ? raw : [];
    const steps: Step[] = arr.map((s: any) => ({
      id: s?.id,
      name: s?.name,
      description: s?.description,
      categoryId: s?.categoryId,
      categoryName: s?.categoryName,
      stepNumber: s?.stepNumber ?? 0,
      isActive: !!s?.isActive,
    }));
    return steps
      .filter((s) => s.isActive)
      .sort((a, b) => a.stepNumber - b.stepNumber);
  }
}

export const stepsService = new StepsService();
export default stepsService;
