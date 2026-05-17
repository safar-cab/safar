import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, User, FileText, Banknote, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/cn';

interface SelectOption { value: string; label: string; sublabel?: string }

const TABS = [
  { id: 'personal', label: 'Personal', icon: User },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'banking', label: 'Banking', icon: Banknote },
  { id: 'employment', label: 'Employment', icon: Briefcase },
];

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const LICENSE_TYPES = [
  { value: 'LMV', label: 'LMV (Light Motor Vehicle)' },
  { value: 'HMV', label: 'HMV (Heavy Motor Vehicle)' },
  { value: 'BOTH', label: 'Both LMV & HMV' },
];

const SHIFT_OPTIONS = [
  { value: 'morning', label: 'Morning (6AM-2PM)' },
  { value: 'evening', label: 'Evening (2PM-10PM)' },
  { value: 'night', label: 'Night (10PM-6AM)' },
  { value: 'flexible', label: 'Flexible (Any)' },
];

const VEHICLE_TYPES = [
  { value: 'sedan', label: 'Sedan' },
  { value: 'suv', label: 'SUV' },
  { value: 'hatchback', label: 'Hatchback' },
  { value: 'tempo_traveller', label: 'Tempo Traveller' },
  { value: 'luxury', label: 'Luxury' },
];

const LANGUAGES = [
  { value: 'hindi', label: 'Hindi' },
  { value: 'english', label: 'English' },
  { value: 'marathi', label: 'Marathi' },
  { value: 'gujarati', label: 'Gujarati' },
  { value: 'punjabi', label: 'Punjabi' },
  { value: 'tamil', label: 'Tamil' },
  { value: 'telugu', label: 'Telugu' },
];

