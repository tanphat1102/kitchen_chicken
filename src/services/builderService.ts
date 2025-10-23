import { dailyMenuService } from '@/services/dailyMenuService';
import { stepsService, type Step } from '@/services/stepsService';

export interface Option {
  id: number;
  name: string;
  price: number;
  cal?: number;
  imageUrl?: string;
  description?: string;
}

export interface StepDef {
  id: number;
  name: string;
  code?: string;
  description?: string;
  min: number;
  max: number;
  categoryId: number;
  options: Option[];
}

export interface BuilderData {
  currency: 'VND' | 'USD' | string;
  basePrice: number;
  steps: StepDef[];
}

function todayStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

class BuilderService {
  async getBuilderData(params?: { date?: string; storeId?: number; token?: string }): Promise<BuilderData> {
    const date = params?.date ?? todayStr();
    const token = params?.token;
    const storeId = params?.storeId;

    const [steps, menu] = await Promise.all([
      stepsService.getAllSteps(token),
      storeId
        ? dailyMenuService.getDailyMenuForStoreByDate(storeId, date, token)
        : dailyMenuService.getDailyMenuByDate(date, token),
    ]);
    if (!menu) {
      const when = date;
      if (storeId) throw new Error(`Không tìm thấy daily menu cho cửa hàng (${storeId}) vào ngày ${when}.`);
      throw new Error(`Không tìm thấy daily menu cho ngày ${when}.`);
    }

    const byCat = new Map<number, { name: string; items: any[] }>();
    for (const it of menu.itemList || []) {
      const catId = it.category?.categoryId;
      const catName = it.category?.name ?? '';
      if (!catId) continue;
      if (!byCat.has(catId)) byCat.set(catId, { name: catName, items: [] });
      byCat.get(catId)!.items.push(it);
    }

    const stepDefs: StepDef[] = steps.map((s: Step) => {
      const group = byCat.get(s.categoryId);
      const options: Option[] = (group?.items ?? []).map((it: any) => ({
        id: it.menuItemId,
        name: it.name,
        price: it.price ?? 0,
        cal: it.cal,
        imageUrl: it.imageUrl,
        description: it.description,
      }));
      const max = Math.max(1, options.length);
      const min = 0; 
      return {
        id: s.id,
        name: s.name,
        code: s.name?.toUpperCase().replace(/\s+/g, '_'),
        description: s.description,
        min,
        max,
        categoryId: s.categoryId,
        options,
      };
    }).filter((sd) => sd.options.length > 0);

    if (stepDefs.length === 0) {
      throw new Error('Không có món nào khả dụng cho cửa hàng/ngày đã chọn. Vui lòng chọn cửa hàng khác hoặc kiểm tra dữ liệu daily menu.');
    }

    return {
      currency: 'VND',
      basePrice: 0,
      steps: stepDefs,
    };
  }
}

export const builderService = new BuilderService();
export default builderService;
