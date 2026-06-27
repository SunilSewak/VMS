import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { VmsEvent } from "@/types/event";
import { Invoice, InvoiceAudit, InvoiceVariance, CommercialVersion, AuditSummary } from "@/types/finance";
import { useAuthStore } from "@/store/authStore";
import { financeRepository } from "@/features/finance/repositories/financeRepository";
import { roomingRepository } from "@/features/rooming/repositories/roomingRepository";
import { runAudit } from "@/lib/auditEngine";
import { supabase } from "@/lib/supabase";
import { isEventClosed } from "@/lib/eventLocking";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ShieldCheck, AlertTriangle, PlayCircle, BarChart3, Lock, CheckCircle, XCircle, FileText } from "lucide-react";

export function AuditTab() {
  const { event } = useOutletContext<{ event: VmsEvent }>();
  const { user } = useAuthStore();
  
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [auditRun, setAuditRun] = useState<InvoiceAudit | null>(null);
  const [variances, setVariances] = useState<InvoiceVariance[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  
  // Data needed for Audit Engine
  const [commercialVersion, setCommercialVersion] = useState<CommercialVersion | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [eventDays, setEventDays] = useState(0);

  const closed = isEventClosed(event.lifecycle_status);
  const canManage = (user?.role === 'ADMIN') && !closed;

  useEffect(() => {
    async function prepareAuditData() {
      setLoading(true);
      setErrorMsg("");
      try {
        const invs = await financeRepository.getInvoicesByEvent(event.id);
        setInvoices(invs);

        const { data: existingAudit } = await supabase.from('invoice_audits').select('*').eq('event_id', event.id).single();
        if (existingAudit) {
          setAuditRun(existingAudit as InvoiceAudit);
          const { data: vData } = await supabase.from('invoice_variances').select('*').eq('audit_id', existingAudit.id);
          setVariances(vData as InvoiceVariance[]);
          setLoading(false);
          return;
        }

        const { data: bData } = await supabase.from('bookings').select('hotel_id').eq('event_id', event.id).single();
        if (!bData) throw new Error("No Booking found for this event.");

        const submissions = await roomingRepository.getEventRoomingSubmissions(event.id);
        const finalized = submissions.find(s => s.status === 'Finalized');
        if (!finalized) throw new Error("No Finalized Rooming Submission found.");
        const parts = await roomingRepository.getRoomingParticipants(finalized.id);
        setParticipants(parts);

        if (event.start_date && event.end_date) {
          const s = new Date(event.start_date);
          const e = new Date(event.end_date);
          const days = Math.ceil(Math.abs(e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
          setEventDays(days > 0 ? days : 1);
        } else {
          setEventDays(1);
        }

        const appCom = await financeRepository.getApprovedCommercial(bData.hotel_id);
        if (!appCom) throw new Error("No Approved Commercials found for this hotel.");
        const versions = await financeRepository.getCommercialVersions(appCom.id);
        
        const eventStart = new Date(event.start_date || '');
        const eventEnd = new Date(event.end_date || '');
        const activeVersion = versions.find(v => {
          const vf = new Date(v.effective_from);
          const vt = new Date(v.effective_to);
          return vf <= eventStart && vt >= eventEnd;
        });

        if (!activeVersion) throw new Error("No active commercial version covers the event dates.");
        setCommercialVersion(activeVersion);

      } catch (err: any) {
        setErrorMsg(err.message || "Failed to load audit prerequisites.");
      }
      setLoading(false);
    }
    prepareAuditData();
  }, [event]);

  const handleRunAudit = async () => {
    if (!user || !canManage || invoices.length === 0 || !commercialVersion || participants.length === 0) return;
    
    try {
      setLoading(true);
      const invoiceToAudit = invoices[0]; 
      
      const summary = runAudit(participants, commercialVersion, eventDays, invoiceToAudit.invoice_amount);

      const newAudit = await financeRepository.createAudit({
        event_id: event.id,
        invoice_id: invoiceToAudit.id,
        expected_cost: summary.expectedTotalCost,
        actual_cost: invoiceToAudit.invoice_amount,
        variance_amount: summary.varianceAmount,
        audit_status: summary.auditStatus
      }, user.id, event.lifecycle_status);

      const varianceRecords = [];
      
      const vRoom = await financeRepository.createVariance({
        audit_id: newAudit.id,
        variance_type: 'Room Variance',
        expected_amount: summary.expectedRoomCost,
        actual_amount: summary.expectedRoomCost,
        variance_amount: 0,
        severity: 'Pass'
      });
      varianceRecords.push(vRoom);

      const vTotal = await financeRepository.createVariance({
        audit_id: newAudit.id,
        variance_type: 'Total Variance',
        expected_amount: summary.expectedTotalCost,
        actual_amount: summary.actualTotalCost,
        variance_amount: summary.varianceAmount,
        severity: summary.auditStatus
      });
      varianceRecords.push(vTotal);

      if (summary.expectedNRCCost === 0 && participants.some(p => p.nrc_flag)) {
        const vNRC = await financeRepository.createVariance({
          audit_id: newAudit.id,
          variance_type: 'NRC Variance',
          expected_amount: 0,
          actual_amount: 0,
          variance_amount: 0,
          severity: 'Warning'
        });
        varianceRecords.push(vNRC);
      }

      setAuditRun(newAudit);
      setVariances(varianceRecords);

    } catch (err: any) {
      setErrorMsg("Failed to execute audit: " + err.message);
    }
    setLoading(false);
  };

  if (loading) return <div className="p-8 font-medium text-vms-primary animate-pulse">Initializing audit engine...</div>;

  return (
    <div className="animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b border-vms-gray-100 pb-6">
        <div>
          <h2 className="text-3xl font-black text-vms-primary-dark tracking-tight">Compliance Audit</h2>
          <p className="text-vms-gray-600 mt-1">Automated reconciliation of invoices against approved PO baseline.</p>
        </div>
        {!auditRun && canManage && (
          <Button 
            onClick={handleRunAudit}
            disabled={!!errorMsg || invoices.length === 0}
            className="shadow-md text-base px-6 py-6"
          >
            <PlayCircle className="w-5 h-5 mr-2" /> Execute Audit Engine
          </Button>
        )}
      </div>

      {errorMsg && !auditRun && (
        <Card className="border-0 shadow-sm border-t-4 border-t-vms-danger bg-vms-danger-bg/20 mb-8">
          <CardContent className="p-6 flex items-start text-left">
            <AlertTriangle className="w-8 h-8 text-vms-danger mr-4 mt-1 flex-shrink-0" />
            <div>
              <h2 className="text-lg font-bold text-vms-primary-dark mb-1">Audit Initialization Blocked</h2>
              <p className="text-vms-danger font-medium whitespace-pre-wrap">{errorMsg}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {invoices.length === 0 && !errorMsg && !auditRun && (
        <Card className="border-0 shadow-sm border-t-4 border-t-vms-warning bg-vms-warning-bg/20 mb-8">
          <CardContent className="p-6 flex items-start text-left">
            <FileText className="w-8 h-8 text-vms-warning mr-4 mt-1 flex-shrink-0" />
            <div>
              <h2 className="text-lg font-bold text-vms-primary-dark mb-1">Awaiting Financials</h2>
              <p className="text-vms-gray-600 text-sm">
                No invoices found. Please log a vendor invoice in the Invoices tab before running the compliance audit.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {auditRun && (
        <div className="space-y-8">
          
          {/* Status Banner */}
          <div className={`p-6 rounded-xl border flex flex-col md:flex-row justify-between items-center shadow-sm ${
            auditRun.audit_status === 'Pass' ? 'bg-vms-success-bg border-vms-success/30' :
            auditRun.audit_status === 'Warning' ? 'bg-vms-warning-bg border-vms-warning/30' :
            'bg-vms-danger-bg border-vms-danger/30'
          }`}>
            <div className="flex items-center mb-4 md:mb-0">
              {auditRun.audit_status === 'Pass' && <CheckCircle className="w-10 h-10 text-vms-success mr-4" />}
              {auditRun.audit_status === 'Warning' && <AlertTriangle className="w-10 h-10 text-vms-warning mr-4" />}
              {(auditRun.audit_status === 'Critical' || auditRun.audit_status === 'Review Required') && <XCircle className="w-10 h-10 text-vms-danger mr-4" />}
              <div>
                <span className="block text-sm font-black uppercase tracking-widest text-vms-gray-600 mb-1">Audit Result</span>
                <span className={`text-3xl font-black ${
                  auditRun.audit_status === 'Pass' ? 'text-vms-success' :
                  auditRun.audit_status === 'Warning' ? 'text-vms-warning' :
                  'text-vms-danger'
                }`}>
                  {auditRun.audit_status.toUpperCase()}
                </span>
              </div>
            </div>
            
            <div className="text-right">
              <span className="block text-sm font-black uppercase tracking-widest text-vms-gray-600 mb-1">Calculated Variance</span>
              <span className={`text-3xl font-black ${auditRun.variance_amount > 0 ? 'text-vms-danger' : 'text-vms-success'}`}>
                ${auditRun.variance_amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Financial Summary */}
            <Card className="border-0 shadow-md ring-1 ring-vms-gray-200">
              <CardHeader className="bg-vms-gray-50 border-b border-vms-gray-100 py-4">
                <h3 className="font-bold text-vms-primary-dark flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2" /> Reconciliation Summary
                </h3>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex justify-between items-center p-4 bg-white border border-vms-gray-100 rounded-lg shadow-sm">
                    <span className="text-sm font-bold text-vms-gray-500 uppercase tracking-widest">Expected PO Baseline</span>
                    <span className="text-2xl font-black text-vms-primary-dark">${auditRun.expected_cost.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-white border border-vms-gray-100 rounded-lg shadow-sm">
                    <span className="text-sm font-bold text-vms-gray-500 uppercase tracking-widest">Actual Invoiced</span>
                    <span className="text-2xl font-black text-vms-primary-dark">${auditRun.actual_cost.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                  
                  <div className={`flex justify-between items-center p-4 rounded-lg shadow-sm border ${
                    auditRun.variance_amount > 0 ? 'bg-vms-danger-bg border-vms-danger/30' : 'bg-vms-success-bg border-vms-success/30'
                  }`}>
                    <span className={`text-sm font-bold uppercase tracking-widest ${auditRun.variance_amount > 0 ? 'text-vms-danger' : 'text-vms-success'}`}>Net Variance</span>
                    <span className={`text-3xl font-black ${auditRun.variance_amount > 0 ? 'text-vms-danger' : 'text-vms-success'}`}>
                      ${auditRun.variance_amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Variance Breakdown */}
            <Card className="border-0 shadow-md ring-1 ring-vms-gray-200">
              <CardHeader className="bg-vms-gray-50 border-b border-vms-gray-100 py-4">
                <h3 className="font-bold text-vms-primary-dark flex items-center">
                  <ShieldCheck className="w-4 h-4 mr-2" /> Line Item Variance
                </h3>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-vms-gray-100">
                  {variances.map(v => (
                    <div key={v.id} className="p-6 flex justify-between items-center bg-white hover:bg-vms-gray-50 transition-colors">
                      <div className="flex items-center">
                        <div className={`w-2 h-10 rounded-full mr-4 ${
                          v.severity === 'Pass' ? 'bg-vms-success' :
                          v.severity === 'Warning' ? 'bg-vms-warning' :
                          'bg-vms-danger'
                        }`} />
                        <div>
                          <span className="block font-black text-vms-primary-dark text-lg">{v.variance_type}</span>
                          <Badge variant={
                            v.severity === 'Pass' ? 'success' :
                            v.severity === 'Warning' ? 'warning' : 'danger'
                          } className="mt-1 shadow-sm uppercase tracking-wider text-[10px]">
                            {v.severity}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`block text-2xl font-black ${v.variance_amount > 0 ? 'text-vms-danger' : 'text-vms-primary-dark'}`}>
                          ${v.variance_amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </span>
                        <span className="text-xs font-bold text-vms-gray-400">Deviation</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
          </div>
          
          <div className="flex justify-center mt-8">
            <Badge variant="default" className="bg-vms-gray-100 text-vms-gray-600 px-4 py-2 flex items-center shadow-inner border-vms-gray-200">
              <Lock className="w-3.5 h-3.5 mr-2" /> This audit record is locked and immutable. Re-audits require a new execution request.
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
}
