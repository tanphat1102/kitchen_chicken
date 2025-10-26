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
import { Plus, Pencil, Trash2, Search, Package, AlertTriangle, Store, TrendingDown } from 'lucide-react';
import { storeService, type Store as StoreLocation } from '@/services/storeService';
import { ingredientService, type Ingredient } from '@/services/ingredientService';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const Ingredients: React.FC = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [stores, setStores] = useState<StoreLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStore, setFilterStore] = useState<string>('all');
  const [filterStock, setFilterStock] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quantity: '',
    unit: '',
    minimumStock: '',
    batchNumber: '',
    expiryDate: '',
    storeId: '',
  });

  // Fetch ingredients
  const fetchIngredients = async () => {
    try {
      setLoading(true);
      const data = await ingredientService.getAll();
      setIngredients(data);
    } catch (error) {
      console.error('Error fetching ingredients:', error);
      toast.error('Failed to load ingredients');
    } finally {
      setLoading(false);
    }
  };

  // Fetch stores
  const fetchStores = async () => {
    try {
      const data = await storeService.getAll();
      setStores(data.filter((store: StoreLocation) => store.isActive));
    } catch (error) {
      console.error('Error fetching stores:', error);
      toast.error('Failed to load stores');
    }
  };

  useEffect(() => {
    fetchIngredients();
    fetchStores();
  }, []);

  // Filter ingredients
  const filteredIngredients = ingredients.filter((ingredient) => {
    const matchesSearch = ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ingredient.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStore = filterStore === 'all' || ingredient.storeId.toString() === filterStore;
    const isLowStock = ingredient.quantity <= ingredient.minimumStock;
    const matchesStock = filterStock === 'all' || 
                        (filterStock === 'low' && isLowStock) ||
                        (filterStock === 'normal' && !isLowStock);
    return matchesSearch && matchesStore && matchesStock;
  });

  // Stats
  const stats = {
    total: ingredients.length,
    lowStock: ingredients.filter(i => i.quantity <= i.minimumStock).length,
    critical: ingredients.filter(i => i.quantity <= i.minimumStock * 0.5).length,
    stores: new Set(ingredients.map(i => i.storeId)).size,
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch {
      return dateString;
    }
  };

  // Check if ingredient is low stock
  const isLowStock = (ingredient: Ingredient) => {
    return ingredient.quantity <= ingredient.minimumStock;
  };

  // Check if ingredient is critical
  const isCritical = (ingredient: Ingredient) => {
    return ingredient.quantity <= ingredient.minimumStock * 0.5;
  };

  // Handle create/edit
  const handleSubmit = async () => {
    try {
      if (!formData.name.trim()) {
        toast.error('Ingredient name is required');
        return;
      }
      if (!formData.quantity || parseFloat(formData.quantity) < 0) {
        toast.error('Valid quantity is required');
        return;
      }
      if (!formData.unit.trim()) {
        toast.error('Unit is required');
        return;
      }
      if (!formData.minimumStock || parseFloat(formData.minimumStock) < 0) {
        toast.error('Valid minimum stock is required');
        return;
      }
      if (!formData.storeId) {
        toast.error('Store is required');
        return;
      }

      const submitData = {
        name: formData.name,
        description: formData.description || undefined,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        minimumStock: parseFloat(formData.minimumStock),
        batchNumber: formData.batchNumber || undefined,
        expiryDate: formData.expiryDate || undefined,
        storeId: parseInt(formData.storeId),
      };

      if (editingIngredient) {
        // Update
        await ingredientService.update(editingIngredient.id, submitData);
        toast.success('Ingredient updated successfully');
      } else {
        // Create
        await ingredientService.create(submitData);
        toast.success('Ingredient created successfully');
      }

      fetchIngredients();
      handleCloseDialog();
    } catch (error: any) {
      console.error('Error saving ingredient:', error);
      const message = error.response?.data?.message || 'Failed to save ingredient';
      toast.error(message);
    }
  };

  // Handle delete
  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      await ingredientService.delete(id);
      toast.success('Ingredient deleted successfully');
      fetchIngredients();
    } catch (error) {
      console.error('Error deleting ingredient:', error);
      toast.error('Failed to delete ingredient');
    }
  };

  // Handle edit
  const handleEdit = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setFormData({
      name: ingredient.name,
      description: ingredient.description || '',
      quantity: ingredient.quantity.toString(),
      unit: ingredient.unit,
      minimumStock: ingredient.minimumStock.toString(),
      batchNumber: ingredient.batchNumber || '',
      expiryDate: ingredient.expiryDate || '',
      storeId: ingredient.storeId.toString(),
    });
    setDialogOpen(true);
  };

  // Handle create
  const handleCreate = () => {
    setEditingIngredient(null);
    setFormData({
      name: '',
      description: '',
      quantity: '',
      unit: '',
      minimumStock: '',
      batchNumber: '',
      expiryDate: '',
      storeId: '',
    });
    setDialogOpen(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingIngredient(null);
    setFormData({
      name: '',
      description: '',
      quantity: '',
      unit: '',
      minimumStock: '',
      batchNumber: '',
      expiryDate: '',
      storeId: '',
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Package className="h-8 w-8 text-red-600" />
            <span>Ingredients Inventory</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage inventory across all stores with FIFO tracking
          </p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>Add Ingredient</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Across {stats.stores} stores</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Low Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.lowStock}</div>
            <p className="text-xs text-muted-foreground mt-1">Below minimum</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Critical</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
            <p className="text-xs text-muted-foreground mt-1">Urgent restock needed</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Stores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.stores}</div>
            <p className="text-xs text-muted-foreground mt-1">Locations tracked</p>
          </CardContent>
        </Card>
      </div>

      {/* Business Rules Info */}
      <Card className="border-l-4 border-l-purple-500 bg-purple-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-purple-600 mt-0.5" />
            <div>
              <p className="font-semibold text-purple-900">FIFO Inventory Management (BR-38, BR-41)</p>
              <p className="text-sm text-purple-700 mt-1">
                First-In-First-Out principle: Use oldest batches first. Track batch numbers and expiry dates to ensure food safety.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search ingredients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={filterStore} onValueChange={setFilterStore}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by store" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stores</SelectItem>
                {stores.map((store) => (
                  <SelectItem key={store.id} value={store.id.toString()}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStock} onValueChange={setFilterStock}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by stock level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="low">Low Stock</SelectItem>
                <SelectItem value="normal">Normal Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Ingredients Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Ingredients ({filteredIngredients.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading ingredients...
            </div>
          ) : filteredIngredients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || filterStore !== 'all' || filterStock !== 'all' 
                ? 'No ingredients found' 
                : 'No ingredients yet. Create your first one!'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Min. Stock</TableHead>
                  <TableHead>Batch #</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIngredients.map((ingredient) => (
                  <TableRow 
                    key={ingredient.id}
                    className={isCritical(ingredient) ? 'bg-red-50' : isLowStock(ingredient) ? 'bg-orange-50' : ''}
                  >
                    <TableCell>
                      <div>
                        <p className="font-semibold">{ingredient.name}</p>
                        {ingredient.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {ingredient.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Store className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">{ingredient.storeName || `Store #${ingredient.storeId}`}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">{ingredient.quantity}</span>
                        <span className="text-sm text-muted-foreground">{ingredient.unit}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{ingredient.minimumStock} {ingredient.unit}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {ingredient.batchNumber || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(ingredient.expiryDate)}
                    </TableCell>
                    <TableCell>
                      {isCritical(ingredient) ? (
                        <Badge className="bg-red-600 text-white">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Critical
                        </Badge>
                      ) : isLowStock(ingredient) ? (
                        <Badge className="bg-orange-500 text-white">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Low Stock
                        </Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          Normal
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(ingredient)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(ingredient.id, ingredient.name)}
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
              {editingIngredient ? 'Edit Ingredient' : 'Add New Ingredient'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="name">Ingredient Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Chicken Breast, Rice, Cooking Oil"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Additional details about the ingredient..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Current Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  placeholder="100"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Unit *</Label>
                <Input
                  id="unit"
                  placeholder="kg, liters, pieces, etc."
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minimumStock">Minimum Stock Level *</Label>
                <Input
                  id="minimumStock"
                  type="number"
                  step="0.01"
                  placeholder="10"
                  value={formData.minimumStock}
                  onChange={(e) => setFormData({ ...formData, minimumStock: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="store">Store *</Label>
                <Select 
                  value={formData.storeId} 
                  onValueChange={(value) => setFormData({ ...formData, storeId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select store" />
                  </SelectTrigger>
                  <SelectContent>
                    {stores.map((store) => (
                      <SelectItem key={store.id} value={store.id.toString()}>
                        {store.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="batchNumber">Batch Number (FIFO Tracking)</Label>
                <Input
                  id="batchNumber"
                  placeholder="BATCH-2025-001"
                  value={formData.batchNumber}
                  onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date (FIFO Tracking)</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingIngredient ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Ingredients;
