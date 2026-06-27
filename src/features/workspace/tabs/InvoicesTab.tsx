import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { VmsEvent } from "@/types/event";
import { Invoice } from "@/types/finance";
import { useAuthStore } from "@/store/authStore";
import { financeRepository } from "@/features/finance/repositories/financeRepository";
import { isEventClosed } from "@/lib/eventLocking";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FileText, PlusCircle, AlertTriangle, Building, Calculator, TrendingUp } from "lucide-react";

export function InvoicesTab() {
  const { event } = useOutletContext<{ event: VmsEvent }>();
  const { user } = useAuthStore();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    invoice_number: '', invoice_date: '', invoice_amount: ''
  });

  const closed = isEventClosed(event.lifecycle_status);
  const canManage = (user?.role === 'ADMIN') && !closed;

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await financeRepository.getInvoicesByEvent(event.id);
      setInvoices(data);
      setLoading(false);
    }
    load();
  }, [event.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !canManage) return;
    
    if (event.lifecycle_status !== 'ROOMING_FINALIZED' && event.lifecycle_status !== 'INVOICE_PENDING' && event.lifecycle_status !== 'INVOICE_AUDIT') {
      alert("Event must have finalized rooming before uploading an invoice.");
      return;
    }

    await financeRepository.createInvoice({
      event_id: event.id,
      invoice_number: formData.invoice_number,
      invoice_date: formData.invoice_date,
      invoice_amount: parseFloat(formData.invoice_amount),
      invoice_status: 'Submitted'
    }, user.id, event.lifecycle_status);

    setFormData({ invoice_number: '', invoice_date: '', invoice_amount: '' });
    
    const data = await financeRepository.getInvoicesByEvent(event.id);
    setInvoices(data);
  };

  const totalInvoiceAmount = invoices.reduce((sum, inv) => sum + Number(inv.invoice_amount), 0);

  if (loading) return <div className="p-8 font-medium text-vms-primary animate-pulse">Loading financial records...</div>;

  return (
    <div className="animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b border-vms-gray-100 pb-6">
        <div>
          <h2 className="text-3xl font-black text-vms-primary-dark tracking-tight">Financial Records</h2>
          <p className="text-vms-gray-600 mt-1">Manage vendor invoices and prepare for compliance audit.</p>
        </div>
      </div>

      {(event.lifecycle_status === 'APPROVED' || event.lifecycle_status === 'BOOKED' || event.lifecycle_status === 'ROOMING_PENDING') && (
        <Card className="border-0 shadow-sm border-t-4 border-t-vms-warning bg-vms-warning-bg/20 mb-8">
          <CardContent className="p-6 flex items-start text-left">
            <AlertTriangle className="w-8 h-8 text-vms-warning mr-4 mt-1 flex-shrink-0" />
            <div>
              <h2 className="text-lg font-bold text-vms-primary-dark mb-1">Rooming Incomplete</h2>
              <p className="text-vms-gray-600 text-sm">
                Financials cannot be processed until the operational rooming list has been locked and finalized by the executive team.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Finance Overview Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-0 shadow-sm ring-1 ring-vms-gray-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-black text-vms-gray-400 uppercase tracking-widest">Total Invoiced</span>
              <div className="bg-vms-primary/10 p-2 rounded-lg"><Calculator className="w-4 h-4 text-vms-primary" /></div>
            </div>
            <p className="text-4xl font-black text-vms-primary-dark">
              ${totalInvoiceAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </p>
            <p className="text-xs font-bold text-vms-gray-500 mt-2">Across {invoices.length} submitted documents</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm ring-1 ring-vms-gray-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-black text-vms-gray-400 uppercase tracking-widest">Est. Variance</span>
              <div className="bg-vms-accent/10 p-2 rounded-lg"><TrendingUp className="w-4 h-4 text-vms-accent-dark" /></div>
            </div>
            <p className="text-4xl font-black text-vms-gray-400">
              ---
            </p>
            <p className="text-xs font-bold text-vms-gray-500 mt-2">Requires approved PO baseline</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm ring-1 ring-vms-gray-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-black text-vms-gray-400 uppercase tracking-widest">Primary Vendor</span>
              <div className="bg-vms-success/10 p-2 rounded-lg"><Building className="w-4 h-4 text-vms-success" /></div>
            </div>
            <p className="text-xl font-black text-vms-primary-dark truncate leading-tight mt-1">
              {(event as any).hotel_name || 'Venue Partner'}
            </p>
            <p className="text-xs font-bold text-vms-gray-500 mt-3">Active Contract</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Invoice List */}
        <div className={`lg:col-span-${canManage ? '2' : '3'}`}>
          <Card className="border-0 shadow-md ring-1 ring-vms-gray-200 overflow-hidden h-full">
            <CardHeader className="bg-vms-gray-50 border-b border-vms-gray-100 py-4 flex justify-between items-center">
              <h3 className="font-bold text-vms-primary-dark flex items-center">
                <FileText className="w-4 h-4 mr-2" /> Invoice Ledger
              </h3>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white border-b border-vms-gray-100">
                  <tr>
                    <th className="p-4 font-bold text-vms-gray-500 uppercase tracking-wider text-xs">Inv Number</th>
                    <th className="p-4 font-bold text-vms-gray-500 uppercase tracking-wider text-xs">Date</th>
                    <th className="p-4 font-bold text-vms-gray-500 uppercase tracking-wider text-xs text-right">Amount</th>
                    <th className="p-4 font-bold text-vms-gray-500 uppercase tracking-wider text-xs text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-vms-gray-50">
                  {invoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-vms-gray-50 transition-colors bg-white">
                      <td className="p-4 font-black text-vms-primary-dark">{inv.invoice_number}</td>
                      <td className="p-4 text-vms-gray-600 font-medium">{new Date(inv.invoice_date).toLocaleDateString()}</td>
                      <td className="p-4 font-black text-vms-primary-dark text-right">${inv.invoice_amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      <td className="p-4 text-center">
                        <Badge variant="info" className="uppercase px-2 shadow-sm text-[10px] tracking-wider">{inv.invoice_status}</Badge>
                      </td>
                    </tr>
                  ))}
                  {invoices.length === 0 && (
                    <tr><td colSpan={4} className="p-10 text-center text-vms-gray-400 font-medium bg-white">No invoices logged for this event.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Upload Form */}
        {canManage && event.lifecycle_status !== 'DRAFT' && (
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-md ring-1 ring-vms-gray-200 sticky top-4">
              <CardHeader className="bg-vms-primary-dark text-white rounded-t-xl py-4">
                <h3 className="font-bold flex items-center">
                  <PlusCircle className="w-4 h-4 mr-2" /> Log New Invoice
                </h3>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-vms-gray-500 mb-1">Invoice Number <span className="text-vms-danger">*</span></label>
                    <input required className="w-full border-vms-gray-200 rounded-md focus:ring-vms-primary text-sm shadow-sm font-mono" value={formData.invoice_number} onChange={e => setFormData({...formData, invoice_number: e.target.value})} placeholder="INV-2024-XXXX" />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-vms-gray-500 mb-1">Issue Date <span className="text-vms-danger">*</span></label>
                    <input required type="date" className="w-full border-vms-gray-200 rounded-md focus:ring-vms-primary text-sm shadow-sm" value={formData.invoice_date} onChange={e => setFormData({...formData, invoice_date: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-vms-gray-500 mb-1">Total Amount ($) <span className="text-vms-danger">*</span></label>
                    <input required type="number" step="0.01" min="0" className="w-full border-vms-gray-200 rounded-md focus:ring-vms-primary text-sm shadow-sm font-black text-vms-primary-dark" value={formData.invoice_amount} onChange={e => setFormData({...formData, invoice_amount: e.target.value})} placeholder="0.00" />
                  </div>
                  <div className="pt-4 mt-2 border-t border-vms-gray-100">
                    <Button type="submit" className="w-full shadow-md text-base py-6">
                      <PlusCircle className="w-4 h-4 mr-2" /> Log Invoice
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}
