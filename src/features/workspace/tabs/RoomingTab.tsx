import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { VmsEvent } from "@/types/event";
import { useAuthStore } from "@/store/authStore";
import { roomingRepository } from "@/features/rooming/repositories/roomingRepository";
import { validateRoomingSubmission } from "@/lib/roomingValidator";
import { RoomingSubmission, RoomingParticipant, RoomingSummary } from "@/types/rooming";
import { RoomRequirement } from "@/types/booking";
import { supabase } from "@/lib/supabase";
import { isEventClosed } from "@/lib/eventLocking";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Users, AlertTriangle, CheckCircle, UserPlus, FileSpreadsheet, Send, ShieldCheck, Trash2 } from "lucide-react";

export function RoomingTab() {
  const { event } = useOutletContext<{ event: VmsEvent }>();
  const { user } = useAuthStore();
  
  const [requirements, setRequirements] = useState<RoomRequirement | null>(null);
  const [submissions, setSubmissions] = useState<RoomingSubmission[]>([]);
  const [activeSubmission, setActiveSubmission] = useState<RoomingSubmission | null>(null);
  const [participants, setParticipants] = useState<RoomingParticipant[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    employee_name: '', designation: '', division: '', state: '', region: '',
    occupancy_type: 'Single' as const, check_in: '', check_out: '', nrc_flag: false
  });

  const closed = isEventClosed(event.lifecycle_status);
  const canManage = (user?.role?.role_name === 'SUPER_ADMIN' || user?.role?.role_name === 'VMS_ADMIN' || user?.role?.role_name === 'VMS_EXECUTIVE') && !closed;

  const fetchData = async () => {
    setLoading(true);
    const { data: bData } = await supabase.from('bookings').select('id').eq('event_id', event.id).single();
    if (bData) {
      const { data: rData } = await supabase.from('room_requirements').select('*').eq('booking_id', bData.id).single();
      if (rData) setRequirements(rData as any);
    }

    const subs = await roomingRepository.getEventRoomingSubmissions(event.id);
    setSubmissions(subs);
    if (subs.length > 0) {
      const latest = subs[0];
      setActiveSubmission(latest);
      const parts = await roomingRepository.getRoomingParticipants(latest.id);
      setParticipants(parts);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [event.id]);

  const handleCreateDraft = async () => {
    if (!user) return;
    await roomingRepository.createDraftSubmission(event.id, user.id, event.lifecycle_status);
    fetchData();
  };

  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubmission) return;
    await roomingRepository.createParticipant({
      submission_id: activeSubmission.id,
      ...formData
    });
    setFormData({ employee_name: '', designation: '', division: '', state: '', region: '', occupancy_type: 'Single', check_in: '', check_out: '', nrc_flag: false });
    const parts = await roomingRepository.getRoomingParticipants(activeSubmission.id);
    setParticipants(parts);
  };

  const handleDelete = async (id: string) => {
    await roomingRepository.deleteParticipant(id);
    if (activeSubmission) {
      const parts = await roomingRepository.getRoomingParticipants(activeSubmission.id);
      setParticipants(parts);
    }
  };

  const handleSubmit = async () => {
    if (!activeSubmission || !user) return;
    await roomingRepository.updateSubmissionStatus(activeSubmission.id, event.id, 'Submitted', user.id, event.lifecycle_status);
    fetchData();
  };

  const handleFinalize = async () => {
    if (!activeSubmission || !user) return;
    await roomingRepository.updateSubmissionStatus(activeSubmission.id, event.id, 'Finalized', user.id, event.lifecycle_status);
    fetchData();
  };

  if (loading) return <div className="p-8 font-medium text-vms-primary animate-pulse">Loading rooming rosters...</div>;

  if (!requirements) {
    return (
      <Card className="border-0 shadow-sm border-t-4 border-t-vms-warning bg-vms-warning-bg/20 mt-4">
        <CardContent className="p-10 flex flex-col items-center text-center">
          <AlertTriangle className="w-12 h-12 text-vms-warning mb-4" />
          <h2 className="text-xl font-bold text-vms-primary-dark mb-2">Room Blocks Missing</h2>
          <p className="text-vms-gray-600 max-w-md">
            Rooming lists cannot be processed until the hierarchical room blocks are confirmed in the Accommodation tab.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { valid, errors, summary } = validateRoomingSubmission(participants, requirements);
  const isReadonly = activeSubmission?.status === 'Finalized' || !canManage;

  const renderUtilization = (label: string, consumed: number, available: number) => {
    const ratio = available === 0 ? (consumed > 0 ? 1 : 0) : consumed / available;
    let colorClass = 'text-vms-success';
    let bgClass = 'bg-vms-success-bg/30';
    let barColor = 'bg-vms-success';

    if (consumed > available) {
      colorClass = 'text-vms-danger font-black';
      bgClass = 'bg-vms-danger-bg ring-1 ring-vms-danger/30';
      barColor = 'bg-vms-danger';
    } else if (ratio >= 0.8) {
      colorClass = 'text-vms-warning font-black';
      bgClass = 'bg-vms-warning-bg ring-1 ring-vms-warning/30';
      barColor = 'bg-vms-warning';
    }

    const percentage = available === 0 ? 0 : Math.min(100, (consumed / available) * 100);

    return (
      <div className={`p-5 rounded-xl border border-vms-gray-100 ${bgClass} transition-colors`}>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-black text-vms-gray-500 uppercase tracking-widest">{label}</span>
          <span className={`text-xl font-black ${colorClass}`}>
            {consumed} <span className="text-sm font-bold text-vms-gray-400">/ {available}</span>
          </span>
        </div>
        <div className="w-full h-2 bg-vms-gray-200 rounded-full overflow-hidden">
          <div className={`h-full ${barColor} rounded-full transition-all duration-1000`} style={{ width: `${percentage}%` }} />
        </div>
      </div>
    );
  };

  return (
    <div className="animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b border-vms-gray-100 pb-6">
        <div>
          <h2 className="text-3xl font-black text-vms-primary-dark tracking-tight">Rooming Roster</h2>
          <p className="text-vms-gray-600 mt-1">Manage participant allocations against approved hotel room blocks.</p>
        </div>
        {!activeSubmission && canManage && (
          <Button onClick={handleCreateDraft} className="shadow-md">
            <FileSpreadsheet className="w-4 h-4 mr-2" /> Initialize Roster
          </Button>
        )}
      </div>

      {activeSubmission && (
        <div className="space-y-8">
          
          {/* Status Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-vms-gray-200 gap-4">
            <div className="flex items-center">
              <span className="text-sm font-bold text-vms-gray-500 uppercase tracking-widest mr-4">Roster Status</span>
              {activeSubmission.status === 'Draft' && <Badge variant="warning" className="uppercase px-3 py-1 shadow-sm">Draft In Progress</Badge>}
              {activeSubmission.status === 'Submitted' && <Badge variant="info" className="uppercase px-3 py-1 shadow-sm">Pending Finalization</Badge>}
              {activeSubmission.status === 'Finalized' && <Badge variant="success" className="uppercase px-3 py-1 shadow-sm"><CheckCircle className="w-3.5 h-3.5 mr-1"/> Locked & Finalized</Badge>}
            </div>
            
            <div className="flex space-x-3">
              {activeSubmission.status === 'Draft' && canManage && (
                <Button 
                  onClick={handleSubmit} 
                  disabled={!valid || participants.length === 0}
                  className="bg-vms-primary hover:bg-vms-primary-dark text-white shadow-md"
                >
                  <Send className="w-4 h-4 mr-2" /> Submit to Agency
                </Button>
              )}
              {activeSubmission.status === 'Submitted' && canManage && (
                <Button 
                  onClick={handleFinalize} 
                  className="bg-vms-success hover:bg-green-700 text-white shadow-md"
                >
                  <ShieldCheck className="w-4 h-4 mr-2" /> Lock Rooming List
                </Button>
              )}
            </div>
          </div>

          {!valid && activeSubmission.status === 'Draft' && (
            <div className="bg-vms-danger-bg border border-vms-danger/20 text-vms-danger p-6 rounded-xl flex items-start shadow-sm">
              <AlertTriangle className="w-6 h-6 mr-4 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-black text-lg mb-2">Validation Failed</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm font-medium">
                  {errors.map((err, i) => <li key={i}>{err}</li>)}
                </ul>
              </div>
            </div>
          )}

          {/* Live Utilization Grid */}
          <div>
            <h3 className="text-sm font-black text-vms-gray-400 uppercase tracking-widest mb-4">Live Block Consumption</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {renderUtilization('Single', summary.singleRoomsConsumed, summary.singleRoomsAvailable)}
              {renderUtilization('Double / Twin', summary.doubleRoomsConsumed, summary.doubleRoomsAvailable)}
              {renderUtilization('Triple', summary.tripleRoomsConsumed, summary.tripleRoomsAvailable)}
              {renderUtilization('Suite', summary.suiteRoomsConsumed, summary.suiteRoomsAvailable)}
            </div>
          </div>

          {/* Main Roster Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Roster Table */}
            <div className={`lg:col-span-${isReadonly ? '3' : '2'}`}>
              <Card className="border-0 shadow-md ring-1 ring-vms-gray-200 overflow-hidden h-full">
                <CardHeader className="bg-vms-gray-50 border-b border-vms-gray-100 py-4 flex justify-between items-center">
                  <h3 className="font-bold text-vms-primary-dark flex items-center">
                    <Users className="w-4 h-4 mr-2" /> Participant Roster
                  </h3>
                  <Badge variant="default" className="bg-vms-primary/10 text-vms-primary border-0">{participants.length} Assigned</Badge>
                </CardHeader>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white border-b border-vms-gray-100">
                      <tr>
                        <th className="p-4 font-bold text-vms-gray-500 uppercase tracking-wider text-xs">Employee</th>
                        <th className="p-4 font-bold text-vms-gray-500 uppercase tracking-wider text-xs">Designation</th>
                        <th className="p-4 font-bold text-vms-gray-500 uppercase tracking-wider text-xs">Allocation</th>
                        {!isReadonly && <th className="p-4 text-right"></th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-vms-gray-50">
                      {participants.map(p => (
                        <tr key={p.id} className="hover:bg-vms-gray-50 transition-colors bg-white">
                          <td className="p-4 font-bold text-vms-primary-dark">{p.employee_name}</td>
                          <td className="p-4 text-vms-gray-600">{p.designation || '-'}</td>
                          <td className="p-4">
                            <span className="bg-vms-gray-100 text-vms-gray-700 px-2.5 py-1 rounded-md text-xs font-bold border border-vms-gray-200 shadow-sm">
                              {p.occupancy_type}
                            </span>
                          </td>
                          {!isReadonly && (
                            <td className="p-4 text-right">
                              <button onClick={() => handleDelete(p.id)} className="text-vms-danger hover:bg-vms-danger-bg p-2 rounded-md transition-colors" title="Remove Participant">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                      {participants.length === 0 && (
                        <tr><td colSpan={4} className="p-10 text-center text-vms-gray-400 font-medium bg-white">No participants added to the roster.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            {/* Add Participant Form */}
            {!isReadonly && (
              <div className="lg:col-span-1">
                <Card className="border-0 shadow-md ring-1 ring-vms-gray-200 sticky top-4">
                  <CardHeader className="bg-vms-primary-dark text-white rounded-t-xl py-4">
                    <h3 className="font-bold flex items-center">
                      <UserPlus className="w-4 h-4 mr-2" /> Add Participant
                    </h3>
                  </CardHeader>
                  <CardContent className="p-6">
                    <form onSubmit={handleAddParticipant} className="space-y-4">
                      <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-vms-gray-500 mb-1">Employee Name <span className="text-vms-danger">*</span></label>
                        <input required className="w-full border-vms-gray-200 rounded-md focus:ring-vms-primary text-sm shadow-sm" value={formData.employee_name} onChange={e => setFormData({...formData, employee_name: e.target.value})} placeholder="Full Name" />
                      </div>
                      <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-vms-gray-500 mb-1">Designation</label>
                        <input className="w-full border-vms-gray-200 rounded-md focus:ring-vms-primary text-sm shadow-sm" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} placeholder="e.g. Sales Manager" />
                      </div>
                      <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-vms-gray-500 mb-1">Room Assignment <span className="text-vms-danger">*</span></label>
                        <select className="w-full border-vms-gray-200 rounded-md focus:ring-vms-primary text-sm font-bold shadow-sm bg-vms-gray-50" value={formData.occupancy_type} onChange={e => setFormData({...formData, occupancy_type: e.target.value as any})}>
                          <option value="Single">Single Room</option>
                          <option value="Double">Double / Twin Room</option>
                          <option value="Triple">Triple Room</option>
                          <option value="Suite">Suite</option>
                        </select>
                      </div>
                      <div className="pt-4 mt-2 border-t border-vms-gray-100">
                        <Button type="submit" className="w-full shadow-md">
                          <UserPlus className="w-4 h-4 mr-2" /> Add to Roster
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
