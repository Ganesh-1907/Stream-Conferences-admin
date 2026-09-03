import { useState } from 'react';
import { useAppStore } from '@/store/app-store';
import { UserPlus, Mail, User, ShieldAlert, Plus, Power, PowerOff } from 'lucide-react';
import { API_BASE, SERVER_ORIGIN } from '@/lib/constants';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export function MentorsTab() {
  const { mentors, refreshData, user } = useAppStore();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState<string | null>(null);

  const handleRegisterMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setMessage('');
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/register-mentor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': user.role,
          'x-user-name': user.username,
        },
        body: JSON.stringify({ firstName, lastName, email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register mentor');
      }

      setMessage(data.message || 'Mentor registered successfully! Welcome email sent.');
      setFirstName('');
      setLastName('');
      setEmail('');
      await refreshData();
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setMessage('');
    setErrorMsg('');
    setFirstName('');
    setLastName('');
    setEmail('');
  };

  const handleToggleStatus = async (username: string) => {
    if (!user) return;
    setTogglingStatus(username);
    try {
      const res = await fetch(`${API_BASE}/auth/mentors/${encodeURIComponent(username)}/toggle-status`, {
        method: 'PUT',
        headers: {
          'x-user-role': user.role,
          'x-user-name': user.username,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update status');
      }

      await refreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to update mentor status');
    } finally {
      setTogglingStatus(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Manage Mentors</h1>
          <p className="text-sm text-muted-foreground">
            Register new mentors to the platform and monitor existing mentor accounts.
          </p>
        </div>
        <button
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold rounded-lg text-sm transition"
        >
          <Plus size={16} />
          Add Mentor
        </button>
      </div>

      {/* Mentors List Table - Full Width */}
      <div className="border border-foreground/10 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-muted text-muted-foreground font-semibold border-b border-foreground/10">
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Designation</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mentors.map((m) => (
              <tr key={m._id} className="border-b border-foreground/5 hover:bg-foreground/[0.02] last:border-0">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {m.avatar ? (
                      <img
                        src={m.avatar.startsWith('http') ? m.avatar : `${SERVER_ORIGIN}${m.avatar}`}
                        alt={m.fullName}
                        className="w-8 h-8 rounded-full object-cover border border-foreground/10"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-secondary/15 text-secondary flex items-center justify-center font-bold text-xs">
                        {m.fullName.charAt(0)}
                      </div>
                    )}
                    <span className="font-semibold text-foreground">{m.fullName}</span>
                  </div>
                </td>
                <td className="p-4 text-xs text-muted-foreground">{m.username}</td>
                <td className="p-4 text-xs text-foreground font-medium">{m.title || 'Not set'}</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    m.isActive !== false 
                      ? 'bg-green-500/10 text-green-500' 
                      : 'bg-red-500/10 text-red-500'
                  }`}>
                    {m.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleToggleStatus(m.username)}
                    disabled={togglingStatus === m.username}
                    className={`p-2 rounded-lg transition duration-150 cursor-pointer ${
                      m.isActive !== false
                        ? 'hover:bg-red-500/10 text-red-500 hover:text-red-600'
                        : 'hover:bg-green-500/10 text-green-500 hover:text-green-600'
                    } disabled:opacity-50`}
                    title={m.isActive !== false ? 'Deactivate login' : 'Activate login'}
                  >
                    {togglingStatus === m.username ? (
                      <span className="text-xs">...</span>
                    ) : m.isActive !== false ? (
                      <PowerOff size={16} />
                    ) : (
                      <Power size={16} />
                    )}
                  </button>
                </td>
              </tr>
            ))}
            {mentors.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  No mentors registered yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Mentor Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="text-secondary" size={20} />
              Register New Mentor
            </DialogTitle>
            <DialogDescription>
              Enter the mentor's name and email address. An account will be created, and their login credentials will be dispatched to their email automatically.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRegisterMentor} className="space-y-4 mt-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                <User size={12} /> First Name
              </label>
              <input
                required
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Charles"
                className="w-full px-4 py-2 bg-muted/20 border border-foreground/10 rounded-lg text-sm focus:outline-none focus:border-secondary transition text-foreground"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                <User size={12} /> Last Name
              </label>
              <input
                required
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Sterling"
                className="w-full px-4 py-2 bg-muted/20 border border-foreground/10 rounded-lg text-sm focus:outline-none focus:border-secondary transition text-foreground"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                <Mail size={12} /> Email Address
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. mentor@example.com"
                className="w-full px-4 py-2 bg-muted/20 border border-foreground/10 rounded-lg text-sm focus:outline-none focus:border-secondary transition text-foreground"
              />
            </div>

            {message && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs rounded-lg text-center font-medium">
                {message}
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-xs rounded-lg text-center font-medium flex items-center gap-2 justify-center">
                <ShieldAlert size={14} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleCloseDialog}
                className="flex-1 py-2.5 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-lg text-sm transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold rounded-lg text-sm transition flex items-center justify-center gap-2"
              >
                {loading ? 'Registering...' : 'Register Mentor'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
