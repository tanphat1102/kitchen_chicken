import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { managerDishService, type Dish } from "@/services/managerDishService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle,
  ImageIcon,
  Pencil,
  Plus,
  Search,
  Utensils,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

interface DishFormData {
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  cal: number;
}

// Extend Dish type to include isActive
interface DishWithStatus extends Dish {
  isActive?: boolean;
}

const Dishes = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState<DishWithStatus | null>(null);
  const [formData, setFormData] = useState<DishFormData>({
    name: "",
    description: "",
    imageUrl: "",
    price: 0,
    cal: 0,
  });

  // Load deactivated dishes from localStorage
  const getDeactivatedDishes = (): number[] => {
    const stored = localStorage.getItem("deactivatedDishes");
    return stored ? JSON.parse(stored) : [];
  };

  // Save deactivated dishes to localStorage
  const saveDeactivatedDishes = (ids: number[]) => {
    localStorage.setItem("deactivatedDishes", JSON.stringify(ids));
  };

  // Toggle dish status (soft delete)
  const toggleDishStatus = (id: number) => {
    const deactivated = getDeactivatedDishes();
    const isCurrentlyDeactivated = deactivated.includes(id);

    let newDeactivated: number[];
    if (isCurrentlyDeactivated) {
      newDeactivated = deactivated.filter((dishId) => dishId !== id);
      toast.success("Dish activated successfully");
    } else {
      newDeactivated = [...deactivated, id];
      toast.success("Dish deactivated successfully");
    }

    saveDeactivatedDishes(newDeactivated);

    // Refetch to update UI
    queryClient.invalidateQueries({ queryKey: ["manager-dishes"] });
  };

  // Fetch all dishes
  const { data: dishes = [], isLoading } = useQuery({
    queryKey: ["manager-dishes"],
    queryFn: async () => {
      const data = await managerDishService.getAllForStats();
      const deactivated = getDeactivatedDishes();
      return data.map((dish) => ({
        ...dish,
        isActive: !deactivated.includes(dish.id),
      }));
    },
  });

  // Fetch dish count
  const { data: totalCount = 0 } = useQuery({
    queryKey: ["manager-dishes", "count"],
    queryFn: () => managerDishService.getCount(),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: DishFormData) => managerDishService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manager-dishes"] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast.success("Dish created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create dish");
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<DishFormData> }) =>
      managerDishService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manager-dishes"] });
      setIsEditDialogOpen(false);
      setSelectedDish(null);
      resetForm();
      toast.success("Dish updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update dish");
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      imageUrl: "",
      price: 0,
      cal: 0,
    });
  };

  const handleCreate = () => {
    setIsCreateDialogOpen(true);
    resetForm();
  };

  const handleEdit = (dish: DishWithStatus) => {
    setSelectedDish(dish);
    setFormData({
      name: dish.name,
      description: dish.description || "",
      imageUrl: dish.imageUrl || "",
      price: dish.price,
      cal: dish.cal,
    });
    setIsEditDialogOpen(true);
  };

  const handleToggleStatus = (dish: DishWithStatus) => {
    toggleDishStatus(dish.id);
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
    dish.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Filter out custom dishes (only show predefined dishes)
  const predefinedDishes = filteredDishes.filter((dish) => !dish.isCustom);

  // Calculate stats
  const stats = {
    total: predefinedDishes.length,
    active: predefinedDishes.filter((dish) => dish.isActive !== false).length,
    inactive: predefinedDishes.filter((dish) => dish.isActive === false).length,
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">Loading dishes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="animate-card flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-gray-900">
            <Utensils className="h-8 w-8 text-gray-900" />
            <span>Dishes Management</span>
          </h1>
          <p className="mt-1 text-sm text-gray-500">Manage predefined dishes</p>
        </div>
        <Button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-gray-900 text-white hover:bg-gray-800"
        >
          <Plus className="h-4 w-4" />
          <span>Add Dish</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="card-grid grid gap-4 md:grid-cols-4">
        <Card className="hover-lift animate-card border-gray-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Dishes
            </CardTitle>
            <Utensils className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats.total}
            </div>
            <p className="mt-1 text-xs text-gray-500">Predefined dishes</p>
          </CardContent>
        </Card>

        <Card className="hover-lift animate-card border-gray-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Dishes
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats.active}
            </div>
            <p className="mt-1 text-xs text-gray-500">Currently active</p>
          </CardContent>
        </Card>

        <Card className="hover-lift animate-card border-gray-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Inactive Dishes
            </CardTitle>
            <XCircle className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {stats.inactive}
            </div>
            <p className="mt-1 text-xs text-gray-500">Currently inactive</p>
          </CardContent>
        </Card>

        <Card className="hover-lift animate-card border-gray-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Search Results
            </CardTitle>
            <Search className="h-4 w-4 text-gray-900" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {searchQuery ? predefinedDishes.length : predefinedDishes.length}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {searchQuery ? "Filtered results" : "All dishes"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card className="animate-card-delayed border-gray-200 bg-white">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-500" />
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
      <Card className="border-gray-200 bg-white">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-gray-900">
            All Dishes ({predefinedDishes.length})
          </CardTitle>
          <div className="text-muted-foreground text-sm">
            Showing {predefinedDishes.length} predefined dishes
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {predefinedDishes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Utensils className="text-muted-foreground mb-4 h-12 w-12" />
              <h3 className="mb-2 text-lg font-semibold">No dishes found</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                {searchQuery
                  ? "Try adjusting your search"
                  : "Get started by creating your first dish"}
              </p>
              {!searchQuery && (
                <Button
                  onClick={handleCreate}
                  className="bg-gray-900 text-white hover:bg-gray-800"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Dish
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {predefinedDishes.map((dish) => (
                <Card
                  key={dish.id}
                  className={`group overflow-hidden border-gray-200 bg-white transition-all duration-300 hover:border-gray-400 hover:shadow-xl ${
                    dish.isActive === false ? "opacity-50" : ""
                  }`}
                >
                  <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                    {dish.imageUrl ? (
                      <img
                        src={dish.imageUrl}
                        alt={dish.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <Utensils className="h-20 w-20 text-gray-400 opacity-50" />
                      </div>
                    )}
                    {/* Overlay gradient on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    {/* Action button - Only Edit */}
                    <div className="absolute top-3 right-3 flex translate-y-2 transform gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="group/edit h-9 w-9 border !border-gray-200 !bg-white/95 shadow-lg backdrop-blur-sm transition-colors hover:!border-yellow-500 hover:!bg-yellow-400"
                        onClick={() => handleEdit(dish)}
                      >
                        <Pencil className="h-4 w-4 !text-gray-700 transition-colors group-hover/edit:!text-black" />
                      </Button>
                    </div>
                  </div>

                  <CardContent className="space-y-3 p-5">
                    {/* Title */}
                    <div>
                      <h3 className="mb-1 truncate text-lg font-bold text-gray-900 transition-colors group-hover:text-black">
                        {dish.name}
                      </h3>
                      {dish.description && (
                        <p className="line-clamp-2 text-sm leading-relaxed text-gray-600">
                          {dish.description}
                        </p>
                      )}
                    </div>

                    {/* Price, Calories & Status - All in one row */}
                    <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-2">
                      <Badge
                        variant="secondary"
                        className="flex-shrink-0 bg-gray-900 px-3 py-1 text-sm font-semibold text-white hover:bg-black"
                      >
                        {dish.price.toLocaleString()} ₫
                      </Badge>
                      {dish.cal > 0 && (
                        <Badge
                          variant="outline"
                          className="flex-shrink-0 border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-700 hover:bg-gray-50"
                        >
                          {dish.cal} cal
                        </Badge>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(dish)}
                        className={`ml-auto flex-shrink-0 !border-gray-300 !bg-white transition-colors ${
                          dish.isActive !== false
                            ? "!text-gray-900 hover:!border-red-500 hover:!bg-red-500 hover:!text-white"
                            : "!text-gray-900 hover:!border-green-400 hover:!bg-green-400 hover:!text-black"
                        }`}
                      >
                        {dish.isActive !== false ? (
                          <>
                            <XCircle className="mr-1 h-4 w-4" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <CheckCircle className="mr-1 h-4 w-4" />
                            Activate
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Created Date */}
                    {dish.createdAt && (
                      <div className="flex items-center gap-1.5 pt-1 text-xs text-gray-500">
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span>
                          {new Date(dish.createdAt).toLocaleDateString(
                            "vi-VN",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </span>
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
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
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
                    onClick={() => window.open(formData.imageUrl, "_blank")}
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {formData.imageUrl && (
                <div className="mt-2 overflow-hidden rounded-md border">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="h-48 w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "";
                      e.currentTarget.style.display = "none";
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
              disabled={
                !formData.name || !formData.price || createMutation.isPending
              }
            >
              {createMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
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
                    onClick={() => window.open(formData.imageUrl, "_blank")}
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {formData.imageUrl && (
                <div className="mt-2 overflow-hidden rounded-md border">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="h-48 w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "";
                      e.currentTarget.style.display = "none";
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
              disabled={
                !formData.name || !formData.price || updateMutation.isPending
              }
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dishes;