export function DriverForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [tab, setTab] = useState('personal');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  // User select
  const [userOptions, setUserOptions] = useState<SelectOption[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Form state
  const [form, setForm] = useState({
    userId: '',
    // Personal
    dateOfBirth: '', gender: '', fatherName: '', photo: '',
    currentAddress: { street: '', city: '', state: '', pincode: '' },
    permanentAddress: { street: '', city: '', state: '', pincode: '' },
    sameAddress: false,
    emergencyContact: { name: '', phone: '', relation: '' },
    // Documents
    licenseNumber: '', licenseType: 'LMV', licenseExpiry: '',
    licensePhotos: [] as string[],
    aadhaarNumber: '', aadhaarPhotos: [] as string[],
    panNumber: '', panPhoto: '',
    policeVerificationPhoto: '',
    // Banking
    bankDetails: { accountNumber: '', ifscCode: '', bankName: '', accountHolderName: '', upiId: '' },
    // Employment
    yearsOfExperience: '', vehicleTypesComfortable: [] as string[],
    languagesSpoken: [] as string[],
    knowsLocalRoutes: false,
    previousEmployer: '',
    reference: { name: '', phone: '' },
    expectedSalary: '', availableShift: 'flexible', joinDate: '',
  });

  const fetchDriverUsers = useCallback(async (query: string) => {
    setUsersLoading(true);
    try {
      const params: Record<string, string> = {};
      if (query) params.search = query;
      const res = await api.get('/lookup/driver-users', { params }) as unknown as { _id: string; name: string; phone: string }[];
      setUserOptions(res.map((u) => ({ value: u._id, label: u.name, sublabel: u.phone })));
    } catch { setUserOptions([]); }
    finally { setUsersLoading(false); }
  }, []);

  useEffect(() => { fetchDriverUsers(''); }, [fetchDriverUsers]);

  // Load existing driver for edit
  useEffect(() => {
    if (isEdit && id) {
      setFetching(true);
      api.get(`/admin/drivers/${id}`)
        .then((res: unknown) => {
          const d = res as Record<string, unknown>;
          const uid = d.userId as Record<string, string> | string;
          setForm((prev) => ({
            ...prev,
            userId: typeof uid === 'object' ? uid._id : String(uid || ''),
            dateOfBirth: d.dateOfBirth ? String(d.dateOfBirth).slice(0, 10) : '',
            gender: String(d.gender || ''),
            fatherName: String(d.fatherName || ''),
            photo: String(d.photo || ''),
            currentAddress: (d.currentAddress as typeof prev.currentAddress) || prev.currentAddress,
            permanentAddress: (d.permanentAddress as typeof prev.permanentAddress) || prev.permanentAddress,
            emergencyContact: (d.emergencyContact as typeof prev.emergencyContact) || prev.emergencyContact,
            licenseNumber: String(d.licenseNumber || ''),
            licenseType: String(d.licenseType || 'LMV'),
            licenseExpiry: d.licenseExpiry ? String(d.licenseExpiry).slice(0, 10) : '',
            licensePhotos: (d.licensePhotos as string[]) || [],
            aadhaarNumber: String(d.aadhaarNumber || ''),
            aadhaarPhotos: (d.aadhaarPhotos as string[]) || [],
            panNumber: String(d.panNumber || ''),
            panPhoto: String(d.panPhoto || ''),
            policeVerificationPhoto: String(d.policeVerificationPhoto || ''),
            bankDetails: (d.bankDetails as typeof prev.bankDetails) || prev.bankDetails,
            yearsOfExperience: String(d.yearsOfExperience || ''),
            vehicleTypesComfortable: (d.vehicleTypesComfortable as string[]) || [],
            languagesSpoken: (d.languagesSpoken as string[]) || [],
            knowsLocalRoutes: Boolean(d.knowsLocalRoutes),
            previousEmployer: String(d.previousEmployer || ''),
            reference: (d.reference as typeof prev.reference) || prev.reference,
            expectedSalary: String(d.expectedSalary || ''),
            availableShift: String(d.availableShift || 'flexible'),
            joinDate: d.joinDate ? String(d.joinDate).slice(0, 10) : '',
          }));
        })
        .catch(() => toast.error('Failed to load driver'))
        .finally(() => setFetching(false));
    }
  }, [id, isEdit]);

  const updateField = useCallback((field: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateNested = useCallback((parent: string, field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [parent]: { ...(prev[parent as keyof typeof prev] as Record<string, string>), [field]: value },
    }));
  }, []);

  const toggleArrayItem = useCallback((field: 'vehicleTypesComfortable' | 'languagesSpoken', value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(value) ? prev[field].filter((v) => v !== value) : [...prev[field], value],
    }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.userId || !form.licenseNumber) {
      toast.error('User and License Number required');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        yearsOfExperience: Number(form.yearsOfExperience) || undefined,
        expectedSalary: Number(form.expectedSalary) || undefined,
        permanentAddress: form.sameAddress ? form.currentAddress : form.permanentAddress,
      };
      if (isEdit) {
        await api.put(`/admin/drivers/${id}`, payload);
        toast.success('Driver updated');
      } else {
        await api.post('/admin/drivers', payload);
        toast.success('Driver created');
      }
      navigate('/admin/drivers');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    } finally { setLoading(false); }
  }, [form, isEdit, id, navigate]);

  if (fetching) {
    return (
      <div>
        <PageHeader title="Loading..." showBack />
        <div className="max-w-3xl space-y-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
      </div>
    );
  }

  const permAddr = form.sameAddress ? form.currentAddress : form.permanentAddress;

  return (
    <div>
      <PageHeader title={isEdit ? 'Edit Driver' : 'Add New Driver'} showBack />

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-neutral-100 rounded-lg mb-6 max-w-3xl">
        {TABS.map((t) => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)}
            className={cn('flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-md transition-all',
              tab === t.id ? 'bg-white text-primary-700 shadow-sm' : 'text-neutral-500 hover:text-neutral-700')}>
            <t.icon className="w-4 h-4" />{t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl bg-white rounded-xl shadow-sm border border-neutral-100 p-6">
        {/* PERSONAL TAB */}
        {tab === 'personal' && (
          <div className="space-y-4">
            <Select label="Select Driver User *" placeholder="Search by name or phone..." options={userOptions} value={form.userId}
              onChange={(v) => updateField('userId', v)} searchable onSearch={fetchDriverUsers} loading={usersLoading} />

            <div className="grid grid-cols-2 gap-4">
              <Input label="Date of Birth" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={(e) => updateField('dateOfBirth', e.target.value)} />
              <Select label="Gender" options={GENDER_OPTIONS} value={form.gender} onChange={(v) => updateField('gender', v)} />
            </div>
            <Input label="Father's / Husband's Name" value={form.fatherName} onChange={(e) => updateField('fatherName', e.target.value)} placeholder="Father's name" />
            <ImageUpload label="Profile Photo" value={form.photo ? [form.photo] : []} onChange={(urls) => updateField('photo', urls[0] || '')} maxFiles={1} folder="drivers/photos" />

            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider pt-2">Current Address</p>
            <Input label="Street" value={form.currentAddress.street} onChange={(e) => updateNested('currentAddress', 'street', e.target.value)} placeholder="Street address" />
            <div className="grid grid-cols-3 gap-4">
              <Input label="City" value={form.currentAddress.city} onChange={(e) => updateNested('currentAddress', 'city', e.target.value)} placeholder="Indore" />
              <Input label="State" value={form.currentAddress.state} onChange={(e) => updateNested('currentAddress', 'state', e.target.value)} placeholder="Madhya Pradesh" />
              <Input label="Pincode" value={form.currentAddress.pincode} onChange={(e) => updateNested('currentAddress', 'pincode', e.target.value)} placeholder="452001" />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.sameAddress} onChange={(e) => updateField('sameAddress', e.target.checked)} className="w-4 h-4 rounded border-neutral-300 text-primary-600" />
              <span className="text-sm text-neutral-700">Permanent address same as current</span>
            </label>

            {!form.sameAddress && (
              <>
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider pt-2">Permanent Address</p>
                <Input label="Street" value={permAddr.street} onChange={(e) => updateNested('permanentAddress', 'street', e.target.value)} />
                <div className="grid grid-cols-3 gap-4">
                  <Input label="City" value={permAddr.city} onChange={(e) => updateNested('permanentAddress', 'city', e.target.value)} />
                  <Input label="State" value={permAddr.state} onChange={(e) => updateNested('permanentAddress', 'state', e.target.value)} />
                  <Input label="Pincode" value={permAddr.pincode} onChange={(e) => updateNested('permanentAddress', 'pincode', e.target.value)} />
                </div>
              </>
            )}

            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider pt-2">Emergency Contact</p>
            <div className="grid grid-cols-3 gap-4">
              <Input label="Name" value={form.emergencyContact.name} onChange={(e) => updateNested('emergencyContact', 'name', e.target.value)} placeholder="Contact name" />
              <Input label="Phone" value={form.emergencyContact.phone} onChange={(e) => updateNested('emergencyContact', 'phone', e.target.value)} placeholder="9876543210" />
              <Input label="Relation" value={form.emergencyContact.relation} onChange={(e) => updateNested('emergencyContact', 'relation', e.target.value)} placeholder="Brother" />
            </div>
          </div>
        )}

        {/* DOCUMENTS TAB */}
        {tab === 'documents' && (
          <div className="space-y-4">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Driving License</p>
            <div className="grid grid-cols-3 gap-4">
              <Input label="License Number *" value={form.licenseNumber} onChange={(e) => updateField('licenseNumber', e.target.value)} placeholder="DL1234567890" />
              <Select label="License Type" options={LICENSE_TYPES} value={form.licenseType} onChange={(v) => updateField('licenseType', v)} />
              <Input label="Expiry Date" type="date" value={form.licenseExpiry} onChange={(e) => updateField('licenseExpiry', e.target.value)} />
            </div>
            <ImageUpload label="License Photos (Front & Back)" value={form.licensePhotos} onChange={(urls) => updateField('licensePhotos', urls)} maxFiles={2} folder="drivers/license" />

            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider pt-4">Aadhaar Card</p>
            <Input label="Aadhaar Number" value={form.aadhaarNumber} onChange={(e) => updateField('aadhaarNumber', e.target.value)} placeholder="1234 5678 9012" />
            <ImageUpload label="Aadhaar Photos (Front & Back)" value={form.aadhaarPhotos} onChange={(urls) => updateField('aadhaarPhotos', urls)} maxFiles={2} folder="drivers/aadhaar" />

            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider pt-4">PAN Card</p>
            <Input label="PAN Number" value={form.panNumber} onChange={(e) => updateField('panNumber', e.target.value)} placeholder="ABCDE1234F" />
            <ImageUpload label="PAN Photo" value={form.panPhoto ? [form.panPhoto] : []} onChange={(urls) => updateField('panPhoto', urls[0] || '')} maxFiles={1} folder="drivers/pan" />

            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider pt-4">Police Verification</p>
            <ImageUpload label="Police Verification Certificate" value={form.policeVerificationPhoto ? [form.policeVerificationPhoto] : []}
              onChange={(urls) => updateField('policeVerificationPhoto', urls[0] || '')} maxFiles={1} folder="drivers/police" />
          </div>
        )}

        {/* BANKING TAB */}
        {tab === 'banking' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Account Holder Name" value={form.bankDetails.accountHolderName} onChange={(e) => updateNested('bankDetails', 'accountHolderName', e.target.value)} placeholder="Full name as per bank" />
              <Input label="Bank Name" value={form.bankDetails.bankName} onChange={(e) => updateNested('bankDetails', 'bankName', e.target.value)} placeholder="State Bank of India" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Account Number" value={form.bankDetails.accountNumber} onChange={(e) => updateNested('bankDetails', 'accountNumber', e.target.value)} placeholder="1234567890" />
              <Input label="IFSC Code" value={form.bankDetails.ifscCode} onChange={(e) => updateNested('bankDetails', 'ifscCode', e.target.value)} placeholder="SBIN0001234" />
            </div>
            <Input label="UPI ID (optional)" value={form.bankDetails.upiId} onChange={(e) => updateNested('bankDetails', 'upiId', e.target.value)} placeholder="driver@upi" />
          </div>
        )}

        {/* EMPLOYMENT TAB */}
        {tab === 'employment' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Years of Experience" type="number" value={form.yearsOfExperience} onChange={(e) => updateField('yearsOfExperience', e.target.value)} placeholder="5" />
              <Select label="Preferred Shift" options={SHIFT_OPTIONS} value={form.availableShift} onChange={(v) => updateField('availableShift', v)} />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Vehicle Types Comfortable With</label>
              <div className="flex flex-wrap gap-2">
                {VEHICLE_TYPES.map((vt) => (
                  <button key={vt.value} type="button" onClick={() => toggleArrayItem('vehicleTypesComfortable', vt.value)}
                    className={cn('px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                      form.vehicleTypesComfortable.includes(vt.value)
                        ? 'bg-primary-50 border-primary-300 text-primary-700' : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300')}>
                    {vt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Languages Spoken</label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((lang) => (
                  <button key={lang.value} type="button" onClick={() => toggleArrayItem('languagesSpoken', lang.value)}
                    className={cn('px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                      form.languagesSpoken.includes(lang.value)
                        ? 'bg-success-50 border-success-300 text-success-700' : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300')}>
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.knowsLocalRoutes} onChange={(e) => updateField('knowsLocalRoutes', e.target.checked)} className="w-4 h-4 rounded border-neutral-300 text-primary-600" />
              <span className="text-sm text-neutral-700">Knows local routes well</span>
            </label>

            <Input label="Previous Employer (optional)" value={form.previousEmployer} onChange={(e) => updateField('previousEmployer', e.target.value)} placeholder="Previous company name" />

            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider pt-2">Reference</p>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Reference Name" value={form.reference.name} onChange={(e) => updateNested('reference', 'name', e.target.value)} placeholder="Reference person" />
              <Input label="Reference Phone" value={form.reference.phone} onChange={(e) => updateNested('reference', 'phone', e.target.value)} placeholder="9876543210" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Expected Salary (₹/month)" type="number" value={form.expectedSalary} onChange={(e) => updateField('expectedSalary', e.target.value)} placeholder="15000" />
              <Input label="Join Date" type="date" value={form.joinDate} onChange={(e) => updateField('joinDate', e.target.value)} />
            </div>
          </div>
        )}

        <div className="flex justify-between mt-6 pt-6 border-t border-neutral-100">
          <div className="flex gap-2">
            {TABS.indexOf(TABS.find((t) => t.id === tab)!) > 0 && (
              <Button variant="outline" type="button" onClick={() => setTab(TABS[TABS.indexOf(TABS.find((t) => t.id === tab)!) - 1].id)}>Previous</Button>
            )}
          </div>
          <div className="flex gap-2">
            {TABS.indexOf(TABS.find((t) => t.id === tab)!) < TABS.length - 1 ? (
              <Button type="button" onClick={() => setTab(TABS[TABS.indexOf(TABS.find((t) => t.id === tab)!) + 1].id)}>Next</Button>
            ) : (
              <Button type="submit" loading={loading}><Save className="w-4 h-4" />{isEdit ? 'Update Driver' : 'Create Driver'}</Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
