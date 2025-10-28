import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Pencil, Trash2, Search, ChefHat, CheckCircle, XCircle, ImagePlus } from 'lucide-react';
import { menuItemService } from '@/services/menuItemService';
import { categoryService } from '@/services/categoryService';
import type { MenuItem, Category } from '@/types/api.types';
import toast from 'react-hot-toast';
import { uploadToCloudinary } from '@/utils/cloudinary';

const MenuItems: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    imageUrl: '',
    cal: '',
    isActive: true,
  });

  // Fetch menu items
  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const data = await menuItemService.getAll();
      setMenuItems(data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast.error('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  useEffect(() => {
    fetchMenuItems();
    fetchCategories();
  }, []);

  // Filter menu items
  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.categoryId.toString() === filterCategory;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && item.isActive) ||
                         (filterStatus === 'inactive' && !item.isActive);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Stats
  const stats = {
    total: menuItems.length,
    active: menuItems.filter(item => item.isActive).length,
    inactive: menuItems.filter(item => !item.isActive).length,
  };

  const formatVND = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Handle image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      const imageUrl = await uploadToCloudinary(file);
      setFormData({ ...formData, imageUrl: imageUrl });
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  // Handle create/edit
  const handleSubmit = async () => {
    try {
      if (!formData.name.trim()) {
        toast.error('Menu item name is required');
        return;
      }
      if (!formData.price || parseFloat(formData.price) <= 0) {
        toast.error('Valid price is required');
        return;
      }
      if (!formData.categoryId) {
        toast.error('Category is required');
        return;
      }

      const submitData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        categoryId: parseInt(formData.categoryId),
        imageUrl: formData.imageUrl || undefined,
        cal: formData.cal ? parseInt(formData.cal) : 0,
        isActive: formData.isActive,
      };

      if (editingItem) {
        // Update
        await menuItemService.update(editingItem.id, submitData);
        toast.success('Menu item updated successfully');
      } else {
        // Create
        await menuItemService.create(submitData);
        toast.success('Menu item created successfully');
      }

      fetchMenuItems();
      handleCloseDialog();
    } catch (error: any) {
      console.error('Error saving menu item:', error);
      const message = error.response?.data?.message || 'Failed to save menu item';
      toast.error(message);
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (item: MenuItem) => {
    try {
      await menuItemService.toggleStatus(item.id);
      toast.success(`Menu item ${item.isActive ? 'deactivated' : 'activated'} successfully`);
      fetchMenuItems();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Failed to toggle status');
    }
  };

  // Handle delete
  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      await menuItemService.delete(id);
      toast.success('Menu item deleted successfully');
      fetchMenuItems();
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast.error('Failed to delete menu item');
    }
  };

  // Handle edit
  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      categoryId: item.categoryId.toString(),
      imageUrl: item.imageUrl || '',
      cal: item.cal?.toString() || '0',
      isActive: item.isActive,
    });
    setDialogOpen(true);
  };

  // Handle create
  const handleCreate = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      categoryId: '',
      imageUrl: '',
      cal: '0',
      isActive: true,
    });
    setDialogOpen(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      categoryId: '',
      imageUrl: '',
      cal: '0',
      isActive: true,
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-6 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 text-gray-900">
            <ChefHat className="h-8 w-8 text-black" />
            <span>Menu Items</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your restaurant menu items
          </p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white">
          <Plus className="h-4 w-4" />
          <span>Add Menu Item</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Inactive</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Menu Items Grid */}
      <Card>
        <CardHeader>
          <CardTitle>All Menu Items ({filteredItems.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading menu items...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || filterCategory !== 'all' || filterStatus !== 'all' 
                ? 'No menu items found' 
                : 'No menu items yet. Create your first one!'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {item.imageUrl ? (
                        <img 
                          src={item.imageUrl} 
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No image</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        {item.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.categoryName || `Cat #${item.categoryId}`}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-green-600">{formatVND(item.price)}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={`border ${item.isActive ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                        {item.isActive ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(item)}
                          className={item.isActive ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}
                        >
                          {item.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(item.id, item.name)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Menu Item' : 'Create New Menu Item'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="name">Item Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Fried Chicken, Grilled Chicken"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your menu item..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (VND) *</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="50000"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={formData.categoryId} 
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="image">Image</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                  {uploading && <span className="text-sm text-muted-foreground">Uploading...</span>}
                </div>
                {formData.imageUrl && (
                  <div className="mt-2">
                    <img 
                      src={formData.imageUrl} 
                      alt="Preview" 
                      className="h-32 w-32 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={uploading}>
              {editingItem ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MenuItems;
