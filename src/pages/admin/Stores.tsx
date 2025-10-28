import { useState, useEffect } from "react";
import { Plus, Search, MapPin, Phone, Edit, Trash2, Store as StoreIcon, CheckCircle, XCircle, MoreVertical, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
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

  // Filter stores based on search and status
  const filteredStores = stores.filter((store) => {
    const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.phone.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "ALL" ? true :
      statusFilter === "ACTIVE" ? store.isActive :
      !store.isActive;
    
    return matchesSearch && matchesStatus;
  });

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
    <div className="flex flex-1 flex-col gap-6 p-6 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 animate-card">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 text-gray-900">
            <StoreIcon className="h-8 w-8 text-black" />
            <span>Store Management</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your restaurant locations and their information
          </p>
        </div>
        <Button className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white" onClick={handleAddStore}>
          <Plus className="h-4 w-4" />
          <span>Add New Store</span>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4 card-grid">
        <Card className="hover-lift animate-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stores</CardTitle>
            <StoreIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stores.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All registered locations
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift animate-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Stores</CardTitle>
            <CheckCircle className="h-4 w-4 text-black" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">
              {stores.filter(s => s.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently operating
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift animate-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Stores</CardTitle>
            <XCircle className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {stores.filter(s => !s.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Temporarily closed
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift animate-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Additions</CardTitle>
            <StoreIcon className="h-4 w-4 text-black" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">
              {stores.filter((s) => {
                const daysDiff = Math.floor(
                  (Date.now() - new Date(s.createAt).getTime()) / (1000 * 60 * 60 * 24)
                );
                return daysDiff <= 7;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              In the last 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card className="animate-card-delayed">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search stores by name, address, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active Only</SelectItem>
                <SelectItem value="INACTIVE">Inactive Only</SelectItem>
              </SelectContent>
            </Select>
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
            <Card key={store.id} className="hover:shadow-md">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{store.name}</CardTitle>
                    <Badge
                      variant={store.isActive ? 'default' : 'secondary'}
                      className={`mt-2 transition-colors ${
                        store.isActive
                          ? 'bg-white text-black border border-black hover:bg-black hover:text-white'
                          : 'bg-white text-gray-700 border border-black hover:bg-black hover:text-white'
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
