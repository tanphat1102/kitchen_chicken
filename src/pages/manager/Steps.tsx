import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  ListOrdered,
  Plus,
  Search,
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
  ChefHat,
} from 'lucide-react';
import { stepService, type Step, type CreateStepRequest } from '@/services/stepService';
import { menuItemService } from '@/services/menuItemService';
import type { MenuItem } from '@/types/api.types';
import toast from 'react-hot-toast';

const Steps: React.FC = () => {
  const [steps, setSteps] = useState<Step[]>([]);
  const [allSteps, setAllSteps] = useState<Step[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<Step | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMenuItem, setFilterMenuItem] = useState<string>('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Form state
  const [formData, setFormData] = useState({
    description: '',
    order: 1,
    menuItemId: 0,
  });

  // Fetch steps with pagination and stats
  const fetchSteps = async () => {
    try {
      setLoading(true);
      const [data, allData, count] = await Promise.all([
        stepService.getAll(),
        stepService.getAll(),
        stepService.getAll().then(data => data.length),
      ]);
      
      // Sort by order
      const sortedData = data.sort((a, b) => a.order - b.order);
      const sortedAllData = allData.sort((a, b) => a.order - b.order);
      
      setSteps(sortedData);
      setAllSteps(sortedAllData);
      setTotalCount(count);
    } catch (error) {
      console.error('Error fetching steps:', error);
      toast.error('Failed to load steps');
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
    fetchSteps();
    fetchMenuItems();
  }, [currentPage]);

  // Filter steps
  const filteredSteps = steps.filter((step) => {
    const matchesSearch = step.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMenuItem = filterMenuItem === 'all' || step.menuItemId.toString() === filterMenuItem;
    return matchesSearch && matchesMenuItem;
  });

  // Stats from all steps - FIXED LOGIC
  const totalSteps = allSteps.length;
  
  // Group steps by menuItemId to count unique menu items with steps
  const menuItemsWithSteps = new Map<number, Step[]>();
  allSteps.forEach(step => {
    if (!menuItemsWithSteps.has(step.menuItemId)) {
      menuItemsWithSteps.set(step.menuItemId, []);
    }
    menuItemsWithSteps.get(step.menuItemId)!.push(step);
  });
  
  const uniqueMenuItems = menuItemsWithSteps.size;

  // Handle create/edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData: CreateStepRequest = {
        description: formData.description,
        order: formData.order,
        menuItemId: formData.menuItemId,
      };

      if (editingStep) {
        await stepService.update(editingStep.id, {
          description: submitData.description,
          order: submitData.order,
        });
        toast.success('Step updated successfully');
      } else {
        await stepService.create(submitData);
        toast.success('Step created successfully');
      }
      
      setIsDialogOpen(false);
      resetForm();
      fetchSteps();
    } catch (error: any) {
      console.error('Error saving step:', error);
      toast.error(error.response?.data?.message || 'Failed to save step');
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this step?')) return;
    
    try {
      await stepService.delete(id);
      toast.success('Step deleted successfully');
      fetchSteps();
    } catch (error: any) {
      console.error('Error deleting step:', error);
      toast.error(error.response?.data?.message || 'Failed to delete step');
    }
  };

  // Handle edit
  const handleEdit = (step: Step) => {
    setEditingStep(step);
    setFormData({
      description: step.description,
      order: step.order,
      menuItemId: step.menuItemId,
    });
    setIsDialogOpen(true);
  };

  // Handle change order
  const handleChangeOrder = async (stepId: number, direction: 'up' | 'down') => {
    // Find step in FILTERED list (important for menu item context)
    const stepIndex = filteredSteps.findIndex(s => s.id === stepId);
    if (stepIndex === -1) return;

    const currentStep = filteredSteps[stepIndex];
    
    // Check boundaries within the FILTERED context
    if (direction === 'up' && stepIndex === 0) {
      toast.error('This is already the first step');
      return;
    }
    
    if (direction === 'down' && stepIndex === filteredSteps.length - 1) {
      toast.error('This is already the last step');
      return;
    }

    const newOrder = direction === 'up' ? currentStep.order - 1 : currentStep.order + 1;

    if (newOrder < 1) {
      toast.error('Step order cannot be less than 1');
      return;
    }

    try {
      await stepService.changeOrder(stepId, { newOrder });
      toast.success(`Step moved ${direction === 'up' ? 'up' : 'down'} successfully`);
      fetchSteps();
    } catch (error: any) {
      console.error('Error changing step order:', error);
      toast.error(error.response?.data?.message || 'Failed to change order');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      description: '',
      order: 1,
      menuItemId: 0,
    });
    setEditingStep(null);
  };

  // Open create dialog
  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  // Get menu item name by ID
  const getMenuItemName = (menuItemId: number) => {
    const item = menuItems.find(m => m.id === menuItemId);
    return item?.name || 'Unknown';
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 animate-card">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 text-gray-900">
            <ListOrdered className="h-8 w-8 text-gray-900" />
            <span>Recipe Steps Management</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage cooking steps and instructions for menu items
          </p>
        </div>
        <Button 
          onClick={openCreateDialog}
          className="gap-2 bg-gray-900 hover:bg-gray-800"
        >
          <Plus className="h-4 w-4" />
          Add Step
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 card-grid">
        <Card className="border-l-4 border-l-gray-900 bg-white animate-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Steps</CardTitle>
            <ListOrdered className="h-4 w-4 text-gray-900" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalSteps}</div>
            <p className="text-xs text-gray-500 mt-1">All recipe steps</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 bg-white animate-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Menu Items</CardTitle>
            <ChefHat className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{uniqueMenuItems}</div>
            <p className="text-xs text-gray-500 mt-1">With recipe steps</p>
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
                placeholder="Search steps..."
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

      {/* Steps Table */}
      <Card className="bg-white animate-card">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-gray-900">
            Recipe Steps ({filteredSteps.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading steps...</div>
          ) : filteredSteps.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No steps found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Order</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Menu Item</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSteps.map((step, index) => (
                  <TableRow key={step.id}>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {step.order}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <p className="text-sm text-gray-900 line-clamp-2">
                        {step.description}
                      </p>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {getMenuItemName(step.menuItemId)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleChangeOrder(step.id, 'up')}
                          disabled={index === 0}
                          className="hover:bg-gray-100"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleChangeOrder(step.id, 'down')}
                          disabled={index === filteredSteps.length - 1}
                          className="hover:bg-gray-100"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(step)}
                          className="hover:bg-gray-100"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(step.id)}
                          className="hover:bg-red-50 hover:text-red-600"
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 animate-card">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingStep ? 'Edit Recipe Step' : 'Create New Recipe Step'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="menuItemId">Menu Item *</Label>
                <Select
                  value={formData.menuItemId.toString()}
                  onValueChange={(value) => 
                    setFormData({ ...formData, menuItemId: parseInt(value) })
                  }
                  disabled={!!editingStep}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select menu item" />
                  </SelectTrigger>
                  <SelectContent>
                    {menuItems.map((item) => (
                      <SelectItem key={item.id} value={item.id.toString()}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {editingStep ? (
                  <p className="text-xs text-amber-600">
                    ⚠️ Menu item cannot be changed when editing a step
                  </p>
                ) : (
                  <p className="text-xs text-gray-500">
                    Select which dish this cooking step belongs to
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="order">Step Order *</Label>
                <Input
                  id="order"
                  type="number"
                  min="1"
                  placeholder="1"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                  required
                />
                <p className="text-xs text-gray-500">
                  Step number in the cooking sequence (e.g., 1, 2, 3...)
                </p>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Cooking Instructions *</Label>
                <Textarea
                  id="description"
                  placeholder="Example: Heat oil in a pan over medium heat, add minced garlic..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  required
                />
                <p className="text-xs text-gray-500">
                  Detailed instructions for this step of the recipe
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
              <Button type="submit" className="bg-gray-900 hover:bg-gray-800">
                {editingStep ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Steps;
