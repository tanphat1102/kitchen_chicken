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
import { Plus, Pencil, Tag, CheckCircle, XCircle } from 'lucide-react';
import { categoryService } from '@/services/categoryService';
import type { Category } from '@/types/api.types';
import toast from 'react-hot-toast';

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  // Load deactivated categories from localStorage
  const getDeactivatedCategories = (): number[] => {
    const stored = localStorage.getItem('deactivatedCategories');
    return stored ? JSON.parse(stored) : [];
  };

  // Save deactivated categories to localStorage
  const saveDeactivatedCategories = (ids: number[]) => {
    localStorage.setItem('deactivatedCategories', JSON.stringify(ids));
  };

  // Toggle category status (soft delete)
  const toggleCategoryStatus = (id: number) => {
    const deactivated = getDeactivatedCategories();
    const isCurrentlyDeactivated = deactivated.includes(id);
    
    let newDeactivated: number[];
    if (isCurrentlyDeactivated) {
      newDeactivated = deactivated.filter(catId => catId !== id);
      toast.success('Category activated successfully');
    } else {
      newDeactivated = [...deactivated, id];
      toast.success('Category deactivated successfully');
    }
    
    saveDeactivatedCategories(newDeactivated);
    
    setCategories(prev => prev.map(cat => 
      cat.id === id ? { ...cat, isActive: isCurrentlyDeactivated } : cat
    ));
    setAllCategories(prev => prev.map(cat => 
      cat.id === id ? { ...cat, isActive: isCurrentlyDeactivated } : cat
    ));
  };

  // Fetch categories with pagination and stats
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const [data, allData, count] = await Promise.all([
        categoryService.getAll(currentPage, pageSize),
        categoryService.getAllForStats(),
        categoryService.getCount(),
      ]);
      
      const deactivated = getDeactivatedCategories();
      const markStatus = (cats: Category[]) => 
        cats.map(cat => ({ ...cat, isActive: !deactivated.includes(cat.id) }));
      
      setCategories(markStatus(data));
      setAllCategories(markStatus(allData));
      setTotalCount(count);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [currentPage]);

  // Stats calculated from ALL categories
  const stats = {
    total: allCategories.length,
    active: allCategories.filter(cat => cat.isActive !== false).length,
    inactive: allCategories.filter(cat => cat.isActive === false).length,
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / pageSize);

  // Handle create/edit
  const handleSubmit = async () => {
    try {
      if (!formData.name.trim()) {
        toast.error('Category name is required');
        return;
      }

      if (editingCategory) {
        await categoryService.update(editingCategory.id, formData);
        toast.success('Category updated successfully');
      } else {
        await categoryService.create(formData);
        toast.success('Category created successfully');
      }

      fetchCategories();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Failed to save category');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
    });
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 animate-card">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 text-gray-900">
            <Tag className="h-8 w-8 text-black" />
            <span>Category Management</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage menu item categories
          </p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white">
          <Plus className="h-4 w-4" />
          <span>Add Category</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 card-grid">
        <Card className="hover-lift animate-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="hover-lift animate-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{stats.active}</div>
          </CardContent>
        </Card>

        <Card className="hover-lift animate-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Inactive</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Table */}
      <Card className="bg-white border-gray-200">
        <CardHeader className="border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl text-gray-900">All Categories ({allCategories.length})</CardTitle>
            <div className="text-sm text-gray-600">
              Showing {categories.length} of {allCategories.length} categories (Page {currentPage})
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
              <p className="text-gray-600">Loading categories...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12">
              <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">No categories yet</p>
              <p className="text-sm text-gray-600 mb-4">Get started by creating your first category</p>
              <Button onClick={handleCreate} className="bg-black text-white hover:bg-gray-800">
                <Plus className="h-4 w-4 mr-2" />
                Create First Category
              </Button>
            </div>
          ) : (
            <div className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50 border-gray-200">
                    <TableHead className="font-semibold text-gray-700">Name</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-center">Description</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-center">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id} className="hover:bg-gray-50 border-gray-200">
                      <TableCell className="text-gray-900">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                            <Tag className="h-5 w-5 text-white" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900">
                              {category.name}
                            </div>
                            <div className="text-sm text-gray-600">
                              ID: #{category.id}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="text-gray-600">
                          {category.description || '-'}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <Badge className={`border transition-colors ${category.isActive !== false ? 'bg-white text-black border-black hover:bg-black hover:text-white' : 'bg-white text-gray-700 border-black hover:bg-black hover:text-white'}`}>
                            {category.isActive !== false ? (
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
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleCategoryStatus(category.id)}
                            className={`!bg-white !border-gray-300 transition-colors ${
                              category.isActive !== false 
                                ? '!text-gray-900 hover:!bg-red-500 hover:!text-white hover:!border-red-500' 
                                : '!text-gray-900 hover:!bg-green-400 hover:!text-black hover:!border-green-400'
                            }`}
                          >
                            {category.isActive !== false ? (
                              <>
                                <XCircle className="h-4 w-4 mr-1" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Activate
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(category)}
                            className="!bg-white !border-gray-300 hover:!bg-yellow-400 hover:!border-yellow-500 transition-colors"
                          >
                            <Pencil className="h-4 w-4 !text-gray-900 hover:!text-black" />
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

        {/* Pagination */}
        {!loading && categories.length > 0 && (
          <CardContent className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {categories.length} of {allCategories.length} categories (Page {currentPage} of {totalPages})
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
        )}
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Chicken Dishes"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Optional description..."
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingCategory ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Categories;
