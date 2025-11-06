import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { managerDishService, type Dish } from '@/services/managerDishService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Pencil, Search, Utensils, ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

interface DishFormData {
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  cal: number;
}

const Dishes = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [formData, setFormData] = useState<DishFormData>({
    name: '',
    description: '',
    imageUrl: '',
    price: 0,
    cal: 0,
  });

  // Fetch all dishes
  const { data: dishes = [], isLoading } = useQuery({
    queryKey: ['manager-dishes'],
    queryFn: () => managerDishService.getAllForStats(),
  });

  // Fetch dish count
  const { data: totalCount = 0 } = useQuery({
    queryKey: ['manager-dishes', 'count'],
    queryFn: () => managerDishService.getCount(),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: DishFormData) => managerDishService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manager-dishes'] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast.success('Dish created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create dish');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<DishFormData> }) =>
      managerDishService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manager-dishes'] });
      setIsEditDialogOpen(false);
      setSelectedDish(null);
      resetForm();
      toast.success('Dish updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update dish');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      imageUrl: '',
      price: 0,
      cal: 0,
    });
  };

  const handleCreate = () => {
    setIsCreateDialogOpen(true);
    resetForm();
  };

  const handleEdit = (dish: Dish) => {
    setSelectedDish(dish);
    setFormData({
      name: dish.name,
      description: dish.description || '',
      imageUrl: dish.imageUrl || '',
      price: dish.price,
      cal: dish.cal,
    });
    setIsEditDialogOpen(true);
  };

  const onSubmitCreate = () => {
    createMutation.mutate({
      name: formData.name,
      description: formData.description,
      imageUrl: formData.imageUrl,
      price: formData.price,
      cal: formData.cal,
    });
  };

  const onSubmitEdit = () => {
    if (!selectedDish) return;
    updateMutation.mutate({
      id: selectedDish.id,
      data: formData,
    });
  };

  // Filter dishes based on search
  const filteredDishes = dishes.filter((dish) =>
    dish.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter out custom dishes (only show predefined dishes)
  const predefinedDishes = filteredDishes.filter(dish => !dish.isCustom);

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading dishes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 animate-card">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 text-gray-900">
            <Utensils className="h-8 w-8 text-gray-900" />
            <span>Dishes Management</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage predefined dishes
          </p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white">
          <Plus className="h-4 w-4" />
          <span>Add Dish</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 card-grid">
        <Card className="hover-lift animate-card bg-white border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Dishes</CardTitle>
            <Utensils className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{predefinedDishes.length}</div>
            <p className="text-xs text-gray-500 mt-1">
              Predefined dishes
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift animate-card bg-white border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Display</CardTitle>
            <Utensils className="h-4 w-4 text-gray-900" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{predefinedDishes.length}</div>
            <p className="text-xs text-gray-500 mt-1">
              Currently showing
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift animate-card bg-white border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Search Results</CardTitle>
            <Search className="h-4 w-4 text-gray-900" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {searchQuery ? predefinedDishes.length : predefinedDishes.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {searchQuery ? 'Filtered results' : 'All dishes'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card className="animate-card-delayed bg-white border-gray-200">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Dishes Grid */}
      <Card className="bg-white border-gray-200">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-gray-900">All Dishes ({predefinedDishes.length})</CardTitle>
          <div className="text-sm text-muted-foreground">
            Showing {predefinedDishes.length} predefined dishes
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {predefinedDishes.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-12">
              <Utensils className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No dishes found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery ? 'Try adjusting your search' : 'Get started by creating your first dish'}
              </p>
              {!searchQuery && (
                <Button onClick={handleCreate} className="bg-gray-900 hover:bg-gray-800 text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Dish
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {predefinedDishes.map((dish) => (
                <Card key={dish.id} className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-gray-200 bg-white hover:border-gray-400">
                  <div className="relative aspect-video bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                    {dish.imageUrl ? (
                      <img
                        src={dish.imageUrl}
                        alt={dish.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <Utensils className="h-20 w-20 text-gray-400 opacity-50" />
                      </div>
                    )}
                    {/* Overlay gradient on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Action buttons */}
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-9 w-9 !bg-white/95 hover:!bg-yellow-400 shadow-lg backdrop-blur-sm border !border-gray-200 hover:!border-yellow-500 transition-colors group/edit"
                        onClick={() => handleEdit(dish)}
                      >
                        <Pencil className="h-4 w-4 !text-gray-700 group-hover/edit:!text-black transition-colors" />
                      </Button>
                    </div>
                  </div>
                  
                  <CardContent className="p-5 space-y-3">
                    {/* Title */}
                    <div>
                      <h3 className="font-bold text-lg mb-1 truncate text-gray-900 group-hover:text-black transition-colors">
                        {dish.name}
                      </h3>
                      {dish.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                          {dish.description}
                        </p>
                      )}
                    </div>
                    
                    {/* Price & Calories */}
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                      <Badge 
                        variant="secondary" 
                        className="font-semibold text-sm px-3 py-1 bg-gray-900 text-white hover:bg-black"
                      >
                        {dish.price.toLocaleString()} ₫
                      </Badge>
                      {dish.cal > 0 && (
                        <Badge 
                          variant="outline" 
                          className="text-xs px-2.5 py-1 border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                        >
                          {dish.cal} cal
                        </Badge>
                      )}
                    </div>
                    
                    {/* Created Date */}
                    {dish.createdAt && (
                      <div className="text-xs text-gray-500 flex items-center gap-1.5 pt-1">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{new Date(dish.createdAt).toLocaleDateString('vi-VN', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Dish</DialogTitle>
            <DialogDescription>
              Add a new predefined dish to the system
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter dish name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter dish description"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <div className="flex gap-2">
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  placeholder="https://example.com/image.jpg"
                />
                {formData.imageUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(formData.imageUrl, '_blank')}
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {formData.imageUrl && (
                <div className="mt-2 rounded-md border overflow-hidden">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '';
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Price (VND) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: Number(e.target.value) })
                  }
                  placeholder="0"
                  min="0"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cal">Calories</Label>
                <Input
                  id="cal"
                  type="number"
                  value={formData.cal}
                  onChange={(e) =>
                    setFormData({ ...formData, cal: Number(e.target.value) })
                  }
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={onSubmitCreate}
              disabled={!formData.name || !formData.price || createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Dish</DialogTitle>
            <DialogDescription>Update dish information</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter dish name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter dish description"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-imageUrl">Image URL</Label>
              <div className="flex gap-2">
                <Input
                  id="edit-imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  placeholder="https://example.com/image.jpg"
                />
                {formData.imageUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(formData.imageUrl, '_blank')}
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {formData.imageUrl && (
                <div className="mt-2 rounded-md border overflow-hidden">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '';
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-price">Price (VND) *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: Number(e.target.value) })
                  }
                  placeholder="0"
                  min="0"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-cal">Calories</Label>
                <Input
                  id="edit-cal"
                  type="number"
                  value={formData.cal}
                  onChange={(e) =>
                    setFormData({ ...formData, cal: Number(e.target.value) })
                  }
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={onSubmitEdit}
              disabled={!formData.name || !formData.price || updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dishes;
