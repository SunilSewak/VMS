import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { CalendarDays, LayoutDashboard, FileSpreadsheet, CheckSquare, Building, CheckCircle, Play } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function PlanningLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  
  const isSalesHead = user?.role === 'SALES_HEAD';

  const tabs = isSalesHead ? [
    { id: '', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'reviews', label: 'My Reviews', icon: CheckSquare },
  ] : [
    { id: '', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'annual', label: 'Annual Calendar', icon: CalendarDays },
    { id: 'cluster-approvals', label: 'Cluster Approvals', icon: CheckSquare },
    { id: 'monthly', label: 'Monthly Planning', icon: FileSpreadsheet },
    { id: 'venue-allocation', label: 'Venue Allocation', icon: Building },
    { id: 'reviews', label: 'Sales Head Review', icon: CheckCircle },
    { id: 'generate', label: 'Generate Events', icon: Play },
  ];

  return (
    <div className="w-full h-full animate-in fade-in duration-500">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-vms-primary-dark tracking-tight">Planning Module</h1>
        <p className="text-vms-gray-600 mt-1 text-sm font-medium">Manage annual planning and monthly operational execution.</p>
      </div>

      <div className="flex border-b border-vms-gray-200 mb-6">
        {tabs.map((tab) => {
          const path = `/planning${tab.id ? `/${tab.id}` : ''}`;
          const isActive = location.pathname === path || (tab.id === '' && location.pathname === '/planning');
          return (
            <button
              key={tab.id}
              onClick={() => navigate(path)}
              className={`px-6 py-3 font-bold text-sm border-b-2 flex items-center transition-colors ${
                isActive 
                  ? 'border-vms-primary text-vms-primary' 
                  : 'border-transparent text-vms-gray-500 hover:text-vms-primary hover:border-vms-primary/30'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <Card className="border-0 shadow-sm min-h-[500px]">
        <Outlet />
      </Card>
    </div>
  );
}
