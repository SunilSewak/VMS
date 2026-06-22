import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { planningRepository } from './repositories/planningRepository';
import { supabase } from '@/lib/supabase';

export function PlanningDashboard() {
  const [stats, setStats] = useState({
    annualPlans: 0,
    monthlyAwaitingReview: 0,
    approvedPlans: 0,
    eventsGenerated: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const annualPlans = await planningRepository.getAnnualCalendars();
        const monthlyPlans = await planningRepository.getMonthlyPlans();
        
        // Count generated events
        const { data: events } = await supabase.from('events').select('id').not('monthly_plan_id', 'is', null);

        setStats({
          annualPlans: annualPlans.length,
          monthlyAwaitingReview: monthlyPlans.filter(p => p.status === 'SHARED').length,
          approvedPlans: monthlyPlans.filter(p => p.status === 'APPROVED').length,
          eventsGenerated: events ? events.length : 0
        });
      } catch (err) {
        console.error("Failed to load planning stats", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) return <div className="p-8 text-vms-gray-500">Loading Dashboard...</div>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-vms-primary-dark mb-6">Planning & Execution KPI</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card className="rounded-2xl border-0 shadow-sm ring-1 ring-vms-gray-200">
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <p className="text-sm font-bold text-vms-gray-500 uppercase tracking-widest mb-4">Total Annual Plans</p>
            <p className="text-5xl font-black text-vms-primary-dark">{stats.annualPlans}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-0 shadow-sm ring-1 ring-vms-gray-200 bg-amber-50">
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <p className="text-sm font-bold text-amber-600 uppercase tracking-widest mb-4">Pending Reviews</p>
            <p className="text-5xl font-black text-amber-600">{stats.monthlyAwaitingReview}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-0 shadow-sm ring-1 ring-vms-gray-200 bg-green-50">
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <p className="text-sm font-bold text-green-600 uppercase tracking-widest mb-4">Approved Plans</p>
            <p className="text-5xl font-black text-green-600">{stats.approvedPlans}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-0 shadow-sm ring-1 ring-vms-gray-200 bg-purple-50">
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <p className="text-sm font-bold text-purple-600 uppercase tracking-widest mb-4">Events Generated</p>
            <p className="text-5xl font-black text-purple-600">{stats.eventsGenerated}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
