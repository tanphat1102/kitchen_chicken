import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Receipt, Eye, DollarSign, CreditCard, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { transactionService, type Transaction } from '@/services/transactionService';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await transactionService.getAll();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Filter transactions
  const filteredTransactions = transactions.filter((trans) => {
    const matchesSearch = trans.id.toString().includes(searchTerm) ||
      trans.note?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = 
      typeFilter === 'ALL' ? true :
      trans.transactionType === typeFilter;
    
    return matchesSearch && matchesType;
  });

  // Stats
  const stats = {
    total: transactions.length,
    totalAmount: transactions.reduce((sum, t) => sum + t.amount, 0),
    creditCount: transactions.filter(t => t.transactionType === 'CREDIT').length,
    debitCount: transactions.filter(t => t.transactionType === 'DEBIT').length,
    todayCount: transactions.filter(t => {
      if (!t.createAt) return false;
      const transDate = new Date(t.createAt);
      const today = new Date();
      return transDate.toDateString() === today.toDateString();
    }).length,
  };

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
    } catch {
      return dateString;
    }
  };

  const handleViewDetails = async (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDetailsOpen(true);
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 animate-card">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 text-gray-900">
            <Receipt className="h-8 w-8 text-black" />
            <span>Transactions</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            View and manage all financial transactions
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 card-grid">
        <Card className="hover-lift animate-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card className="hover-lift animate-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credit (Income)</CardTitle>
            <TrendingUp className="h-4 w-4 text-black" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{stats.creditCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Money received</p>
          </CardContent>
        </Card>

        <Card className="hover-lift animate-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Debit (Expense)</CardTitle>
            <TrendingDown className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.debitCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Money sent</p>
          </CardContent>
        </Card>

        <Card className="hover-lift animate-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-black" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{formatVND(stats.totalAmount)}</div>
            <p className="text-xs text-muted-foreground mt-1">All transactions</p>
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
                placeholder="Search by ID or note..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="CREDIT">Credit (Income)</SelectItem>
                <SelectItem value="DEBIT">Debit (Expense)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Transactions ({filteredTransactions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading transactions...
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No transactions found' : 'No transactions yet'}
            </div>
          ) : (
            <div className="overflow-hidden">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">#{transaction.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {formatDate(transaction.createAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-black" />
                        <span className="font-bold text-black">
                          {formatVND(transaction.amount)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-black" />
                        <Badge variant="outline">
                          {transaction.paymentMethodId ? `Payment #${transaction.paymentMethodId}` : 'N/A'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={`transition-colors ${transaction.transactionType === 'CREDIT' 
                          ? 'bg-white text-black border border-black hover:bg-black hover:text-white' 
                          : 'bg-white text-gray-700 border border-black hover:bg-black hover:text-white'
                        }`}
                      >
                        {transaction.transactionType === 'CREDIT' ? (
                          <>
                            <TrendingUp className="h-3 w-3 mr-1" />
                            CREDIT
                          </>
                        ) : (
                          <>
                            <TrendingDown className="h-3 w-3 mr-1" />
                            DEBIT
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                      {transaction.note || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(transaction)}
                        className="bg-white text-gray-900 hover:bg-gray-800 hover:text-white border-gray-300 transition-colors"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900">
              <Receipt className="h-5 w-5 text-black" />
              Transaction Details - #{selectedTransaction?.id}
            </DialogTitle>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Transaction ID</p>
                  <p className="text-lg font-bold">#{selectedTransaction.id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Amount</p>
                  <p className="text-lg font-bold text-black">{formatVND(selectedTransaction.amount)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Payment Method ID</p>
                  <Badge variant="outline" className="text-sm">
                    {selectedTransaction.paymentMethodId ? `#${selectedTransaction.paymentMethodId}` : 'N/A'}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Transaction Date</p>
                  <p className="text-sm">{formatDate(selectedTransaction.createAt)}</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Transaction Type</p>
                <Badge 
                  className={selectedTransaction.transactionType === 'CREDIT' 
                    ? 'bg-black text-white border-black' 
                    : 'bg-gray-200 text-gray-700 border-gray-400'
                  }
                >
                  {selectedTransaction.transactionType === 'CREDIT' ? (
                    <>
                      <TrendingUp className="h-3 w-3 mr-1" />
                      CREDIT (Income)
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-3 w-3 mr-1" />
                      DEBIT (Expense)
                    </>
                  )}
                </Badge>
              </div>

              {selectedTransaction.paymentId && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Payment ID</p>
                  <p className="text-sm">#{selectedTransaction.paymentId}</p>
                </div>
              )}

              {selectedTransaction.note && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Note</p>
                  <p className="text-sm bg-gray-50 p-3 rounded-lg border">
                    {selectedTransaction.note}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Transactions;
