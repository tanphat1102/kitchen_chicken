import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Badge } from '@/components/ui/badge';
import {
  Apple,
  Plus,
  Search,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { nutrientService, type Nutrient, type CreateNutrientRequest } from '@/services/nutrientService';
import { menuItemService } from '@/services/menuItemService';
import type { MenuItem } from '@/types/api.types';
import toast from 'react-hot-toast';

const Nutrients: React.FC = () => {
  const [nutrients, setNutrients] = useState<Nutrient[]>([]);
  const [allNutrients, setAllNutrients] = useState<Nutrient[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNutrient, setEditingNutrient] = useState<Nutrient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMenuItem, setFilterMenuItem] = useState<string>('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    quantity: 0,
    unit: '',
    menuItemId: undefined as number | undefined,
  });

  // Fetch nutrients with pagination and stats
  const fetchNutrients = async () => {
    try {
      setLoading(true);
      const [data, allData, count] = await Promise.all([
        nutrientService.getAll(),
        nutrientService.getAll(),
        nutrientService.getAll().then(data => data.length),
      ]);
      setNutrients(data);
      setAllNutrients(allData);
      setTotalCount(count);
    } catch (error) {
      console.error('Error fetching nutrients:', error);
      toast.error('Failed to load nutrients');
    } finally {
      setLoading(false);
    }
  };

  // Fetch menu items for dropdown
  const fetchMenuItems = async () => {
    try {
      const items = await menuItemService.getAll();
      setMenuItems(items);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  useEffect(() => {
    fetchNutrients();
    fetchMenuItems();
  }, [currentPage]);

  // Filter nutrients
  const filteredNutrients = nutrients.filter((nutrient) => {
    const matchesSearch = nutrient.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMenuItem = filterMenuItem === 'all' || 
      (nutrient.menuItemId && nutrient.menuItemId.toString() === filterMenuItem);
    return matchesSearch && matchesMenuItem;
  });

  // Stats from all nutrients - IMPROVED LOGIC
  const totalNutrients = allNutrients.length;
  const nutrientsWithMenuItems = allNutrients.filter(n => n.menuItemId).length;
  const standaloneNutrients = totalNutrients - nutrientsWithMenuItems;
  
  // Count unique menu items that have nutrients
  const menuItemsWithNutrients = new Set(
    allNutrients.filter(n => n.menuItemId).map(n => n.menuItemId)
  ).size;

  // Handle create/edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData: CreateNutrientRequest = {
        name: formData.name,
        quantity: formData.quantity,
        unit: formData.unit,
        ...(formData.menuItemId && { menuItemId: formData.menuItemId }),
      };

      if (editingNutrient) {
        await nutrientService.update(editingNutrient.id, submitData);
        toast.success('Nutrient updated successfully');
      } else {
        await nutrientService.create(submitData);
        toast.success('Nutrient created successfully');
      }
      
      setIsDialogOpen(false);
      resetForm();
      fetchNutrients();
    } catch (error: any) {
      console.error('Error saving nutrient:', error);
      toast.error(error.response?.data?.message || 'Failed to save nutrient');
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this nutrient?')) return;
    
    try {
      await nutrientService.delete(id);
      toast.success('Nutrient deleted successfully');
      fetchNutrients();
    } catch (error: any) {
      console.error('Error deleting nutrient:', error);
      toast.error(error.response?.data?.message || 'Failed to delete nutrient');
    }
  };

  // Handle edit
  const handleEdit = (nutrient: Nutrient) => {
    setEditingNutrient(nutrient);
    setFormData({
      name: nutrient.name,
      quantity: nutrient.quantity,
      unit: nutrient.unit,
      menuItemId: nutrient.menuItemId,
    });
    setIsDialogOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      quantity: 0,
      unit: '',
      menuItemId: undefined,
    });
    setEditingNutrient(null);
  };

  // Open create dialog
  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  // Get menu item name by ID
  const getMenuItemName = (menuItemId?: number) => {
    if (!menuItemId) return 'N/A';
    const item = menuItems.find(m => m.id === menuItemId);
    return item?.name || 'Unknown';
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 animate-card">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 text-gray-900">
            <Apple className="h-8 w-8 text-black" />
            <span>Nutrients Management</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage nutritional information for menu items
          </p>
        </div>
        <Button 
          onClick={openCreateDialog}
          className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white"
        >
          <Plus className="h-4 w-4" />
          <span>Add Nutrient</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 card-grid">
        <Card className="hover-lift animate-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Nutrients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{totalNutrients}</div>
          </CardContent>
        </Card>

        <Card className="hover-lift animate-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Menu Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{menuItemsWithNutrients}</div>
          </CardContent>
        </Card>

        <Card className="hover-lift animate-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Linked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{nutrientsWithMenuItems}</div>
          </CardContent>
        </Card>

        <Card className="hover-lift animate-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Unassigned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{standaloneNutrients}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white animate-card">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search nutrients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterMenuItem} onValueChange={setFilterMenuItem}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by menu item" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Menu Items</SelectItem>
                {menuItems.map((item) => (
                  <SelectItem key={item.id} value={item.id.toString()}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Nutrients Table */}
      <Card className="bg-white border-gray-200">
        <CardHeader className="border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl text-gray-900">Nutrients List ({filteredNutrients.length})</CardTitle>
            <div className="text-sm text-gray-600">
              Total: {allNutrients.length} nutrients
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
              <p className="text-gray-600">Loading nutrients...</p>
            </div>
          ) : filteredNutrients.length === 0 ? (
            <div className="text-center py-12">
              <Apple className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">No nutrients yet</p>
              <p className="text-sm text-gray-600 mb-4">Get started by creating your first nutrient</p>
              <Button onClick={openCreateDialog} className="bg-black text-white hover:bg-gray-800">
                <Plus className="h-4 w-4 mr-2" />
                Create First Nutrient
              </Button>
            </div>
          ) : (
            <div className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50 border-gray-200">
                    <TableHead className="font-semibold text-gray-700">Name</TableHead>
                    <TableHead className="font-semibold text-gray-700">Quantity</TableHead>
                    <TableHead className="font-semibold text-gray-700">Unit</TableHead>
                    <TableHead className="font-semibold text-gray-700">Menu Item</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNutrients.map((nutrient) => (
                    <TableRow key={nutrient.id} className="hover:bg-gray-50 border-gray-200">
                      <TableCell className="text-gray-900">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                            <Apple className="h-5 w-5 text-white" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900">{nutrient.name}</div>
                            <div className="text-sm text-gray-600">ID: #{nutrient.id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-900">{nutrient.quantity}</TableCell>
                      <TableCell>
                        <Badge className="bg-white text-black border-black">{nutrient.unit}</Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {nutrient.menuItemId ? (
                          getMenuItemName(nutrient.menuItemId)
                        ) : (
                          <span className="italic text-gray-400">Not assigned</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(nutrient)}
                            className="!bg-white !border-gray-300 hover:!bg-yellow-400 hover:!border-yellow-500 transition-colors"
                          >
                            <Edit className="h-4 w-4 !text-gray-900 hover:!text-black" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(nutrient.id)}
                            className="!bg-white !border-gray-300 !text-gray-900 hover:!bg-red-500 hover:!text-white hover:!border-red-500 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {!loading && filteredNutrients.length > 0 && totalPages > 1 && (
        <Card className="bg-white animate-card">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {filteredNutrients.length} of {allNutrients.length} nutrients (Page {currentPage} of {totalPages})
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
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingNutrient ? 'Edit Nutrient' : 'Create New Nutrient'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nutrient Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Protein, Vitamin C, Calcium"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <p className="text-xs text-gray-500">
                  Name of the nutritional component
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Amount per serving
                  </p>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="unit">Unit *</Label>
                  <Input
                    id="unit"
                    placeholder="g, mg, kcal, IU"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Measurement unit
                  </p>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="menuItemId">Link to Menu Item (Optional)</Label>
                <Select
                  value={formData.menuItemId?.toString() || 'none'}
                  onValueChange={(value) => 
                    setFormData({ 
                      ...formData, 
                      menuItemId: value === 'none' ? undefined : parseInt(value) 
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select menu item or leave unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Standalone)</SelectItem>
                    {menuItems.map((item) => (
                      <SelectItem key={item.id} value={item.id.toString()}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Assign this nutrient to a specific dish, or leave unassigned to use later
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-black hover:bg-gray-800">
                {editingNutrient ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Nutrients;
