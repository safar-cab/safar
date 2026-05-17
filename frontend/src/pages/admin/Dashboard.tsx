import { useEffect, useState } from 'react';
import {
  Users, UserCheck, Car, CalendarCheck,
  CalendarDays, Activity, CheckCircle, IndianRupee,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Skeleton } from '@/components/ui/Skeleton';
import type { DashboardStats } from '@/types';

const PIE_COLORS = ['#F97316', '#3B82F6', '#10B981', '#059669', '#E11D48', '#8B5CF6'];

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueData, setRevenueData] = useState<{ _id: string; revenue: number; count: number }[]>([]);
  const [bookingStats, setBookingStats] = useState<{ _id: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/dashboard/stats'),
      api.get('/admin/dashboard/revenue-chart?days=30'),
      api.get('/admin/dashboard/booking-stats?days=30'),
    ]).then(([s, r, b]) => {
      setStats(s as unknown as DashboardStats);
      setRevenueData(r as unknown as typeof revenueData);
      setBookingStats(b as unknown as typeof bookingStats);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <PageHeader title="Dashboard" subtitle="Overview of your business" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  const formatCurrency = (val: number) => `₹${(val / 100).toLocaleString('en-IN')}`;

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Overview of your business" />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Customers" value={stats?.totalUsers ?? 0} icon={Users} iconBg="bg-primary-50" iconColor="text-primary-600" />
        <StatCard label="Total Drivers" value={stats?.totalDrivers ?? 0} icon={UserCheck} iconBg="bg-success-50" iconColor="text-success-600" />
        <StatCard label="Active Cars" value={stats?.totalCars ?? 0} icon={Car} iconBg="bg-secondary-50" iconColor="text-secondary-600" />
        <StatCard label="Total Bookings" value={stats?.totalBookings ?? 0} icon={CalendarCheck} iconBg="bg-primary-50" iconColor="text-primary-600" />
        <StatCard label="Today's Bookings" value={stats?.todayBookings ?? 0} icon={CalendarDays} iconBg="bg-warning-50" iconColor="text-warning-600" />
        <StatCard label="Active Rides" value={stats?.activeBookings ?? 0} icon={Activity} iconBg="bg-success-50" iconColor="text-success-600" />
        <StatCard label="Completed" value={stats?.completedBookings ?? 0} icon={CheckCircle} iconBg="bg-success-50" iconColor="text-success-600" />
        <StatCard label="Total Revenue" value={formatCurrency(stats?.totalRevenue ?? 0)} icon={IndianRupee} iconBg="bg-secondary-50" iconColor="text-secondary-600" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-100">
          <h3 className="text-base font-semibold text-neutral-900 mb-4">Revenue (Last 30 Days)</h3>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#94A3B8' }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} tickFormatter={(v) => `₹${(v / 100).toLocaleString()}`} />
                <Tooltip formatter={(v: number) => [`₹${(v / 100).toLocaleString()}`, 'Revenue']} labelFormatter={(l) => `Date: ${l}`} />
                <Line type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2} dot={{ r: 3, fill: '#2563EB' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-70 flex items-center justify-center text-neutral-400 text-sm">No revenue data yet</div>
          )}
        </div>

        {/* Booking Stats Pie */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-100">
          <h3 className="text-base font-semibold text-neutral-900 mb-4">Bookings by Status</h3>
          {bookingStats.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={280}>
                <PieChart>
                  <Pie data={bookingStats} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={100} innerRadius={50}>
                    {bookingStats.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {bookingStats.map((item, i) => (
                  <div key={item._id} className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-neutral-600 capitalize">{item._id}</span>
                    <span className="font-semibold text-neutral-900 ml-auto">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-70 flex items-center justify-center text-neutral-400 text-sm">No booking data yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
