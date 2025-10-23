# 🎯 Admin Panel - Quick Reference

## 🚀 Getting Started

### Start the dev server:
```bash
npm run dev
```

### Access Admin Panel:
```
http://localhost:5173/admin
```

---

## 📋 Available Admin Routes

| Route | Page | Status | Description |
|-------|------|--------|-------------|
| `/admin` | Dashboard | ✅ Ready | Main admin dashboard with stats |
| `/admin/dashboard` | Dashboard | ✅ Ready | Same as /admin |
| `/admin/stores` | Stores | ✅ Ready | Store CRUD management |
| `/admin/menu` | Menu Items | 🚧 Placeholder | Menu management (coming soon) |
| `/admin/orders` | Orders | 🚧 Placeholder | Order tracking (coming soon) |
| `/admin/ingredients` | Ingredients | 🚧 Placeholder | Inventory management (coming soon) |
| `/admin/users` | Users | 🚧 Placeholder | User management (coming soon) |
| `/admin/analytics` | Analytics | 🚧 Placeholder | Reports & analytics (coming soon) |
| `/admin/settings` | Settings | 🚧 Placeholder | System settings (coming soon) |

---

## 🔑 Login Required

All admin routes require authentication:
1. Click "Login" button on homepage
2. Sign in with Firebase
3. Navigate to `/admin`

---

## 🎨 Admin Features

### ✅ Implemented:
- **Sidebar Navigation** - Navigate between admin pages
- **Breadcrumb** - Show current location
- **Store Management** - Full CRUD for stores
- **Dashboard Stats** - Revenue, orders, active orders
- **Charts** - Revenue visualization
- **Protected Routes** - Auth required

### 🚧 In Progress:
- Daily Menu Builder
- Menu Item Management
- Order Dashboard
- Ingredient Inventory
- User Management

---

## 📁 File Structure

```
src/
├── pages/admin/
│   ├── AdminDashboard.tsx       ✅ Main dashboard
│   ├── AdminDashboard-realtime.tsx  Real-time version
│   └── Stores.tsx               ✅ Store management
│
├── layouts/admin/
│   ├── AdminLayout.tsx          ✅ Admin wrapper layout
│   └── admin-sidebar-data.ts    ✅ Sidebar configuration
│
├── components/admin/
│   └── StoreDialog.tsx          ✅ Store add/edit dialog
│
└── App.tsx                      ✅ Routes configured
```

---

## 🔗 Quick Links

- **Development:** `http://localhost:5173/admin`
- **Production:** Update in deployment
- **API Docs:** `https://chickenkitchen.milize-lena.space/api/swagger-ui.html`

---

## 💡 Tips

1. Use sidebar to navigate between pages
2. Search stores by name or address
3. Toggle store status with one click
4. All changes auto-save to backend (when connected)

---

## 🐛 Issues?

Check the `ADMIN_ACCESS_GUIDE.md` for troubleshooting.
