import { useState, useEffect } from "react";
import { Plus, Search, MoreVertical, MapPin, Phone, Clock, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  getAllStores,
  createStore,
  updateStore,
  toggleStoreStatus,
  deleteStore,
  type Store, 
  type CreateStoreDto 
} from "@/services/storeService";
import { StoreDialog } from "@/components/admin/StoreDialog";

export default function Stores() {
  const [stores, setStores] = useState<Store[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);

  // Fetch stores
  const fetchStores = async () => {
    try {
      setIsLoading(true);
      const data = await getAllStores();
      setStores(data);
    } catch (error) {
      console.error("Error fetching stores:", error);
      alert("Failed to load stores. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  // Filter stores based on search
  const filteredStores = stores.filter((store) =>
    store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Toggle store status
  const handleToggleStatus = async (id: number) => {
    try {
      const updatedStore = await toggleStoreStatus(id);
      setStores(stores.map(store => 
        store.id === id ? updatedStore : store
      ));
    } catch (error) {
      console.error("Error toggling store status:", error);
      alert("Failed to toggle store status. Please try again.");
    }
  };

  // Delete store
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this store?")) return;
    
    try {
      await deleteStore(id);
      setStores(stores.filter(store => store.id !== id));
    } catch (error) {
      console.error("Error deleting store:", error);
      alert("Failed to delete store. Please try again.");
    }
  };

  // Open dialog for creating new store
  const handleAddStore = () => {
    setEditingStore(null);
    setDialogOpen(true);
  };

  // Open dialog for editing store
  const handleEditStore = (store: Store) => {
    setEditingStore(store);
    setDialogOpen(true);
  };

  // Save store (create or update)
  const handleSaveStore = async (data: CreateStoreDto) => {
    try {
      if (editingStore) {
        // Update existing store
        const updatedStore = await updateStore(editingStore.id, data);
        setStores(stores.map(store =>
          store.id === editingStore.id ? updatedStore : store
        ));
      } else {
        // Create new store
        const newStore = await createStore(data);
        setStores([...stores, newStore]);
      }
    } catch (error) {
      console.error("Error saving store:", error);
      alert(`Failed to ${editingStore ? 'update' : 'create'} store. Please try again.`);
      throw error; // Re-throw to prevent dialog from closing
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Store Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your restaurant locations and their information
          </p>
        </div>
        <Button className="bg-black hover:bg-black/90" onClick={handleAddStore}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Store
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Stores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stores.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all locations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Stores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stores.filter(s => s.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently operational
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Inactive Stores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-400">
              {stores.filter(s => !s.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Temporarily closed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search stores by name or address..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Store List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            Loading stores...
          </div>
        ) : filteredStores.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No stores found
          </div>
        ) : (
          filteredStores.map((store) => (
            <Card key={store.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{store.name}</CardTitle>
                    <Badge
                      variant={store.isActive ? 'default' : 'secondary'}
                      className={`mt-2 ${
                        store.isActive
                          ? 'bg-green-100 text-green-700 hover:bg-green-100'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {store.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditStore(store)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleStatus(store.id)}>
                        {store.isActive ? 'Deactivate' : 'Activate'}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDelete(store.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    <span className="text-gray-600">{store.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                    <span className="text-gray-600">{store.phone}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Store Dialog */}
      <StoreDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveStore}
        store={editingStore}
      />
    </div>
  );
}
