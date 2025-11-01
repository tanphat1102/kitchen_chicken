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
import toast from 'react-hot-toast';
import { format, addDays, startOfToday } from 'date-fns';
import { menuItemService } from '@/services/menuItemService';
import { storeService } from '@/services/storeService';
import { dailyMenuService } from '@/services/dailyMenuService';
import type { MenuItem } from '@/types/api.types';

interface StoreLocation {
  id: number;
  name: string;
  address?: string;
  isActive: boolean;
}

interface DailyMenuDetail {
  id: number;
  menuDate: string;
  createdAt?: string;
  storeList: Array<{
    storeId: number;
    storeName: string;
  }>;
  categoryList: Array<{
    categoryId: number;
    categoryName: string;
    items: MenuItem[];
  }>;
}

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

const DailyMenuBuilder: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [stores, setStores] = useState<StoreLocation[]>([]);
  const [dailyMenus, setDailyMenus] = useState<DailyMenuDetail[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(format(addDays(startOfToday(), 1), 'yyyy-MM-dd'));
  const [selectedStores, setSelectedStores] = useState<number[]>([]);
  const [selectedMenuItems, setSelectedMenuItems] = useState<number[]>([]);
  const [editingMenu, setEditingMenu] = useState<DailyMenuDetail | null>(null);

  // Fetch menu items
  const fetchMenuItems = async () => {
    try {
      const response = await menuItemService.getAllForStats();
      setMenuItems(response.filter((item: MenuItem) => item.isActive));
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast.error('Failed to load menu items');
    }
  };

  // Fetch stores
  const fetchStores = async () => {
    try {
      const response = await storeService.getAllForStats();
      setStores(response.filter((store: StoreLocation) => store.isActive));
    } catch (error) {
      console.error('Error fetching stores:', error);
      toast.error('Failed to load stores');
    }
  };

  // Fetch daily menus with pagination
  const fetchDailyMenus = async () => {
    try {
      setLoading(true);
      const [menus, count] = await Promise.all([
        dailyMenuService.getAllDailyMenus(currentPage, pageSize),
        dailyMenuService.getCount(),
      ]);
      setTotalCount(count);
      
      // Fetch details for each menu
      const detailedMenus = await Promise.all(
        menus.map(async (menu) => {
          const detail = await dailyMenuService.getDailyMenuById(menu.id);
          if (!detail) return null;
          
          // Transform DailyMenuItem to DailyMenuDetail
          const categoryList = new Map<number, { categoryId: number; categoryName: string; items: MenuItem[] }>();
          
          detail.itemList?.forEach((foodItem) => {
            const catId = foodItem.category?.categoryId || 0;
            const catName = foodItem.category?.name || 'Uncategorized';
            
            if (!categoryList.has(catId)) {
              categoryList.set(catId, {
                categoryId: catId,
                categoryName: catName,
                items: []
              });
            }
            
            // Convert DailyMenuFoodItem to MenuItem
            const menuItem: MenuItem = {
              id: foodItem.menuItemId,
              name: foodItem.name,
              price: foodItem.price || 0,
              categoryId: catId,
              categoryName: catName,
              imageUrl: foodItem.imageUrl,
              description: foodItem.description,
              cal: foodItem.cal || 0,
              isActive: true,
            };
            
            categoryList.get(catId)?.items.push(menuItem);
          });
          
          const transformed: DailyMenuDetail = {
            id: detail.id,
            menuDate: detail.menuDate,
            createdAt: detail.createdAt,
            storeList: detail.storeList || [],
            categoryList: Array.from(categoryList.values())
          };
          
          return transformed;
        })
      );
      
      setDailyMenus(detailedMenus.filter((m): m is DailyMenuDetail => m !== null));
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
  }, []);

  useEffect(() => {
    fetchDailyMenus();
  }, [currentPage]);

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / pageSize);

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

      if (selectedMenuItems.length === 0) {
        toast.error('Please select at least one menu item');
        return;
      }

      // Note: Backend automatically applies to all stores on create
      // selectedStores is only for edit mode (update)
      if (editingMenu) {
        // Update mode - can update stores, items, or date
        await dailyMenuService.update(editingMenu.id, {
          menuDate: selectedDate,
          storeIds: selectedStores.length > 0 ? selectedStores : undefined,
          menuItemIds: selectedMenuItems,
        });
        toast.success('Daily menu updated successfully');
      } else {
        // Create mode - backend auto-applies to all stores
        await dailyMenuService.create({
          menuDate: selectedDate,
          menuItemIds: selectedMenuItems,
        });
        toast.success('Daily menu created successfully for all stores');
      }
      
      fetchDailyMenus();
      handleCloseDialog();
    } catch (error: any) {
      console.error('Error saving daily menu:', error);
      const message = error.response?.data?.message || error.message || 'Failed to save daily menu';
      toast.error(message);
    }
  };

  // Handle delete
  const handleDelete = async (id: number, date: string, stores: string[]) => {
    if (!confirm(`Are you sure you want to delete daily menu for ${formatDate(date)} (${stores.length} store(s))?`)) {
      return;
    }

    try {
      await dailyMenuService.delete(id);
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
  }, {} as Record<string, DailyMenuDetail[]>);

  const sortedDates = Object.keys(menusByDate).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="flex flex-1 flex-col gap-6 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 text-gray-900">
            <Calendar className="h-8 w-8 text-black" />
            <span>Daily Menu Builder</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Create and manage daily menus for each store
          </p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white">
          <Plus className="h-4 w-4" />
          <span>Create Daily Menu</span>
        </Button>
      </div>

      {/* Info Card */}
      {/* <Card className="border-l-4 border-l-purple-500 bg-purple-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-purple-600 mt-0.5" />
            <div>
              <p className="font-semibold text-purple-900">Business Rules</p>
              <ul className="text-sm text-purple-700 mt-2 space-y-1">
                <li>• Daily menus can only be created for future dates (not today or past dates)</li>
                <li>• Each date can have only ONE daily menu (unique per date)</li>
                <li>• New daily menus are automatically applied to ALL active stores</li>
                <li>• You can update store assignments later if needed</li>
                <li>• Only active menu items can be added to daily menu</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card> */}

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
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    <span>{formatDate(date)}</span>
                  </CardTitle>
                  {menusByDate[date][0] && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(
                        menusByDate[date][0].id, 
                        menusByDate[date][0].menuDate,
                        menusByDate[date][0].storeList.map(s => s.storeName)
                      )}
                      className="text-gray-900 border-gray-900 hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Menu
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {menusByDate[date].map((menu) => (
                  <div key={menu.id} className="space-y-4">
                    {/* Stores Info */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-gray-700">Applied to Stores:</p>
                      {menu.storeList.map((store) => (
                        <Badge key={store.storeId} variant="outline" className="flex items-center gap-1">
                          <Store className="h-3 w-3" />
                          {store.storeName}
                        </Badge>
                      ))}
                    </div>

                    {/* Menu Items by Category */}
                    <div className="space-y-4">
                      <p className="text-sm font-semibold text-gray-700">
                        Menu Items ({menu.categoryList.reduce((total, cat) => total + cat.items.length, 0)} items):
                      </p>
                      {menu.categoryList.map((category) => (
                        <div key={category.categoryId} className="space-y-2">
                          <h4 className="text-sm font-medium text-purple-600 flex items-center gap-2">
                            <ChefHat className="h-4 w-4" />
                            {category.categoryName} ({category.items.length})
                          </h4>
                          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                            {category.items.map((item: MenuItem) => (
                              <div key={item.id} className="flex items-center gap-2 text-sm p-2 rounded bg-gray-50">
                                <span className="flex-1">{item.name}</span>
                                <span className="text-green-600 font-medium">{formatVND(item.price)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {!loading && sortedDates.length > 0 && totalPages > 1 && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages} (Total: {totalCount} menus)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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

            {/* Store Info - Read only on create, editable on update */}
            {editingMenu ? (
              <div className="space-y-2">
                <Label>Select Stores ({selectedStores.length} selected)</Label>
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
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        {store.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                <div className="flex items-start gap-3">
                  <Store className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-900">Auto-Apply to All Stores</p>
                    <p className="text-sm text-blue-700 mt-1">
                      This daily menu will be automatically applied to all active stores in the system.
                    </p>
                  </div>
                </div>
              </div>
            )}

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
