# Real-time Dashboard Implementation

## ✅ **Đã hoàn thành:**

1. ✅ Thay logo ChefHat bằng `Logo.png`
2. ✅ Tạo `usePolling` hook cho real-time updates
3. ✅ Tạo `useWebSocket` hook (nếu backend hỗ trợ WebSocket)
4. ✅ Example implementation với polling

---

## 📋 **2 Cách làm Real-time Chart:**

### **Option 1: Polling API (Recommended - Dễ implement)**

**Ưu điểm:**
- ✅ Đơn giản, không cần backend setup WebSocket
- ✅ Dễ debug và maintain
- ✅ Hoạt động với mọi backend

**Nhược điểm:**
- ⚠️ Delay (5-10 giây)
- ⚠️ Tốn bandwidth nếu poll quá nhanh

**Cách dùng:**

```tsx
import { usePolling } from '@/hooks/usePolling';

// Define API function
const fetchChartData = async () => {
  const response = await api.get('/api/analytics/revenue-chart');
  return response.data;
};

// In component
const { data, isLoading } = usePolling(fetchChartData, {
  interval: 5000, // Update every 5 seconds
  enabled: true   // Toggle on/off
});
```

---

### **Option 2: WebSocket (True Real-time)**

**Ưu điểm:**
- ✅ Real-time 100% (instant updates)
- ✅ Tiết kiệm bandwidth
- ✅ Two-way communication

**Nhược điểm:**
- ⚠️ Backend phải support WebSocket
- ⚠️ Phức tạp hơn để setup

**Cách dùng:**

```tsx
import { useWebSocket } from '@/hooks/useWebSocket';

const { isConnected, lastMessage } = useWebSocket(
  'ws://chickenkitchen.milize-lena.space/ws/dashboard',
  {
    onMessage: (data) => {
      console.log('New data:', data);
      setChartData(data);
    },
    onOpen: () => console.log('Connected'),
    onClose: () => console.log('Disconnected')
  }
);
```

---

## 🚀 **Cách integrate vào Dashboard:**

### **Step 1: Update Dashboard với Polling**

File: `src/pages/admin/AdminDashboard.tsx`

```tsx
import { usePolling } from '@/hooks/usePolling';
import { useCallback, useState } from 'react';

export default function AdminDashboard() {
  const [chartData, setChartData] = useState([]);

  // Fetch function
  const fetchChartData = useCallback(async () => {
    // TODO: Replace with real API
    const response = await api.get('/api/analytics/revenue-overview');
    return response.data;
  }, []);

  // Poll every 10 seconds
  const { data, isLoading } = usePolling(fetchChartData, {
    interval: 10000, // 10 seconds
    enabled: true
  });

  // Update chart when data changes
  useEffect(() => {
    if (data) {
      setChartData(data);
    }
  }, [data]);

  return (
    <div>
      {/* Show loading indicator */}
      {isLoading && <span className="text-blue-500">● Updating...</span>}
      
      {/* Your chart component */}
      <Chart data={chartData} />
    </div>
  );
}
```

---

### **Step 2: Cài đặt Chart Library**

Recommend: **Recharts** (easy to use, good docs)

```bash
npm install recharts
```

Example chart component:

```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartProps {
  data: Array<{ month: string; revenue: number }>;
}

export function RevenueChart({ data }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Line 
          type="monotone" 
          dataKey="revenue" 
          stroke="#dc2626" 
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

---

## 📝 **API Backend cần:**

### **GET /api/analytics/revenue-overview**

Response example:
```json
{
  "statusCode": 200,
  "data": [
    { "month": "Jan", "revenue": 4500 },
    { "month": "Feb", "revenue": 5200 },
    { "month": "Mar", "revenue": 4800 },
    ...
  ]
}
```

---

## 🎯 **Next Steps:**

1. ✅ **Check backend có API analytics chưa?**
   - GET /api/analytics/revenue-overview
   - GET /api/analytics/dashboard-stats

2. ✅ **Cài Recharts:**
   ```bash
   npm install recharts
   ```

3. ✅ **Update AdminDashboard.tsx với polling**

4. ✅ **Test với mock data trước**

5. ✅ **Connect với real API**

---

## 🔧 **File đã tạo:**

- ✅ `src/hooks/usePolling.ts` - Polling hook
- ✅ `src/hooks/useWebSocket.ts` - WebSocket hook  
- ✅ `src/pages/admin/AdminDashboard-realtime.tsx` - Example với polling
- ✅ `src/components/ui/app-sidebar.tsx` - Updated với Logo.png

---

## ❓ **Câu hỏi:**

1. **Backend có hỗ trợ WebSocket không?**
2. **Có API endpoint nào cho analytics chưa?**
3. **Bạn muốn dùng Polling hay WebSocket?**
4. **Update interval bao lâu? (5s, 10s, 30s?)**
