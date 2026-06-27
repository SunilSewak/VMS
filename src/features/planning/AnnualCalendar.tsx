import { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import { planningRepository } from './repositories/planningRepository';
import { AnnualCalendar } from '@/types/planning';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Plus, Edit2, CheckCircle, Send, PlusCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { MultiSelect } from '@/components/ui/MultiSelect';

export function AnnualCalendarView() {
  const { user } = useAuthStore();
  const isSalesHead = user?.role === 'SALES_HEAD';
  const [calendars, setCalendars] = useState<AnnualCalendar[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Masters for the form
  const [clusters, setClusters] = useState<any[]>([]);
  const [divisions, setDivisions] = useState<any[]>([]);
  const [meetingTypes, setMeetingTypes] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    cluster_ids: [] as string[],
    division_ids: [] as string[],
    meeting_type_ids: [] as string[],
    preferred_city_ids: [] as string[],
    months: [] as number[],
    expected_pax: 50,
    meeting_name: '',
    fiscal_year: '2026-27'
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const data = await planningRepository.getAnnualCalendars();
    setCalendars(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // Load masters
    supabase.from('clusters').select('*').then(({ data }) => data && setClusters(data));
    supabase.from('divisions').select('*').then(({ data }) => data && setDivisions(data));
    supabase.from('meeting_types').select('*').then(({ data }) => data && setMeetingTypes(data));
    supabase.from('cities').select('*').then(({ data }) => data && setCities(data));
  }, []);

  const handleCreateOrUpdate = async () => {
    if (formData.division_ids.length === 0 || formData.meeting_type_ids.length === 0 || formData.preferred_city_ids.length === 0 || formData.months.length === 0) return;
    try {
      if (editingId) {
        // Edit mode: currently we only edit single values or we need to replace all.
        // For simplicity, let's say edit only edits the specific record if it was generated as a single, 
        // but the prompt says "Annual Calendar displays grouped plans". 
        // If we grouped plans by meeting_name, editing should probably update/recreate the group.
        // For now, to keep existing behavior, if editingId is set, maybe it's just one record.
        // But let's assume editing replaces the whole group if we delete old and insert new.
        // For now, we will just delete the old ones with the same meeting name and recreate them.
        
        // Find existing to delete
        const existingCal = calendars.find(c => c.id === editingId);
        if (existingCal) {
           await supabase.from('annual_calendars').delete().eq('meeting_name', existingCal.meeting_name).eq('fiscal_year', existingCal.fiscal_year);
        }
      } 
      
      // Cartesian product logic
      const newPlans: Partial<AnnualCalendar>[] = [];
      for (const divId of formData.division_ids) {
        for (const mtId of formData.meeting_type_ids) {
          for (const cityId of formData.preferred_city_ids) {
            for (const month of formData.months) {
              newPlans.push({
                division_id: divId,
                meeting_type_id: mtId,
                preferred_city_id: cityId,
                month: month,
                expected_pax: formData.expected_pax,
                meeting_name: formData.meeting_name,
                fiscal_year: formData.fiscal_year,
                status: 'DRAFT'
              });
            }
          }
        }
      }
      
      await planningRepository.createAnnualCalendars(newPlans);

      setIsCreating(false);
      setEditingId(null);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleEdit = (group: any) => {
    setFormData({
      cluster_ids: group.cluster_ids,
      division_ids: group.division_ids,
      meeting_type_ids: group.meeting_type_ids,
      preferred_city_ids: group.city_ids,
      months: group.months,
      expected_pax: group.expected_pax,
      meeting_name: group.meeting_name,
      fiscal_year: group.fiscal_year,
    });
    setEditingId(group.id); // arbitrary ID from the group
    setIsCreating(true);
  };

  const handlePublish = async (meetingName: string) => {
    try {
      const groupCalendars = calendars.filter(c => c.meeting_name === meetingName);
      for (const cal of groupCalendars) {
        await planningRepository.updateAnnualCalendar(cal.id, { status: 'PUBLISHED' });
      }
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateMonthly = async (meetingName: string) => {
    try {
      const groupCalendars = calendars.filter(c => c.meeting_name === meetingName);
      const newMonthlyPlans = groupCalendars.map(calendar => ({
        annual_calendar_id: calendar.id,
        division_id: calendar.division_id,
        meeting_name: calendar.meeting_name,
        meeting_type_id: calendar.meeting_type_id,
        city_id: calendar.preferred_city_id,
        planned_month: calendar.month,
        expected_pax: calendar.expected_pax,
        status: 'DRAFT' as any,
      }));
      await planningRepository.createMonthlyPlans(newMonthlyPlans);
      alert('Monthly Plans generated successfully!');
    } catch (e) {
      console.error(e);
      alert('Error generating monthly plans');
    }
  };

  // Group calendars by meeting_name
  const groupedCalendars = useMemo(() => {
    const groups: Record<string, any> = {};
    calendars.forEach(cal => {
      const key = cal.meeting_name;
      if (!groups[key]) {
        groups[key] = {
          id: cal.id, // pick one id for keying
          meeting_name: key,
          fiscal_year: cal.fiscal_year,
          expected_pax: cal.expected_pax,
          status: cal.status, // assume group has same status
          cluster_ids: new Set<string>(),
          cluster_names: new Set<string>(),
          division_ids: new Set<string>(),
          division_names: new Set<string>(),
          meeting_type_ids: new Set<string>(),
          meeting_type_names: new Set<string>(),
          city_ids: new Set<string>(),
          city_names: new Set<string>(),
          months: new Set<number>(),
        };
      }
      
      const g = groups[key];
      if (cal.division?.cluster_id) {
        g.cluster_ids.add(cal.division.cluster_id);
        g.cluster_names.add(cal.division.cluster?.cluster_name || '');
      }
      g.division_ids.add(cal.division_id);
      g.division_names.add(cal.division?.division_name || '');
      g.meeting_type_ids.add(cal.meeting_type_id);
      g.meeting_type_names.add(cal.meeting_type?.meeting_type_name || '');
      g.city_ids.add(cal.preferred_city_id);
      g.city_names.add(cal.city?.city_name || '');
      g.months.add(cal.month);
    });
    
    return Object.values(groups).map(g => ({
      ...g,
      cluster_ids: Array.from(g.cluster_ids),
      cluster_names: Array.from(g.cluster_names).filter(Boolean),
      division_ids: Array.from(g.division_ids),
      division_names: Array.from(g.division_names).filter(Boolean),
      meeting_type_ids: Array.from(g.meeting_type_ids),
      meeting_type_names: Array.from(g.meeting_type_names).filter(Boolean),
      city_ids: Array.from(g.city_ids),
      city_names: Array.from(g.city_names).filter(Boolean),
      months: Array.from(g.months).sort((a: any, b: any) => a - b),
    }));
  }, [calendars]);

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    label: new Date(2026, i).toLocaleString('default', { month: 'long' })
  }));

  if (loading) return <div className="p-8">Loading Annual Calendar...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-vms-primary-dark">Annual Calendar (2026-27)</h2>
        {!isSalesHead && (
          <Button onClick={() => {
            setFormData({
              cluster_ids: [],
              division_ids: [],
              meeting_type_ids: [],
              preferred_city_ids: [],
              months: [],
              expected_pax: 50,
              meeting_name: '',
              fiscal_year: '2026-27'
            });
            setEditingId(null);
            setIsCreating(true);
          }}><Plus className="w-4 h-4 mr-2" /> Add Plan</Button>
        )}
      </div>

      {isCreating && (
        <div className="bg-vms-gray-50 p-4 rounded-lg mb-6 border border-vms-gray-200">
          <h3 className="font-bold text-vms-primary-dark mb-4">{editingId ? 'Edit Annual Plan' : 'New Annual Plan'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-vms-gray-500 uppercase mb-1">Meeting Name</label>
              <input type="text" className="w-full p-2 border rounded" value={formData.meeting_name} onChange={e => setFormData({...formData, meeting_name: e.target.value})} placeholder="e.g. Sales Kickoff" />
            </div>
            <div>
              <MultiSelect 
                label="Cluster"
                options={clusters.map(c => ({ id: c.id, label: c.cluster_name }))}
                selectedIds={formData.cluster_ids}
                onChange={ids => setFormData({ ...formData, cluster_ids: ids as string[], division_ids: [] })}
                placeholder="Select Clusters"
              />
            </div>
            <div>
              <MultiSelect 
                label="Division"
                options={divisions.filter(d => formData.cluster_ids.length === 0 || formData.cluster_ids.includes(d.cluster_id)).map(d => ({ id: d.id, label: d.division_name }))}
                selectedIds={formData.division_ids}
                onChange={ids => setFormData({ ...formData, division_ids: ids as string[] })}
                placeholder="Select Divisions"
              />
            </div>
            <div>
              <MultiSelect 
                label="Meeting Type"
                options={meetingTypes.map(m => ({ id: m.id, label: m.meeting_type_name }))}
                selectedIds={formData.meeting_type_ids}
                onChange={ids => setFormData({ ...formData, meeting_type_ids: ids as string[] })}
                placeholder="Select Types"
              />
            </div>
            <div>
              <MultiSelect 
                label="Preferred City"
                options={cities.map(c => ({ id: c.id, label: c.city_name }))}
                selectedIds={formData.preferred_city_ids}
                onChange={ids => setFormData({ ...formData, preferred_city_ids: ids as string[] })}
                placeholder="Select Cities"
              />
            </div>
            <div>
              <MultiSelect 
                label="Expected Month"
                options={monthOptions}
                selectedIds={formData.months}
                onChange={ids => setFormData({ ...formData, months: ids as number[] })}
                placeholder="Select Months"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-vms-gray-500 uppercase mb-1">Expected PAX (Per Event)</label>
              <input type="number" className="w-full p-2 border rounded" value={formData.expected_pax} onChange={e => setFormData({...formData, expected_pax: parseInt(e.target.value)})} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCreateOrUpdate}>{editingId ? 'Update Plan' : 'Save Plan'}</Button>
            <Button variant="outline" onClick={() => { setIsCreating(false); setEditingId(null); }}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-vms-gray-200">
              <th className="py-3 px-4 font-bold text-xs uppercase text-vms-gray-500">Meeting Name</th>
              <th className="py-3 px-4 font-bold text-xs uppercase text-vms-gray-500">Cluster</th>
              <th className="py-3 px-4 font-bold text-xs uppercase text-vms-gray-500">Division</th>
              <th className="py-3 px-4 font-bold text-xs uppercase text-vms-gray-500">Type</th>
              <th className="py-3 px-4 font-bold text-xs uppercase text-vms-gray-500">City</th>
              <th className="py-3 px-4 font-bold text-xs uppercase text-vms-gray-500">Month</th>
              <th className="py-3 px-4 font-bold text-xs uppercase text-vms-gray-500">PAX</th>
              <th className="py-3 px-4 font-bold text-xs uppercase text-vms-gray-500">Status</th>
              {!isSalesHead && (
                <th className="py-3 px-4 font-bold text-xs uppercase text-vms-gray-500 text-right">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {groupedCalendars.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-vms-gray-500">No annual plans defined.</td>
              </tr>
            ) : groupedCalendars.map(group => (
              <tr key={group.meeting_name} className="border-b border-vms-gray-100 hover:bg-vms-gray-50 transition-colors">
                <td className="py-3 px-4 font-bold text-vms-primary-dark">{group.meeting_name}</td>
                <td className="py-3 px-4 text-sm">
                  <div className="flex flex-wrap gap-1">
                    {group.cluster_names.map((n: string) => <Badge key={n} variant="secondary" className="text-[10px] py-0">{n}</Badge>)}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm">
                  <div className="flex flex-wrap gap-1">
                    {group.division_names.map((n: string) => <Badge key={n} variant="outline" className="text-[10px] py-0">{n}</Badge>)}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm">
                  <div className="flex flex-wrap gap-1">
                    {group.meeting_type_names.map((n: string) => <Badge key={n} variant="secondary" className="text-[10px] py-0 bg-blue-50 text-blue-700">{n}</Badge>)}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm">
                  <div className="flex flex-wrap gap-1">
                    {group.city_names.map((n: string) => <Badge key={n} variant="secondary" className="text-[10px] py-0 bg-purple-50 text-purple-700">{n}</Badge>)}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm">
                  <div className="flex flex-wrap gap-1">
                    {group.months.map((m: number) => <Badge key={m} variant="secondary" className="text-[10px] py-0 bg-amber-50 text-amber-700">{new Date(2026, m - 1).toLocaleString('default', { month: 'short' })}</Badge>)}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm font-bold">{group.expected_pax}</td>
                <td className="py-3 px-4">
                  {group.status === 'PUBLISHED' 
                    ? <Badge className="bg-green-100 text-green-800 border-green-200 shadow-none"><CheckCircle className="w-3 h-3 mr-1"/> Published</Badge>
                    : <Badge className="bg-gray-100 text-gray-800 border-gray-200 shadow-none">Draft</Badge>
                  }
                </td>
                {!isSalesHead && (
                  <td className="py-3 px-4 text-right">
                    {group.status === 'DRAFT' && (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(group)} className="text-xs py-1 h-7 mr-2 text-vms-gray-600 hover:text-vms-primary">
                          <Edit2 className="w-3 h-3 mr-1" /> Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handlePublish(group.meeting_name)} className="text-xs py-1 h-7">
                          <Send className="w-3 h-3 mr-1" /> Publish
                        </Button>
                      </>
                    )}
                    {group.status === 'PUBLISHED' && (
                      <Button variant="secondary" size="sm" onClick={() => handleGenerateMonthly(group.meeting_name)} className="text-xs py-1 h-7 bg-vms-primary text-white ml-2">
                        <PlusCircle className="w-3 h-3 mr-1" /> Create Monthly
                      </Button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
