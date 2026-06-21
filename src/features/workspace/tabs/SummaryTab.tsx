import { useOutletContext, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Building, Users, FileText, CheckCircle, ShieldCheck, ArrowRight, BedDouble } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function SummaryTab() {
  const { event } = useOutletContext<{ event: any }>();
  const navigate = useNavigate();

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-black text-vms-primary-dark tracking-tight">Executive Summary</h2>
          <p className="text-vms-gray-600 mt-1">High-level operational overview across all workspace modules.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Venue Status */}
        <Card className="border-0 shadow-sm ring-1 ring-vms-gray-200">
          <CardHeader className="bg-vms-gray-50 border-b border-vms-gray-100 flex justify-between items-center py-4">
            <h3 className="font-bold text-vms-primary-dark flex items-center"><Building className="w-4 h-4 mr-2" /> Venue Strategy</h3>
          </CardHeader>
          <CardContent className="p-6 flex flex-col justify-between">
            <div className="mb-6">
              <p className="text-xs font-bold text-vms-gray-400 uppercase tracking-widest mb-1">Selected Partner</p>
              <p className="text-xl font-black text-vms-primary-dark">{event.hotel_name || 'Sourcing Required'}</p>
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={() => navigate(`../venue`)}>Manage Venue <ArrowRight className="w-3.5 h-3.5 ml-2" /></Button>
          </CardContent>
        </Card>

        {/* Accommodation Status */}
        <Card className="border-0 shadow-sm ring-1 ring-vms-gray-200">
          <CardHeader className="bg-vms-gray-50 border-b border-vms-gray-100 flex justify-between items-center py-4">
            <h3 className="font-bold text-vms-primary-dark flex items-center"><BedDouble className="w-4 h-4 mr-2" /> Room Blocks</h3>
          </CardHeader>
          <CardContent className="p-6 flex flex-col justify-between">
            <div className="mb-6">
              <p className="text-xs font-bold text-vms-gray-400 uppercase tracking-widest mb-1">Block Status</p>
              <p className="text-xl font-black text-vms-primary-dark">Not Configured</p>
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={() => navigate(`../accommodation`)}>View Inventory <ArrowRight className="w-3.5 h-3.5 ml-2" /></Button>
          </CardContent>
        </Card>

        {/* Rooming Status */}
        <Card className="border-0 shadow-sm ring-1 ring-vms-gray-200">
          <CardHeader className="bg-vms-gray-50 border-b border-vms-gray-100 flex justify-between items-center py-4">
            <h3 className="font-bold text-vms-primary-dark flex items-center"><Users className="w-4 h-4 mr-2" /> Rooming List</h3>
          </CardHeader>
          <CardContent className="p-6 flex flex-col justify-between">
            <div className="mb-6">
              <p className="text-xs font-bold text-vms-gray-400 uppercase tracking-widest mb-1">Allocation</p>
              <p className="text-xl font-black text-vms-primary-dark">0 / {event.expected_pax || 0} Assigned</p>
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={() => navigate(`../rooming`)}>Manage Roster <ArrowRight className="w-3.5 h-3.5 ml-2" /></Button>
          </CardContent>
        </Card>

        {/* Invoice Status */}
        <Card className="border-0 shadow-sm ring-1 ring-vms-gray-200">
          <CardHeader className="bg-vms-gray-50 border-b border-vms-gray-100 flex justify-between items-center py-4">
            <h3 className="font-bold text-vms-primary-dark flex items-center"><FileText className="w-4 h-4 mr-2" /> Financials</h3>
          </CardHeader>
          <CardContent className="p-6 flex flex-col justify-between">
            <div className="mb-6">
              <p className="text-xs font-bold text-vms-gray-400 uppercase tracking-widest mb-1">Invoice Status</p>
              <p className="text-xl font-black text-vms-primary-dark">Pending Receipt</p>
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={() => navigate(`../invoices`)}>View Invoices <ArrowRight className="w-3.5 h-3.5 ml-2" /></Button>
          </CardContent>
        </Card>

        {/* Audit Status */}
        <Card className="border-0 shadow-sm ring-1 ring-vms-gray-200">
          <CardHeader className="bg-vms-gray-50 border-b border-vms-gray-100 flex justify-between items-center py-4">
            <h3 className="font-bold text-vms-primary-dark flex items-center"><ShieldCheck className="w-4 h-4 mr-2" /> Compliance Audit</h3>
          </CardHeader>
          <CardContent className="p-6 flex flex-col justify-between">
            <div className="mb-6">
              <p className="text-xs font-bold text-vms-gray-400 uppercase tracking-widest mb-1">Audit Status</p>
              <p className="text-xl font-black text-vms-primary-dark">Not Started</p>
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={() => navigate(`../audit`)}>Compliance Hub <ArrowRight className="w-3.5 h-3.5 ml-2" /></Button>
          </CardContent>
        </Card>

        {/* SAP Status */}
        <Card className="border-0 shadow-sm ring-1 ring-vms-gray-200">
          <CardHeader className="bg-vms-gray-50 border-b border-vms-gray-100 flex justify-between items-center py-4">
            <h3 className="font-bold text-vms-primary-dark flex items-center"><CheckCircle className="w-4 h-4 mr-2" /> SAP Closure</h3>
          </CardHeader>
          <CardContent className="p-6 flex flex-col justify-between">
            <div className="mb-6">
              <p className="text-xs font-bold text-vms-gray-400 uppercase tracking-widest mb-1">ERP Integration</p>
              <p className="text-xl font-black text-vms-primary-dark">Locked</p>
            </div>
            <Button variant="outline" size="sm" className="w-full" disabled>Finalize SAP <ArrowRight className="w-3.5 h-3.5 ml-2" /></Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
