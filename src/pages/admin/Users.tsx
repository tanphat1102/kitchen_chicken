import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Plus, Pencil, Users as UsersIcon, Mail, Shield, CheckCircle, XCircle, Calendar, Image } from 'lucide-react';
import { userService } from '@/services/userService';
import type { User } from '@/types/api.types';
import toast from 'react-hot-toast';

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]); // Current page users
  const [allUsers, setAllUsers] = useState<User[]>([]); // All users for stats
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    displayName: '',
    role: 'USER' as 'USER' | 'EMPLOYEE' | 'MANAGER' | 'ADMIN' | 'STORE',
    isActive: true,
    birthday: '',
    imageURL: '',
    // Note: phone and address removed - backend doesn't support these fields yet
  });

  // Fetch users, all users for stats, and total count
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [data, allData, count] = await Promise.all([
        userService.getAll(currentPage, pageSize), // Paginated data
        userService.getAllForStats(), // All users for stats
        userService.getCount(), // Total count
      ]);
      setUsers(data);
      setAllUsers(allData);
      setTotalCount(count);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, pageSize]);

  // Stats calculated from ALL users (not just current page)
  const stats = {
    total: allUsers.length,
    active: allUsers.filter(u => u.isActive).length,
    admins: allUsers.filter(u => u.role === 'ADMIN').length,
    managers: allUsers.filter(u => u.role === 'MANAGER').length,
    employees: allUsers.filter(u => u.role === 'EMPLOYEE').length,
    customers: allUsers.filter(u => u.role === 'USER').length,
  };

  // Handle create/edit
  const handleSubmit = async () => {
    try {
      if (!formData.email.trim()) {
        toast.error('Email is required');
        return;
      }
      
      if (!formData.displayName.trim()) {
        toast.error('Full name is required');
        return;
      }

      if (editingUser) {
        // Update existing user - match UpdateUserRequest
        await userService.update(editingUser.id, {
          displayName: formData.displayName,
          role: formData.role,
          isActive: formData.isActive,
          birthday: formData.birthday || null,
          imageURL: formData.imageURL || null,
        });
        toast.success('User updated successfully');
      } else {
        // Create new user - match CreateUserRequest
        await userService.create({
          email: formData.email,
          displayName: formData.displayName,
          role: formData.role,
          isActive: formData.isActive,
          birthday: formData.birthday || null,
          imageURL: formData.imageURL || null,
        });
        toast.success('User created successfully');
      }

      fetchUsers();
      handleCloseDialog();
    } catch (error: any) {
      console.error('Error saving user:', error);
      const message = error.response?.data?.message || 'Failed to save user';
      toast.error(message);
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (user: User) => {
    try {
      await userService.toggleStatus(user.id);
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`);
      fetchUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Failed to toggle user status');
    }
  };

  // Handle edit
  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      displayName: user.displayName || '',
      role: user.role,
      isActive: user.isActive,
      birthday: '',
      imageURL: user.avatar || '',
    });
    setDialogOpen(true);
  };

  // Handle create
  const handleCreate = () => {
    setEditingUser(null);
    setFormData({
      email: '',
      displayName: '',
      role: 'USER',
      isActive: true,
      birthday: '',
      imageURL: '',
    });
    setDialogOpen(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingUser(null);
    setFormData({
      email: '',
      displayName: '',
      role: 'USER',
      isActive: true,
      birthday: '',
      imageURL: '',
    });
  };

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-white text-black border-black hover:bg-black hover:text-white hover:border-black transition-colors';
      case 'MANAGER': return 'bg-white text-black border-black hover:bg-black hover:text-white hover:border-black transition-colors';
      case 'EMPLOYEE': return 'bg-white text-black border-black hover:bg-black hover:text-white hover:border-black transition-colors';
      case 'STORE': return 'bg-white text-black border-black hover:bg-black hover:text-white hover:border-black transition-colors';
      default: return 'bg-white text-gray-700 border-black hover:bg-black hover:text-white hover:border-black transition-colors';
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 animate-card">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 text-gray-900">
            <UsersIcon className="h-8 w-8 text-black" />
            <span>User Management</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage system users, roles, and permissions
          </p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white">
          <Plus className="h-4 w-4" />
          <span>Add User</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6 card-grid">
        <Card className="hover-lift animate-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
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
            <CardTitle className="text-sm font-medium text-gray-600">Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{stats.admins}</div>
          </CardContent>
        </Card>

        <Card className="hover-lift animate-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Managers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{stats.managers}</div>
          </CardContent>
        </Card>

        <Card className="hover-lift animate-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{stats.employees}</div>
          </CardContent>
        </Card>

        <Card className="hover-lift animate-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.customers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters - REMOVED: Backend doesn't support filtering yet */}
      {/* TODO: Re-enable when backend adds filter support (role, status, search) */}

      {/* Users Table */}
      <Card className="bg-white border-gray-200">
        <CardHeader className="border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl text-gray-900">All Users ({allUsers.length})</CardTitle>
            <div className="text-sm text-gray-600">
              Showing {users.length} of {allUsers.length} users (Page {currentPage})
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
              <p className="text-gray-600">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">No users yet</p>
              <p className="text-sm text-gray-600 mb-4">Get started by creating your first user</p>
              <Button onClick={handleCreate} className="bg-black text-white hover:bg-gray-800">
                <Plus className="h-4 w-4 mr-2" />
                Create First User
              </Button>
            </div>
          ) : (
            <div className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50 border-gray-200">
                    <TableHead className="font-semibold text-gray-700">User</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-center">Role</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-center">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className="hover:bg-gray-50 border-gray-200" style={{ overflow: 'hidden' }}>
                      <TableCell className="text-gray-900">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.displayName || user.email} className="h-10 w-10 rounded-full object-cover" />
                            ) : (
                              <span className="text-white font-semibold text-sm">
                                {(user.displayName || user.email).substring(0, 2).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900 truncate">
                              {user.displayName || 'No name'}
                            </div>
                            <div className="text-sm text-gray-600 flex items-center gap-1 truncate">
                              <Mail className="h-3 w-3 flex-shrink-0" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <Badge className={`border ${getRoleBadgeColor(user.role)}`}>
                            <Shield className="h-3 w-3 mr-1" />
                            {user.role}
                          </Badge>
                        </div>
                      </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <Badge className={`border transition-colors ${user.isActive ? 'bg-white text-black border-black hover:bg-black hover:text-white' : 'bg-white text-gray-700 border-black hover:bg-black hover:text-white'}`}>
                          {user.isActive ? (
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
                            onClick={() => handleToggleStatus(user)}
                            className={`!bg-white !border-gray-300 transition-colors ${
                              user.isActive 
                                ? '!text-gray-900 hover:!bg-red-500 hover:!text-white hover:!border-red-500' 
                                : '!text-gray-900 hover:!bg-green-400 hover:!text-black hover:!border-green-400'
                            }`}
                          >
                            {user.isActive ? (
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
                            onClick={() => handleEdit(user)}
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
      </Card>

      {/* Pagination */}
      {!loading && users.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing page {currentPage} of {Math.ceil(totalCount / pageSize)} 
                <span className="ml-2">({totalCount} total users)</span>
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

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-gray-200 text-gray-900">
          <DialogHeader className="border-b border-gray-200">
            <DialogTitle className="text-2xl text-gray-900">
              {editingUser ? 'Edit User' : 'Create New User'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Create Mode - Basic Info */}
            {!editingUser && (
              <>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                    <div className="h-8 w-1 bg-black rounded"></div>
                    <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-300">
                        Email Address <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="user@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="displayName" className="text-gray-700">
                        Full Name <span className="text-black">*</span>
                      </Label>
                      <Input
                        id="displayName"
                        placeholder="John Doe"
                        value={formData.displayName}
                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                        className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="role">
                        Role <span className="text-red-500">*</span>
                      </Label>
                      <Select 
                        value={formData.role} 
                        onValueChange={(value: any) => setFormData({ ...formData, role: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USER">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-black"></div>
                              Customer
                            </div>
                          </SelectItem>
                          <SelectItem value="EMPLOYEE">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-black"></div>
                              Employee
                            </div>
                          </SelectItem>
                          <SelectItem value="STORE">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-black"></div>
                              Store Manager
                            </div>
                          </SelectItem>
                          <SelectItem value="MANAGER">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-black"></div>
                              Manager
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Admin role can only be granted through system configuration
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="isActive" className="flex items-center gap-2">
                        Status
                      </Label>
                      <Select 
                        value={formData.isActive ? 'true' : 'false'} 
                        onValueChange={(value) => setFormData({ ...formData, isActive: value === 'true' })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-black" />
                              Active
                            </div>
                          </SelectItem>
                          <SelectItem value="false">
                            <div className="flex items-center gap-2">
                              <XCircle className="h-4 w-4 text-gray-600" />
                              Inactive
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200 mt-6">
                    <div className="h-8 w-1 bg-black rounded"></div>
                    <h3 className="text-lg font-semibold text-gray-900">Additional Information (Optional)</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="birthday" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Birthday
                      </Label>
                      <Input
                        id="birthday"
                        type="date"
                        value={formData.birthday}
                        onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="imageURL" className="flex items-center gap-2">
                        <Image className="h-4 w-4" />
                        Profile Image URL
                      </Label>
                      <Input
                        id="imageURL"
                        type="url"
                        placeholder="https://example.com/avatar.jpg"
                        value={formData.imageURL}
                        onChange={(e) => setFormData({ ...formData, imageURL: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex gap-3">
                      <div className="text-blue-600 mt-0.5">ℹ️</div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-blue-900">Note about user creation:</p>
                        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                          <li>Required fields: Email, Full Name, Role</li>
                          <li>User will receive an email to set up their password</li>
                          <li>Birthday and Image URL are optional</li>
                        </ul>
                      </div>
                    </div>
                  </div> */}
                </div>
              </>
            )}

            {/* Edit Mode - Full Info */}
            {editingUser && (
              <>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                    <div className="h-8 w-1 bg-black rounded"></div>
                    <h3 className="text-lg font-semibold text-gray-900">User Information</h3>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email-view">Email Address</Label>
                    <Input
                      id="email-view"
                      type="email"
                      value={formData.email}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                    <div className="h-8 w-1 bg-black rounded"></div>
                    <h3 className="text-lg font-semibold text-gray-900">Editable Details</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="displayName-edit">
                        Full Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="displayName-edit"
                        placeholder="John Doe"
                        value={formData.displayName}
                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role-edit">Role</Label>
                      <Select 
                        value={formData.role} 
                        onValueChange={(value: any) => setFormData({ ...formData, role: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USER">Customer</SelectItem>
                          <SelectItem value="EMPLOYEE">Employee</SelectItem>
                          <SelectItem value="STORE">Store Manager</SelectItem>
                          <SelectItem value="MANAGER">Manager</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="isActive-edit">Status</Label>
                      <Select 
                        value={formData.isActive ? 'true' : 'false'} 
                        onValueChange={(value) => setFormData({ ...formData, isActive: value === 'true' })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-black" />
                              Active
                            </div>
                          </SelectItem>
                          <SelectItem value="false">
                            <div className="flex items-center gap-2">
                              <XCircle className="h-4 w-4 text-gray-600" />
                              Inactive
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="birthday-edit" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Birthday
                      </Label>
                      <Input
                        id="birthday-edit"
                        type="date"
                        value={formData.birthday}
                        onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="imageURL-edit" className="flex items-center gap-2">
                      <Image className="h-4 w-4" />
                      Profile Image URL
                    </Label>
                    <Input
                      id="imageURL-edit"
                      type="url"
                      placeholder="https://example.com/avatar.jpg"
                      value={formData.imageURL}
                      onChange={(e) => setFormData({ ...formData, imageURL: e.target.value })}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleCloseDialog} className="border-gray-300">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-black hover:bg-gray-800 text-white">
              {editingUser ? 'Update User' : 'Create User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;
