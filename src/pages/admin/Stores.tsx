import { useState, useEffect } from "react";
import { Plus, Search, MapPin, Phone, Edit, Store as StoreIcon, CheckCircle, XCircle, MoreVertical, Calendar } from "lucide-react";
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
  getAllStoresForStats,
  createStore,
  updateStore,
  toggleStoreStatus,
  deleteStore,
  getStoreCount,
  type Store, 
  type CreateStoreDto 
} from "@/services/storeService";
import { StoreDialog } from "@/components/admin/StoreDialog";

export default function Stores() {
  const [stores, setStores] = useState<Store[]>([]); // Current page stores
  const [allStores, setAllStores] = useState<Store[]>([]); // All stores for stats
  const [totalCount, setTotalCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(9); // 9 stores per page (3x3 grid)
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);

  // Fetch stores, all stores for stats, and total count
  const fetchStores = async () => {
    try {
      setIsLoading(true);
      const [data, allData, count] = await Promise.all([
        getAllStores(currentPage, pageSize), // Paginated data
        getAllStoresForStats(), // All stores for stats
        getStoreCount(), // Total count
      ]);
      setStores(data);
      setAllStores(allData);
      setTotalCount(count);
    } catch (error) {
      console.error("Error fetching stores:", error);
      alert("Failed to load stores. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [currentPage, pageSize]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchQuery, statusFilter]);

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
            <div className="text-2xl font-bold">{allStores.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All registered locations in database
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
              {allStores.filter(s => s.isActive).length}
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
              {allStores.filter(s => !s.isActive).length}
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
              {allStores.filter((s) => {
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

      {/* Pagination */}
      {!isLoading && filteredStores.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing page {currentPage} of {Math.ceil(totalCount / pageSize)} 
                <span className="ml-2">({totalCount} total stores)</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="border-gray-300"
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, Math.ceil(totalCount / pageSize)) }, (_, i) => {
                    const totalPages = Math.ceil(totalCount / pageSize);
                    let pageNum;
                    
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={currentPage === pageNum ? "bg-black text-white" : "border-gray-300"}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalCount / pageSize), prev + 1))}
                  disabled={currentPage >= Math.ceil(totalCount / pageSize)}
                  className="border-gray-300"
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
