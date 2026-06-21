import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { VmsEvent } from "@/types/event";
import { SapClosure, SapPaymentStatus } from "@/types/sap";
import { useAuthStore } from "@/store/authStore";
import { sapRepository } from "@/features/sap/repositories/sapRepository";
import { financeRepository } from "@/features/finance/repositories/financeRepository";
import { isEventClosed } from "@/lib/eventLocking";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Briefcase, AlertTriangle, CloudUpload, Activity, CreditCard, Lock, ArrowRightCircle, AlertCircle, Send } from "lucide-react";

export function SAPClosureTab() {
  const { event } = useOutletContext<{ event: VmsEvent }>();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [sapClosure, setSapClosure] = useState<SapClosure | null>(null);
  
  const [formData, setFormData] = useState({
    sap_reference: '', upload_date: new Date().toISOString().split('T')[0]
  });

  const canManage = user?.role?.role_name === 'FINANCE' || user?.role?.role_name === 'VMS_ADMIN';
  const closed = isEventClosed(event.lifecycle_status);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setErrorMsg("");
      try {
        const closure = await sapRepository.getSapClosureByEvent(event.id);
        if (closure) {
          setSapClosure(closure);
        } else if (event.lifecycle_status !== 'INVOICE_AUDIT' && event.lifecycle_status !== 'PAYMENT_PENDING' && !closed) {
          setErrorMsg("Event financials must pass compliance audit before SAP Upload can be initiated.");
        }
      } catch (err: any) {
        setErrorMsg("Failed to load SAP integration data.");
      }
      setLoading(false);
    }
    load();
  }, [event]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !canManage) return;

    try {
      const invoices = await financeRepository.getInvoicesByEvent(event.id);
      if (invoices.length === 0) throw new Error("No invoice found.");

      const newClosure = await sapRepository.createSapClosure({
        event_id: event.id,
        invoice_id: invoices[0].id,
        sap_reference: formData.sap_reference,
        upload_date: formData.upload_date,
        payment_status: 'PENDING',
        closure_status: 'OPEN'
      }, user.id, event.lifecycle_status);

      setSapClosure(newClosure);
      window.location.reload(); 
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create SAP upload.");
    }
  };

  const handlePaymentUpdate = async (newStatus: SapPaymentStatus) => {
    if (!user || !canManage || !sapClosure) return;

    if (
      (sapClosure.payment_status === 'PAID') ||
      (sapClosure.payment_status === 'PROCESSED' && newStatus === 'PENDING')
    ) {
      alert("Invalid payment status transition. Cannot reverse payments.");
      return;
    }

    try {
      await sapRepository.updatePaymentStatus(sapClosure.id, event.id, newStatus, user.id, event.lifecycle_status);
      setSapClosure({ ...sapClosure, payment_status: newStatus });
      window.location.reload();
    } catch (err: any) {
      alert("Failed to update payment status.");
    }
  };

  const handleCloseEvent = async () => {
    if (!user || !canManage || !sapClosure) return;
    
    if (sapClosure.payment_status !== 'PAID') {
      alert("Event can only be closed when payment status is PAID.");
      return;
    }

    const confirmClose = window.confirm("CRITICAL WARNING: Executing closure will permanently lock all records across the workspace. This action cannot be reversed. Proceed?");
    if (!confirmClose) return;

    try {
      await sapRepository.closeEvent(event.id, sapClosure.id, user.id, event.lifecycle_status);
      window.location.reload();
    } catch (err: any) {
      alert("Failed to close event.");
    }
  };

  if (loading) return <div className="p-8 font-medium text-vms-primary animate-pulse">Establishing SAP connection...</div>;

  return (
    <div className="animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b border-vms-gray-100 pb-6">
        <div>
          <h2 className="text-3xl font-black text-vms-primary-dark tracking-tight">SAP Integration & Closure</h2>
          <p className="text-vms-gray-600 mt-1">Manage corporate ERP synchronization and finalize event lifecycle.</p>
        </div>
        {sapClosure?.payment_status === 'PAID' && sapClosure.closure_status === 'OPEN' && canManage && (
          <Button 
            onClick={handleCloseEvent}
            className="bg-vms-danger hover:bg-red-700 text-white shadow-md text-base px-6 py-6 ring-2 ring-offset-2 ring-vms-danger animate-pulse"
          >
            <Lock className="w-5 h-5 mr-2" /> Execute Final Closure
          </Button>
        )}
      </div>

      {errorMsg && !sapClosure && (
        <Card className="border-0 shadow-sm border-t-4 border-t-vms-warning bg-vms-warning-bg/20 mb-8">
          <CardContent className="p-6 flex items-start text-left">
            <AlertCircle className="w-8 h-8 text-vms-warning mr-4 mt-1 flex-shrink-0" />
            <div>
              <h2 className="text-lg font-bold text-vms-primary-dark mb-1">System Locked</h2>
              <p className="text-vms-warning-dark font-medium whitespace-pre-wrap">{errorMsg}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {!sapClosure && !errorMsg && canManage && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-0 shadow-md ring-1 ring-vms-gray-200">
            <CardHeader className="bg-vms-primary-dark text-white rounded-t-xl py-4">
              <h3 className="font-bold flex items-center">
                <CloudUpload className="w-4 h-4 mr-2" /> Initialize SAP Upload
              </h3>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleUpload} className="space-y-6">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-vms-gray-500 mb-2">SAP Reference Number <span className="text-vms-danger">*</span></label>
                  <input required className="w-full border-vms-gray-200 rounded-md focus:ring-vms-primary text-sm shadow-sm font-mono text-lg p-3" value={formData.sap_reference} onChange={e => setFormData({...formData, sap_reference: e.target.value})} placeholder="e.g. SAP-DOC-892471" />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-vms-gray-500 mb-2">System Upload Date <span className="text-vms-danger">*</span></label>
                  <input required type="date" className="w-full border-vms-gray-200 rounded-md focus:ring-vms-primary text-sm shadow-sm p-3" value={formData.upload_date} onChange={e => setFormData({...formData, upload_date: e.target.value})} />
                </div>
                <div className="pt-4 border-t border-vms-gray-100">
                  <Button type="submit" className="w-full shadow-md text-base py-6 bg-vms-accent hover:bg-vms-accent-dark text-white">
                    <Send className="w-5 h-5 mr-2" /> Transmit to ERP
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          <div className="hidden lg:flex flex-col justify-center items-center text-center p-10 bg-vms-gray-50 rounded-xl border border-vms-gray-200 border-dashed">
            <Briefcase className="w-16 h-16 text-vms-gray-300 mb-4" />
            <h3 className="text-lg font-black text-vms-gray-500 mb-2">Ready for Synchronization</h3>
            <p className="text-vms-gray-400 max-w-sm">
              The event has passed financial audit and is ready to be logged into the central SAP system for vendor payment processing.
            </p>
          </div>
        </div>
      )}

      {sapClosure && (
        <div className="space-y-8">
          
          {/* Executive Summary Banner */}
          <div className={`p-6 rounded-xl border shadow-sm relative overflow-hidden ${
            sapClosure.closure_status === 'CLOSED' ? 'bg-vms-danger-bg border-vms-danger/30' : 'bg-vms-primary/5 border-vms-primary/20'
          }`}>
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Briefcase className="w-32 h-32" />
            </div>
            
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <span className="block text-xs font-black uppercase tracking-widest text-vms-gray-500 mb-1">SAP Document ID</span>
                <span className="text-2xl font-mono font-black text-vms-primary-dark">{sapClosure.sap_reference}</span>
              </div>
              
              <div>
                <span className="block text-xs font-black uppercase tracking-widest text-vms-gray-500 mb-1">Upload Date</span>
                <span className="text-xl font-bold text-vms-gray-700">{new Date(sapClosure.upload_date).toLocaleDateString()}</span>
              </div>
              
              <div className="md:text-right">
                <span className="block text-xs font-black uppercase tracking-widest text-vms-gray-500 mb-1">Lifecycle State</span>
                <Badge variant={sapClosure.closure_status === 'CLOSED' ? 'danger' : 'success'} className="uppercase px-4 py-1.5 shadow-sm text-sm">
                  {sapClosure.closure_status === 'CLOSED' ? (
                    <><Lock className="w-4 h-4 mr-1.5" /> ARCHIVED & LOCKED</>
                  ) : (
                    <><Activity className="w-4 h-4 mr-1.5" /> ACTIVE</>
                  )}
                </Badge>
              </div>
            </div>
          </div>

          {/* Payment Control Center */}
          <Card className="border-0 shadow-md ring-1 ring-vms-gray-200 overflow-hidden">
            <CardHeader className="bg-vms-gray-50 border-b border-vms-gray-100 py-5">
              <h3 className="font-bold text-vms-primary-dark flex items-center text-lg">
                <CreditCard className="w-5 h-5 mr-2" /> Vendor Payment Tracker
              </h3>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-vms-gray-100">
                
                {/* Status Readout */}
                <div className="p-8 flex flex-col justify-center">
                  <span className="text-sm font-black text-vms-gray-400 uppercase tracking-widest mb-4">Current Payment State</span>
                  <div className="flex items-center">
                    <div className={`w-3 h-16 rounded-full mr-6 ${
                      sapClosure.payment_status === 'PAID' ? 'bg-vms-success' :
                      sapClosure.payment_status === 'PROCESSED' ? 'bg-vms-accent' :
                      'bg-vms-warning'
                    }`} />
                    <div>
                      <span className={`block text-4xl font-black mb-1 ${
                        sapClosure.payment_status === 'PAID' ? 'text-vms-success' :
                        sapClosure.payment_status === 'PROCESSED' ? 'text-vms-accent-dark' :
                        'text-vms-warning-dark'
                      }`}>
                        {sapClosure.payment_status}
                      </span>
                      <span className="text-vms-gray-500 font-medium">Awaiting clearing from finance department.</span>
                    </div>
                  </div>
                </div>

                {/* Status Controls */}
                <div className="p-8 bg-vms-gray-50/50">
                  {!closed && canManage ? (
                    <div className="space-y-4">
                      <label className="flex items-center text-sm font-black text-vms-gray-600 uppercase tracking-widest">
                        <ArrowRightCircle className="w-4 h-4 mr-2" /> Update State
                      </label>
                      <div className="relative">
                        <select 
                          className={`w-full appearance-none border-2 rounded-xl focus:ring-vms-primary text-lg font-bold p-4 shadow-sm bg-white cursor-pointer ${
                            sapClosure.payment_status === 'PAID' ? 'border-vms-success text-vms-success opacity-70 cursor-not-allowed' : 'border-vms-gray-200 text-vms-primary-dark'
                          }`}
                          value={sapClosure.payment_status}
                          onChange={(e) => handlePaymentUpdate(e.target.value as SapPaymentStatus)}
                          disabled={sapClosure.payment_status === 'PAID'}
                        >
                          <option value="PENDING" disabled={sapClosure.payment_status !== 'PENDING'}>PENDING - Sent to ERP</option>
                          <option value="PROCESSED" disabled={sapClosure.payment_status === 'PAID'}>PROCESSED - Approved in ERP</option>
                          <option value="PAID">PAID - Funds Transferred</option>
                        </select>
                        {sapClosure.payment_status !== 'PAID' && (
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-vms-gray-500">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                          </div>
                        )}
                      </div>
                      {sapClosure.payment_status === 'PAID' && (
                        <p className="text-sm text-vms-success font-bold mt-2">Payment cleared. State locked.</p>
                      )}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col justify-center items-center text-center">
                      <Lock className="w-8 h-8 text-vms-gray-300 mb-2" />
                      <span className="text-sm font-bold text-vms-gray-500">Payment state is locked.</span>
                    </div>
                  )}
                </div>
                
              </div>
            </CardContent>
          </Card>

        </div>
      )}
    </div>
  );
}
