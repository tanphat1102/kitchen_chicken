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
import { Plus, Pencil, Trash2, Search, TrendingUp, CheckCircle, XCircle, Percent, DollarSign, Calendar } from 'lucide-react';
import { promotionService, type Promotion, type DiscountType } from '@/services/promotionService';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const Promotions: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    code: '', // Promotion code for customers
    discountType: 'PERCENT' as DiscountType,
    discountValue: '',
    startDate: '',
    endDate: '',
    quantity: '', // Changed from quantityLimit to match backend
  });

  // Fetch promotions
  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const data = await promotionService.getAll();
      setPromotions(data);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      toast.error('Failed to load promotions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  // Filter promotions
  const filteredPromotions = promotions.filter((promo) => {
    const matchesSearch = promo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         promo.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && promo.isActive) ||
                         (filterStatus === 'inactive' && !promo.isActive);
    const matchesType = filterType === 'all' || promo.discountType === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Stats
  const stats = {
    total: promotions.length,
    active: promotions.filter(p => p.isActive).length,
    inactive: promotions.filter(p => !p.isActive).length,
    totalUsage: promotions.reduce((sum, p) => sum + (p.usedCount || 0), 0),
  };

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch {
      return dateString;
    }
  };

  const formatDiscount = (promo: Promotion) => {
    if (promo.discountType === 'PERCENT') {
      return `${promo.discountValue}%`;
    } else {
      return formatVND(promo.discountValue);
    }
  };

  // Check if promotion is currently valid
  const isPromotionValid = (promo: Promotion) => {
    const now = new Date();
    const start = new Date(promo.startDate);
    const end = new Date(promo.endDate);
    return promo.isActive && now >= start && now <= end;
  };

  // Check if promotion is expired
  const isPromotionExpired = (promo: Promotion) => {
    const now = new Date();
    const end = new Date(promo.endDate);
    return now > end;
  };

  // Handle create/edit
  const handleSubmit = async () => {
    try {
      if (!formData.name.trim()) {
        toast.error('Promotion name is required');
        return;
      }
      if (!formData.discountValue || parseFloat(formData.discountValue) <= 0) {
        toast.error('Valid discount value is required');
        return;
      }
      if (formData.discountType === 'PERCENT' && parseFloat(formData.discountValue) > 100) {
        toast.error('Percentage discount cannot exceed 100%');
        return;
      }
      if (!formData.startDate || !formData.endDate) {
        toast.error('Start date and end date are required');
        return;
      }
      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        toast.error('End date must be after start date');
        return;
      }

      const submitData = {
        name: formData.name,
        description: formData.description || undefined,
        code: formData.code || undefined,
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        startDate: formData.startDate, // Backend will parse LocalDateTime
        endDate: formData.endDate, // Backend will parse LocalDateTime
        quantity: formData.quantity ? parseInt(formData.quantity) : 0,
      };

      if (editingPromotion) {
        // Update
        await promotionService.update(editingPromotion.id, submitData);
        toast.success('Promotion updated successfully');
      } else {
        // Create
        await promotionService.create(submitData);
        toast.success('Promotion created successfully');
      }

      fetchPromotions();
      handleCloseDialog();
    } catch (error: any) {
      console.error('Error saving promotion:', error);
      const message = error.response?.data?.message || 'Failed to save promotion';
      toast.error(message);
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (promo: Promotion) => {
    try {
      await promotionService.toggleStatus(promo.id);
      toast.success(`Promotion ${promo.isActive ? 'deactivated' : 'activated'} successfully`);
      fetchPromotions();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Failed to toggle status');
    }
  };

  // Handle delete
  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete promotion "${name}"?`)) {
      return;
    }

    try {
      await promotionService.delete(id);
      toast.success('Promotion deleted successfully');
      fetchPromotions();
    } catch (error) {
      console.error('Error deleting promotion:', error);
      toast.error('Failed to delete promotion');
    }
  };

  // Handle edit
  const handleEdit = (promo: Promotion) => {
    setEditingPromotion(promo);
    setFormData({
      name: promo.name,
      description: promo.description || '',
      code: promo.code || '',
      discountType: promo.discountType,
      discountValue: promo.discountValue.toString(),
      startDate: promo.startDate,
      endDate: promo.endDate,
      quantity: promo.quantity?.toString() || '',
    });
    setDialogOpen(true);
  };

  // Handle create
  const handleCreate = () => {
    setEditingPromotion(null);
    setFormData({
      name: '',
      description: '',
      code: '',
      discountType: 'PERCENT',
      discountValue: '',
      startDate: '',
      endDate: '',
      quantity: '',
    });
    setDialogOpen(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingPromotion(null);
    setFormData({
      name: '',
      description: '',
      code: '',
      discountType: 'PERCENT',
      discountValue: '',
      startDate: '',
      endDate: '',
      quantity: '',
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-6 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 text-gray-900">
            <TrendingUp className="h-8 w-8 text-black" />
            <span>Promotions</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Create and manage promotional campaigns
          </p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white">
          <Plus className="h-4 w-4" />
          <span>Create Promotion</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Promotions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-gray-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Inactive</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalUsage}</div>
            <p className="text-xs text-muted-foreground mt-1">Times used</p>
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
                placeholder="Search promotions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="PERCENT">Percentage</SelectItem>
                <SelectItem value="AMOUNT">Fixed Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Promotions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Promotions ({filteredPromotions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading promotions...
            </div>
          ) : filteredPromotions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || filterStatus !== 'all' || filterType !== 'all' 
                ? 'No promotions found' 
                : 'No promotions yet. Create your first one!'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPromotions.map((promo) => (
                  <TableRow key={promo.id}>
                    <TableCell>
                      <div>
                        <p className="font-semibold">{promo.name}</p>
                        {promo.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {promo.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {promo.discountType === 'PERCENT' ? (
                          <Percent className="h-4 w-4 text-green-600" />
                        ) : (
                          <DollarSign className="h-4 w-4 text-green-600" />
                        )}
                        <span className="font-bold text-green-600 text-lg">
                          {formatDiscount(promo)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <div>
                          <p>{formatDate(promo.startDate)} - {formatDate(promo.endDate)}</p>
                          {isPromotionExpired(promo) && (
                            <Badge variant="outline" className="text-xs mt-1 text-red-600">
                              Expired
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">{promo.usedCount || 0} used</p>
                        {(promo.quantityLimit || promo.quantity) && (
                          <p className="text-muted-foreground">
                            / {promo.quantityLimit || promo.quantity} limit
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {isPromotionValid(promo) ? (
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active & Valid
                        </Badge>
                      ) : promo.isActive ? (
                        <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-700 border-gray-200">
                          <XCircle className="h-3 w-3 mr-1" />
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(promo)}
                          className={promo.isActive 
                            ? 'text-gray-900 border-gray-900 hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors' 
                            : 'text-gray-900 border-gray-900 hover:bg-green-500 hover:text-white hover:border-green-500 transition-colors'}
                        >
                          {promo.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(promo)}
                          className="text-gray-900 border-gray-900 hover:bg-gray-800 hover:text-white transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(promo.id, promo.name)}
                          className="text-gray-900 border-gray-900 hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors"
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
              {editingPromotion ? 'Edit Promotion' : 'Create New Promotion'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Promotion Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Summer Sale, Black Friday Deal"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the promotion..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Promotion Code (Optional)</Label>
              <Input
                id="code"
                placeholder="e.g., SUMMER2025, BLACKFRIDAY"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              />
              <p className="text-xs text-muted-foreground">
                Unique code that customers can use to apply this promotion
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discountType">Discount Type *</Label>
                <Select 
                  value={formData.discountType} 
                  onValueChange={(value: DiscountType) => setFormData({ ...formData, discountType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENT">Percentage (%)</SelectItem>
                    <SelectItem value="AMOUNT">Fixed Amount (VND)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountValue">
                  Discount Value * {formData.discountType === 'PERCENT' ? '(%)' : '(VND)'}
                </Label>
                <Input
                  id="discountValue"
                  type="number"
                  step={formData.discountType === 'PERCENT' ? '1' : '1000'}
                  placeholder={formData.discountType === 'PERCENT' ? '10' : '50000'}
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity Limit (Optional)</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="Leave empty for unlimited"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Maximum number of times this promotion can be used
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
              {editingPromotion ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Promotions;
