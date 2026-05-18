import { useState, useEffect } from 'react';
import {
  MapPin,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  ChevronRight,
  Building2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/cn';

interface StateItem {
  _id: string;
  name: string;
  code: string;
  isActive: boolean;
}

interface CityItem {
  _id: string;
  name: string;
  state: string | { _id: string; name: string };
  isActive: boolean;
}

export function StatesAndCities() {
  const [states, setStates] = useState<StateItem[]>([]);
  const [cities, setCities] = useState<Record<string, CityItem[]>>({});
  const [expandedState, setExpandedState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ states: 0, cities: 0, activeStates: 0, activeCities: 0 });

  // Modals
  const [stateModal, setStateModal] = useState(false);
  const [cityModal, setCityModal] = useState<string | null>(null);
  const [newStateName, setNewStateName] = useState('');
  const [newStateCode, setNewStateCode] = useState('');
  const [newCityName, setNewCityName] = useState('');

  const fetchStates = async () => {
    try {
      const [statesRes, statsRes] = await Promise.all([
        api.get('/admin/locations/states') as Promise<StateItem[]>,
        api.get('/admin/locations/stats') as Promise<typeof stats>,
      ]);
      setStates(statesRes);
      setStats(statsRes);
    } catch {
      toast.error('Failed to load states');
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async (stateId: string) => {
    try {
      const res = (await api.get(
        `/admin/locations/states/${stateId}/cities`,
      )) as CityItem[];
      setCities((prev) => ({ ...prev, [stateId]: res }));
    } catch {
      toast.error('Failed to load cities');
    }
  };

  useEffect(() => {
    fetchStates();
  }, []);

  const handleExpandState = (stateId: string) => {
    if (expandedState === stateId) {
      setExpandedState(null);
    } else {
      setExpandedState(stateId);
      if (!cities[stateId]) {
        fetchCities(stateId);
      }
    }
  };

  const handleCreateState = async () => {
    if (!newStateName.trim() || !newStateCode.trim()) {
      toast.error('Name and code required');
      return;
    }
    try {
      await api.post('/admin/locations/states', {
        name: newStateName.trim(),
        code: newStateCode.trim(),
      });
      toast.success('State created');
      setStateModal(false);
      setNewStateName('');
      setNewStateCode('');
      fetchStates();
    } catch {
      toast.error('Failed to create state');
    }
  };

  const handleToggleState = async (id: string, isActive: boolean) => {
    try {
      await api.put(`/admin/locations/states/${id}/toggle`, { isActive });
      toast.success(isActive ? 'State enabled' : 'State disabled');
      fetchStates();
      if (cities[id]) fetchCities(id);
    } catch {
      toast.error('Failed to toggle state');
    }
  };

  const handleDeleteState = async (id: string) => {
    try {
      await api.delete(`/admin/locations/states/${id}`);
      toast.success('State deleted');
      fetchStates();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete';
      toast.error(msg);
    }
  };

  const handleCreateCity = async () => {
    if (!newCityName.trim() || !cityModal) {
      toast.error('City name required');
      return;
    }
    try {
      await api.post('/admin/locations/cities', {
        name: newCityName.trim(),
        stateId: cityModal,
      });
      toast.success('City created');
      setCityModal(null);
      setNewCityName('');
      fetchCities(expandedState!);
      fetchStates();
    } catch {
      toast.error('Failed to create city');
    }
  };

  const handleToggleCity = async (cityId: string, isActive: boolean) => {
    try {
      await api.put(`/admin/locations/cities/${cityId}/toggle`, { isActive });
      toast.success(isActive ? 'City enabled' : 'City disabled');
      if (expandedState) fetchCities(expandedState);
      fetchStates();
    } catch {
      toast.error('Failed to toggle city');
    }
  };

  const handleDeleteCity = async (cityId: string) => {
    try {
      await api.delete(`/admin/locations/cities/${cityId}`);
      toast.success('City deleted');
      if (expandedState) fetchCities(expandedState);
      fetchStates();
    } catch {
      toast.error('Failed to delete city');
    }
  };

  return (
    <div>
      <PageHeader
        title="States & Cities"
        subtitle="Manage locations for routes"
        actions={
          <Button onClick={() => setStateModal(true)}>
            <Plus className="w-4 h-4" />
            Add State
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total States" value={stats.states} active={stats.activeStates} />
        <StatCard label="Total Cities" value={stats.cities} active={stats.activeCities} />
      </div>

      {/* States list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : states.length === 0 ? (
        <div className="text-center py-16">
          <MapPin className="w-12 h-12 text-neutral-200 mx-auto mb-3" />
          <p className="text-neutral-500 font-medium">No states added</p>
          <p className="text-sm text-neutral-400">Add a state to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {states.map((state) => {
            const isExpanded = expandedState === state._id;
            const stateCities = cities[state._id] || [];

            return (
              <div
                key={state._id}
                className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden"
              >
                {/* State row */}
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-neutral-50 transition-colors"
                  onClick={() => handleExpandState(state._id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-neutral-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-neutral-400" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-neutral-800">{state.name}</p>
                      <span className="text-xs font-mono bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-500">
                        {state.code}
                      </span>
                      {!state.isActive && (
                        <span className="text-xs bg-red-50 text-red-500 px-1.5 py-0.5 rounded">
                          Disabled
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {stateCities.length > 0
                        ? `${stateCities.length} cities`
                        : isExpanded
                          ? 'No cities'
                          : 'Click to expand'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleToggleState(state._id, !state.isActive)}
                      className={cn(
                        'p-1.5 rounded-lg transition-colors',
                        state.isActive
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-neutral-400 hover:bg-neutral-100',
                      )}
                      title={state.isActive ? 'Disable' : 'Enable'}
                    >
                      {state.isActive ? (
                        <ToggleRight className="w-5 h-5" />
                      ) : (
                        <ToggleLeft className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteState(state._id)}
                      className="p-1.5 rounded-lg text-neutral-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Cities */}
                {isExpanded && (
                  <div className="border-t border-neutral-100 bg-neutral-50/50">
                    <div className="px-4 py-2 flex items-center justify-between">
                      <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Cities
                      </p>
                      <button
                        onClick={() => setCityModal(state._id)}
                        className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add City
                      </button>
                    </div>
                    {stateCities.length === 0 ? (
                      <div className="px-4 pb-4 text-center">
                        <p className="text-sm text-neutral-400">No cities in this state</p>
                      </div>
                    ) : (
                      <div className="px-4 pb-3 space-y-1">
                        {stateCities.map((city) => (
                          <div
                            key={city._id}
                            className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-white transition-colors"
                          >
                            <Building2 className="w-3.5 h-3.5 text-neutral-300" />
                            <span
                              className={cn(
                                'text-sm flex-1',
                                city.isActive ? 'text-neutral-700' : 'text-neutral-400 line-through',
                              )}
                            >
                              {city.name}
                            </span>
                            <button
                              onClick={() => handleToggleCity(city._id, !city.isActive)}
                              className={cn(
                                'p-1 rounded transition-colors',
                                city.isActive
                                  ? 'text-green-500 hover:bg-green-50'
                                  : 'text-neutral-300 hover:bg-neutral-100',
                              )}
                            >
                              {city.isActive ? (
                                <ToggleRight className="w-4 h-4" />
                              ) : (
                                <ToggleLeft className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleDeleteCity(city._id)}
                              className="p-1 rounded text-neutral-200 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add State Modal */}
      <Modal
        open={stateModal}
        onClose={() => {
          setStateModal(false);
          setNewStateName('');
          setNewStateCode('');
        }}
        title="Add State"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="State Name"
            placeholder="e.g. Madhya Pradesh"
            value={newStateName}
            onChange={(e) => setNewStateName(e.target.value)}
          />
          <Input
            label="State Code"
            placeholder="e.g. MP"
            value={newStateCode}
            onChange={(e) => setNewStateCode(e.target.value.toUpperCase())}
          />
          <Button className="w-full" onClick={handleCreateState}>
            Create State
          </Button>
        </div>
      </Modal>

      {/* Add City Modal */}
      <Modal
        open={!!cityModal}
        onClose={() => {
          setCityModal(null);
          setNewCityName('');
        }}
        title={`Add City to ${states.find((s) => s._id === cityModal)?.name || ''}`}
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="City Name"
            placeholder="e.g. Indore"
            value={newCityName}
            onChange={(e) => setNewCityName(e.target.value)}
          />
          <Button className="w-full" onClick={handleCreateCity}>
            Add City
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function StatCard({
  label,
  value,
  active,
}: {
  label: string;
  value: number;
  active: number;
}) {
  return (
    <div className="bg-white rounded-xl p-4 border border-neutral-100">
      <p className="text-xs text-neutral-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-neutral-900">{value}</p>
      <p className="text-xs text-green-600 mt-0.5">{active} active</p>
    </div>
  );
}
