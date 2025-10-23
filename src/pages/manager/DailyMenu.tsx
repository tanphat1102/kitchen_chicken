import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Calendar, Store, ChefHat, Plus, Trash2, AlertCircle } from 'lucide-react';
import { api } from '@/services/api';
import toast from 'react-hot-toast';
import { format, addDays, startOfToday } from 'date-fns';

interface MenuItem {
  id: number;
  name: string;
  price: number;
  categoryId: number;
  categoryName?: string;
  imageURL?: string;
  isActive: boolean;
}

interface StoreLocation {
  id: number;
  name: string;
  address?: string;
  isActive: boolean;
}

interface DailyMenu {
  id: number;
  menuDate: string;
  storeId: number;
  storeName?: string;
  menuItems: MenuItem[];
}

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

const DailyMenuBuilder: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [stores, setStores] = useState<StoreLocation[]>([]);
  const [dailyMenus, setDailyMenus] = useState<DailyMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(format(addDays(startOfToday(), 1), 'yyyy-MM-dd'));
  const [selectedStores, setSelectedStores] = useState<number[]>([]);
  const [selectedMenuItems, setSelectedMenuItems] = useState<number[]>([]);
  const [editingMenu, setEditingMenu] = useState<DailyMenu | null>(null);

  // Fetch menu items
  const fetchMenuItems = async () => {
    try {
      const response = await api.get<ApiResponse<MenuItem[]>>('/menu-items');
      setMenuItems(response.data.data.filter(item => item.isActive));
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast.error('Failed to load menu items');
    }
  };

  // Fetch stores
  const fetchStores = async () => {
    try {
      const response = await api.get<ApiResponse<StoreLocation[]>>('/store');
      setStores(response.data.data.filter(store => store.isActive));
    } catch (error) {
      console.error('Error fetching stores:', error);
      toast.error('Failed to load stores');
    }
  };

  // Fetch daily menus
  const fetchDailyMenus = async () => {
    try {
      setLoading(true);
      const response = await api.get<ApiResponse<DailyMenu[]>>('/daily-menu');
      setDailyMenus(response.data.data);
    } catch (error) {
      console.error('Error fetching daily menus:', error);
      toast.error('Failed to load daily menus');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
    fetchStores();
    fetchDailyMenus();
  }, []);

  // Group menu items by category
  const menuItemsByCategory = menuItems.reduce((acc, item) => {
    const category = item.categoryName || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  const formatVND = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy (EEEE)');
    } catch {
      return dateString;
    }
  };

  // Handle create daily menu
  const handleCreate = () => {
    setEditingMenu(null);
    setSelectedDate(format(addDays(startOfToday(), 1), 'yyyy-MM-dd'));
    setSelectedStores([]);
    setSelectedMenuItems([]);
    setDialogOpen(true);
  };

  // Handle submit
  const handleSubmit = async () => {
    try {
      // Validation
      if (!selectedDate) {
        toast.error('Please select a date');
        return;
      }

      // Check if date is in the past
      const selectedDateObj = new Date(selectedDate);
      const today = startOfToday();
      if (selectedDateObj < today) {
        toast.error('Cannot create menu for past dates (BR-15)');
        return;
      }

      if (selectedStores.length === 0) {
        toast.error('Please select at least one store');
        return;
      }

      if (selectedMenuItems.length === 0) {
        toast.error('Please select at least one menu item');
        return;
      }

      // Create daily menu for each selected store
      const promises = selectedStores.map(async (storeId) => {
        const submitData = {
          menuDate: selectedDate,
          storeId: storeId,
          menuItemIds: selectedMenuItems,
        };

        if (editingMenu) {
          return api.put(`/daily-menu/${editingMenu.id}`, submitData);
        } else {
          return api.post('/daily-menu', submitData);
        }
      });

      await Promise.all(promises);
      
      toast.success(editingMenu 
        ? 'Daily menu updated successfully' 
        : `Daily menu created for ${selectedStores.length} store(s)`
      );
      
      fetchDailyMenus();
      handleCloseDialog();
    } catch (error: any) {
      console.error('Error saving daily menu:', error);
      const message = error.response?.data?.message || 'Failed to save daily menu';
      toast.error(message);
    }
  };

  // Handle delete
  const handleDelete = async (id: number, storeName: string, date: string) => {
    if (!confirm(`Are you sure you want to delete daily menu for ${storeName} on ${formatDate(date)}?`)) {
      return;
    }

    try {
      await api.delete(`/daily-menu/${id}`);
      toast.success('Daily menu deleted successfully');
      fetchDailyMenus();
    } catch (error) {
      console.error('Error deleting daily menu:', error);
      toast.error('Failed to delete daily menu');
    }
  };

  // Close dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingMenu(null);
    setSelectedDate(format(addDays(startOfToday(), 1), 'yyyy-MM-dd'));
    setSelectedStores([]);
    setSelectedMenuItems([]);
  };

  // Toggle store selection
  const toggleStore = (storeId: number) => {
    setSelectedStores(prev => 
      prev.includes(storeId) 
        ? prev.filter(id => id !== storeId)
        : [...prev, storeId]
    );
  };

  // Toggle menu item selection
  const toggleMenuItem = (itemId: number) => {
    setSelectedMenuItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Group daily menus by date
  const menusByDate = dailyMenus.reduce((acc, menu) => {
    if (!acc[menu.menuDate]) {
      acc[menu.menuDate] = [];
    }
    acc[menu.menuDate].push(menu);
    return acc;
  }, {} as Record<string, DailyMenu[]>);

  const sortedDates = Object.keys(menusByDate).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Calendar className="h-8 w-8 text-purple-600" />
            <span>Daily Menu Builder</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage daily menus for each store
          </p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4" />
          <span>Create Daily Menu</span>
        </Button>
      </div>

      {/* Info Card */}
      <Card className="border-l-4 border-l-purple-500 bg-purple-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-purple-600 mt-0.5" />
            <div>
              <p className="font-semibold text-purple-900">Business Rules</p>
              <ul className="text-sm text-purple-700 mt-2 space-y-1">
                <li>• Daily menus can only be created for future dates (not today or past dates)</li>
                <li>• Each store can have one daily menu per day</li>
                <li>• Only active menu items can be added to daily menu</li>
                <li>• Menu items must be categorized before adding to daily menu</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Menus List */}
      <div className="space-y-6">
        {loading ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Loading daily menus...
            </CardContent>
          </Card>
        ) : sortedDates.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No daily menus created yet. Click "Create Daily Menu" to get started!
            </CardContent>
          </Card>
        ) : (
          sortedDates.map((date) => (
            <Card key={date}>
              <CardHeader className="border-b bg-gray-50">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <span>{formatDate(date)}</span>
                  <Badge variant="outline" className="ml-2">
                    {menusByDate[date].length} store(s)
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {menusByDate[date].map((menu) => (
                    <Card key={menu.id} className="border-2 hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Store className="h-4 w-4 text-blue-600" />
                            <span className="font-semibold">{menu.storeName || `Store #${menu.storeId}`}</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(menu.id, menu.storeName || `Store #${menu.storeId}`, menu.menuDate)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">
                            Menu Items ({menu.menuItems?.length || 0}):
                          </p>
                          <div className="space-y-1 max-h-48 overflow-y-auto">
                            {menu.menuItems?.map((item) => (
                              <div key={item.id} className="flex items-center gap-2 text-sm p-2 rounded bg-gray-50">
                                <ChefHat className="h-3 w-3 text-orange-600" />
                                <span className="flex-1">{item.name}</span>
                                <span className="text-green-600 font-medium">{formatVND(item.price)}</span>
                              </div>
                            )) || (
                              <p className="text-sm text-muted-foreground">No items</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              {editingMenu ? 'Edit Daily Menu' : 'Create New Daily Menu'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Date Selection */}
            <div className="space-y-2">
              <Label htmlFor="date">Menu Date *</Label>
              <input
                id="date"
                type="date"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={selectedDate}
                min={format(addDays(startOfToday(), 1), 'yyyy-MM-dd')}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Note: Can only select future dates (tomorrow onwards)
              </p>
            </div>

            {/* Store Selection */}
            <div className="space-y-2">
              <Label>Select Stores * ({selectedStores.length} selected)</Label>
              <div className="grid grid-cols-2 gap-2 p-4 border rounded-lg max-h-48 overflow-y-auto">
                {stores.map((store) => (
                  <div key={store.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`store-${store.id}`}
                      checked={selectedStores.includes(store.id)}
                      onCheckedChange={() => toggleStore(store.id)}
                    />
                    <label
                      htmlFor={`store-${store.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {store.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Menu Items Selection by Category */}
            <div className="space-y-2">
              <Label>Select Menu Items * ({selectedMenuItems.length} selected)</Label>
              <div className="space-y-4 p-4 border rounded-lg max-h-96 overflow-y-auto">
                {Object.entries(menuItemsByCategory).map(([category, items]) => (
                  <div key={category} className="space-y-2">
                    <h4 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                      <ChefHat className="h-4 w-4" />
                      {category}
                    </h4>
                    <div className="grid grid-cols-1 gap-2 pl-6">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between space-x-2 p-2 rounded hover:bg-gray-50">
                          <div className="flex items-center space-x-2 flex-1">
                            <Checkbox
                              id={`item-${item.id}`}
                              checked={selectedMenuItems.includes(item.id)}
                              onCheckedChange={() => toggleMenuItem(item.id)}
                            />
                            <label
                              htmlFor={`item-${item.id}`}
                              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                            >
                              {item.name}
                            </label>
                          </div>
                          <span className="text-sm font-medium text-green-600">
                            {formatVND(item.price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {editingMenu ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DailyMenuBuilder;
