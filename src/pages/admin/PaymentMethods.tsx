import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Plus, Pencil, Trash2, Search, CreditCard, CheckCircle, XCircle } from 'lucide-react';
import { paymentMethodService, type PaymentMethod } from '@/services/paymentMethodService';
import toast from 'react-hot-toast';

const PaymentMethods: React.FC = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]); // Current page
  const [allPaymentMethods, setAllPaymentMethods] = useState<PaymentMethod[]>([]); // All for stats
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: false,
  });

  // Fetch payment methods, all methods for stats, and total count
  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const [data, allData, count] = await Promise.all([
        paymentMethodService.getAll(currentPage, pageSize), // Paginated
        paymentMethodService.getAllForStats(), // All for stats
        paymentMethodService.getCount(), // Total count
      ]);
      setPaymentMethods(data);
      setAllPaymentMethods(allData);
      setTotalCount(count);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      toast.error('Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, [currentPage, pageSize]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchTerm, statusFilter]);

  // Filter payment methods
  const filteredMethods = paymentMethods.filter((method) => {
    const matchesSearch = method.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' ? true :
      statusFilter === 'ACTIVE' ? method.isActive :
      !method.isActive;
    
    return matchesSearch && matchesStatus;
  });

  // Stats calculated from ALL payment methods (not just current page)
  const stats = {
    total: allPaymentMethods.length,
    active: allPaymentMethods.filter(m => m.isActive).length,
    inactive: allPaymentMethods.filter(m => !m.isActive).length,
  };

  // Handle create/edit
  const handleSubmit = async () => {
    try {
      if (!formData.name.trim()) {
        toast.error('Payment method name is required');
        return;
      }

      if (!formData.description.trim()) {
        toast.error('Payment method description is required');
        return;
      }

      if (editingMethod) {
        // Update
        await paymentMethodService.update(editingMethod.id, {
          name: formData.name,
          description: formData.description,
          isActive: formData.isActive,
        });
        toast.success('Payment method updated successfully');
      } else {
        // Create
        await paymentMethodService.create({
          name: formData.name,
          description: formData.description,
          isActive: formData.isActive,
        });
        toast.success('Payment method created successfully');
      }

      fetchPaymentMethods();
      handleCloseDialog();
    } catch (error: any) {
      console.error('Error saving payment method:', error);
      const message = error.response?.data?.message || 'Failed to save payment method';
      toast.error(message);
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (method: PaymentMethod) => {
    try {
      await paymentMethodService.toggleStatus(method.id);
      toast.success(`Payment method ${method.isActive ? 'deactivated' : 'activated'} successfully`);
      fetchPaymentMethods();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Failed to toggle status');
    }
  };

  // Handle delete
  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      await paymentMethodService.delete(id);
      toast.success('Payment method deleted successfully');
      fetchPaymentMethods();
    } catch (error) {
      console.error('Error deleting payment method:', error);
      toast.error('Failed to delete payment method');
    }
  };

  // Handle edit
  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method);
    setFormData({
      name: method.name,
      description: method.description || '',
      isActive: method.isActive,
    });
    setDialogOpen(true);
  };

  // Handle create
  const handleCreate = () => {
    setEditingMethod(null);
    setFormData({
      name: '',
      description: '',
      isActive: false,
    });
    setDialogOpen(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingMethod(null);
    setFormData({
      name: '',
      description: '',
      isActive: false,
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 animate-card">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 text-gray-900">
            <CreditCard className="h-8 w-8 text-black" />
            <span>Payment Methods</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage payment options for customers
          </p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white">
          <Plus className="h-4 w-4" />
          <span>Add Payment Method</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 card-grid">
        <Card className="hover-lift animate-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
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

      {/* Search & Filters */}
      <Card className="animate-card-delayed">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search payment methods..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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

      {/* Payment Methods Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Payment Methods ({allPaymentMethods.length})</CardTitle>
          <div className="text-sm text-muted-foreground">
            Showing {paymentMethods.length} of {allPaymentMethods.length} payment methods (Page {currentPage})
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading payment methods...
            </div>
          ) : filteredMethods.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No payment methods found' : 'No payment methods yet. Create your first one!'}
            </div>
          ) : (
            <div className="overflow-hidden">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMethods.map((method) => (
                  <TableRow key={method.id}>
                    <TableCell className="font-medium">#{method.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center">
                          <CreditCard className="h-4 w-4 text-black" />
                        </div>
                        <span className="font-semibold">{method.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {method.description || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge className={`border transition-colors ${method.isActive ? 'bg-white text-black border-black hover:bg-black hover:text-white' : 'bg-white text-gray-700 border-black hover:bg-black hover:text-white'}`}>
                        {method.isActive ? (
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
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(method)}
                          className={`bg-white border-gray-300 transition-colors ${
                            method.isActive 
                              ? 'text-gray-900 hover:bg-red-500 hover:text-white hover:border-red-500' 
                              : 'text-gray-900 hover:bg-green-500 hover:text-white hover:border-green-500'
                          }`}
                        >
                          {method.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(method)}
                          className="bg-white text-gray-900 hover:bg-gray-800 hover:text-white border-gray-300 transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(method.id, method.name)}
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingMethod ? 'Edit Payment Method' : 'Create New Payment Method'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Method Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Cash, Credit Card, Bank Transfer"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                placeholder="Enter payment method description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="status">Active Status</Label>
                <p className="text-sm text-muted-foreground">
                  Enable this payment method for customers
                </p>
              </div>
              <Switch
                id="status"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog} className="border-gray-300">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-black hover:bg-gray-800 text-white">
              {editingMethod ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pagination */}
      {!loading && filteredMethods.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing page {currentPage} of {Math.ceil(totalCount / pageSize)} 
                <span className="ml-2">({totalCount} total payment methods)</span>
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
    </div>
  );
};

export default PaymentMethods;
