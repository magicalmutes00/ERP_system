'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { feesApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, CreditCard, Banknote, Receipt, Search, Loader2 } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

type FeeStatus = 'PENDING' | 'PAID' | 'PARTIAL' | 'OVERDUE';

const STATUS_STYLES: Record<FeeStatus, { label: string; variant: 'success' | 'destructive' | 'warning' | 'secondary' }> = {
  PAID: { label: 'Paid', variant: 'success' },
  PENDING: { label: 'Pending', variant: 'warning' },
  PARTIAL: { label: 'Partial', variant: 'secondary' },
  OVERDUE: { label: 'Overdue', variant: 'destructive' },
};

export default function FeesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CARD');

  const { data: structuresData } = useQuery({
    queryKey: ['fee-structures'],
    queryFn: () => feesApi.getStructures(),
  });

  const { data: feesData, isLoading } = useQuery({
    queryKey: ['fees'],
    queryFn: () => feesApi.getMyFees(),
  });

  const payMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => feesApi.pay(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fees'] });
      toast.success('Payment processed successfully');
      setSelectedRecord(null);
      setPaymentAmount('');
    },
    onError: () => toast.error('Payment failed'),
  });

  const feeStructures = structuresData?.data?.data ?? structuresData?.data ?? [];
  const feeRecords = feesData?.data?.data ?? feesData?.data ?? [];

  const handlePay = (recordId: string) => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    payMutation.mutate({
      id: recordId,
      data: { amount: parseFloat(paymentAmount), method: paymentMethod },
    });
  };

  const filteredRecords = feeRecords.filter((r: any) =>
    !search || r.student?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
    r.student?.enrollmentNo?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fees Management</h1>
          <p className="text-muted-foreground">Manage fee structures and payments</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(feeRecords.reduce((sum: number, r: any) => sum + (r.paidAmount || 0), 0))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Receipt className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {feeRecords.filter((r: any) => r.status === 'PENDING' || r.status === 'OVERDUE').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <Banknote className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {feeRecords.filter((r: any) => r.status === 'OVERDUE').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Fee Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-muted-foreground">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Frequency</th>
                </tr>
              </thead>
              <tbody>
                {feeStructures.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-muted-foreground">No fee structures defined</td>
                  </tr>
                ) : (
                  feeStructures.map((structure: any) => (
                    <tr key={structure.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-3 font-medium">{structure.name}</td>
                      <td className="py-3">{formatCurrency(structure.amount)}</td>
                      <td className="py-3 text-sm">{structure.type}</td>
                      <td className="py-3 text-sm capitalize">{structure.frequency}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Student Fee Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by student name or enrollment..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No fee records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">Student</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Paid</th>
                    <th className="pb-3 font-medium">Due Date</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record: any) => {
                    const isSelected = selectedRecord === record.id;
                    return (
                      <tr key={record.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                              {record.student?.firstName?.[0]}{record.student?.lastName?.[0]}
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {record.student?.firstName} {record.student?.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground font-mono">
                                {record.student?.enrollmentNo}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 font-medium">{formatCurrency(record.amount)}</td>
                        <td className="py-3">{formatCurrency(record.paidAmount || 0)}</td>
                        <td className="py-3 text-sm">{formatDate(record.dueDate)}</td>
                        <td className="py-3">
                          <Badge variant={STATUS_STYLES[record.status as FeeStatus]?.variant}>
                            {STATUS_STYLES[record.status as FeeStatus]?.label || record.status}
                          </Badge>
                        </td>
                        <td className="py-3">
                          {record.status !== 'PAID' ? (
                            isSelected ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  placeholder="Amount"
                                  className="w-24 h-8 text-sm"
                                  value={paymentAmount}
                                  onChange={(e) => setPaymentAmount(e.target.value)}
                                />
                                <select
                                  className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                                  value={paymentMethod}
                                  onChange={(e) => setPaymentMethod(e.target.value)}
                                >
                                  <option value="CARD">Card</option>
                                  <option value="UPI">UPI</option>
                                  <option value="NET_BANKING">Net Banking</option>
                                  <option value="CASH">Cash</option>
                                </select>
                                <Button
                                  size="sm"
                                  className="h-8"
                                  onClick={() => handlePay(record.id)}
                                  disabled={payMutation.isPending}
                                >
                                  {payMutation.isPending ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <CreditCard className="h-3 w-3 mr-1" />
                                  )}
                                  Pay
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8"
                                  onClick={() => { setSelectedRecord(null); setPaymentAmount(''); }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedRecord(record.id)}
                              >
                                <CreditCard className="h-3 w-3 mr-1" />
                                Pay Now
                              </Button>
                            )
                          ) : (
                            <span className="text-sm text-green-600 font-medium">Completed</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
