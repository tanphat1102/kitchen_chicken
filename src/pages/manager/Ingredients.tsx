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
import { Plus, Pencil, Trash2, Search, Package, Store } from 'lucide-react';
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quantity: '',
    baseUnit: 'G' as 'G' | 'ML', // UnitType enum: G or ML
    batchNumber: '',
    storeIds: [] as number[], // Array of store IDs
    imageUrl: '',
    isActive: true,
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
    const matchesStore = filterStore === 'all' || ingredient.storeId?.toString() === filterStore;
    // Note: Backend doesn't provide minimumStock, so stock level filtering is not available
    return matchesSearch && matchesStore;
  });

  // Stats
  const stats = {
    total: ingredients.length,
    lowStock: 0, // Backend doesn't provide minimumStock field
    critical: 0, // Backend doesn't provide minimumStock field
    stores: new Set(ingredients.map(i => i.storeId).filter(Boolean)).size,
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
  // Note: Backend doesn't provide minimumStock, so we can't determine this
  const isLowStock = (ingredient: Ingredient) => {
    return false; // Backend doesn't provide minimumStock field
  };

  // Check if ingredient is critical
  // Note: Backend doesn't provide minimumStock, so we can't determine this
  const isCritical = (ingredient: Ingredient) => {
    return false; // Backend doesn't provide minimumStock field
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
      if (!formData.baseUnit) {
        toast.error('Base unit is required (G or ML)');
        return;
      }
      if (!formData.batchNumber.trim()) {
        toast.error('Batch number is required');
        return;
      }
      if (!editingIngredient && formData.storeIds.length === 0) {
        toast.error('At least one store is required');
        return;
      }

      if (editingIngredient) {
        // Update
        await ingredientService.update(editingIngredient.id, {
          name: formData.name,
          description: formData.description || undefined,
          quantity: parseFloat(formData.quantity),
          baseUnit: formData.baseUnit,
          batchNumber: formData.batchNumber,
          imageUrl: formData.imageUrl || undefined,
          isActive: formData.isActive,
        });
        toast.success('Ingredient updated successfully');
      } else {
        // Create
        await ingredientService.create({
          name: formData.name,
          description: formData.description || undefined,
          quantity: parseFloat(formData.quantity),
          baseUnit: formData.baseUnit,
          batchNumber: formData.batchNumber,
          storeIds: formData.storeIds,
          imageUrl: formData.imageUrl || undefined,
          isActive: formData.isActive,
        });
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
      baseUnit: (ingredient.baseUnit as 'G' | 'ML') || 'G',
      batchNumber: ingredient.batchNumber || '',
      storeIds: ingredient.storeId ? [ingredient.storeId] : [],
      imageUrl: ingredient.imageUrl || '',
      isActive: ingredient.isActive ?? true,
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
      baseUnit: 'G',
      batchNumber: '',
      storeIds: [],
      imageUrl: '',
      isActive: true,
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
      baseUnit: 'G',
      batchNumber: '',
      storeIds: [],
      imageUrl: '',
      isActive: true,
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-6 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 animate-card">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 text-gray-900">
            <Package className="h-8 w-8 text-gray-900" />
            <span>Ingredients Inventory</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage inventory across all stores with FIFO tracking
          </p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white">
          <Plus className="h-4 w-4" />
          <span>Add Ingredient</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 card-grid">
        <Card className="hover-lift animate-card bg-white border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <p className="text-xs text-gray-500 mt-1">Across {stats.stores} stores</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-gray-900 hover-lift animate-card bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Low Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.lowStock}</div>
            <p className="text-xs text-gray-500 mt-1">Below minimum</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-gray-900 hover-lift animate-card bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Critical</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.critical}</div>
            <p className="text-xs text-gray-500 mt-1">Urgent restock needed</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-gray-900 hover-lift animate-card bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Stores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.stores}</div>
            <p className="text-xs text-gray-500 mt-1">Locations tracked</p>
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

            {/* Note: Stock level filtering removed - backend doesn't provide minimumStock field */}
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
              {searchTerm || filterStore !== 'all'
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
                  <TableHead>Batch #</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIngredients.map((ingredient) => (
                  <TableRow 
                    key={ingredient.id}
                    className={!ingredient.isActive ? 'opacity-50' : ''}
                  >
                    <TableCell>
                      <div>
                        <p className="font-semibold text-gray-900">{ingredient.name}</p>
                        {ingredient.description && (
                          <p className="text-sm text-gray-600 line-clamp-1">
                            {ingredient.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Store className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-gray-900">{ingredient.storeName || `Store #${ingredient.storeId}`}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg text-gray-900">{ingredient.quantity}</span>
                        <span className="text-sm text-gray-600 uppercase font-medium">{ingredient.baseUnit}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {ingredient.batchNumber || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {ingredient.isActive ? (
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500">
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(ingredient)}
                          className="bg-white text-gray-900 hover:bg-gray-800 hover:text-white border-gray-300 transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(ingredient.id, ingredient.name)}
                          className="bg-white text-gray-900 hover:bg-red-500 hover:text-white hover:border-red-500 border-gray-300 transition-colors"
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
                <Label htmlFor="baseUnit">Base Unit *</Label>
                <Select 
                  value={formData.baseUnit} 
                  onValueChange={(value: 'G' | 'ML') => setFormData({ ...formData, baseUnit: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="G">G (Grams)</SelectItem>
                    <SelectItem value="ML">ML (Milliliters)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="batchNumber">Batch Number *</Label>
                <Input
                  id="batchNumber"
                  placeholder="BATCH-2025-001"
                  value={formData.batchNumber}
                  onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="stores">Stores * {!editingIngredient && '(Select multiple)'}</Label>
                <Select 
                  value={formData.storeIds[0]?.toString() || ''} 
                  onValueChange={(value) => setFormData({ ...formData, storeIds: [parseInt(value)] })}
                  disabled={editingIngredient !== null}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select store(s)" />
                  </SelectTrigger>
                  <SelectContent>
                    {stores.map((store) => (
                      <SelectItem key={store.id} value={store.id.toString()}>
                        {store.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!editingIngredient && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Note: Multiple stores supported in backend, UI shows single selection
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="isActive" className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4"
                  />
                  Is Active
                </Label>
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
