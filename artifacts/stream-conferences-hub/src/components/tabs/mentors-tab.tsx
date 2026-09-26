import { useState } from 'react';
import { useAppStore } from '@/store/app-store';
import {
  UserPlus,
  Mail,
  User,
  ShieldAlert,
  Plus,
  Power,
  PowerOff,
  Copy,
  Check,
  KeyRound,
  Pencil,
  Trash2,
  Briefcase,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { API_BASE, SERVER_ORIGIN } from '@/lib/constants';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export function MentorsTab() {
  const { mentors, refreshData, user, confirmModal, alertModal, openImagePreview } = useAppStore();
  const [editingMentor, setEditingMentor] = useState<any | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [title, setTitle] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState<string | null>(null);
  const [deletingMentor, setDeletingMentor] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingMentor(null);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
    setTitle('');
    setIsActive(true);
    setMessage('');
    setErrorMsg('');
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (m: any) => {
    setEditingMentor(m);
    const parts = (m.fullName || '').trim().split(' ');
    const fName = parts[0] || '';
    const lName = parts.slice(1).join(' ') || '';
    setFirstName(fName);
    setLastName(lName);
    setEmail(m.email || m.username || '');
    setPassword(m.password || '');
    setTitle(m.title || '');
    setIsActive(m.isActive !== false);
    setMessage('');
    setErrorMsg('');
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingMentor(null);
    setMessage('');
    setErrorMsg('');
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
    setTitle('');
    setIsActive(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setMessage('');
    setErrorMsg('');
    setLoading(true);

    try {
      if (editingMentor) {
        // Edit Mentor
        const res = await fetch(`${API_BASE}/mentors/${encodeURIComponent(editingMentor.username)}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-user-role': user.role,
            'x-user-name': user.username,
          },
          body: JSON.stringify({
            firstName,
            lastName,
            fullName: `${firstName} ${lastName}`.trim(),
            email,
            password,
            title,
            isActive,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to update mentor');
        }

        setMessage(data.message || 'Mentor updated successfully!');
        await refreshData();
        setTimeout(() => {
          handleCloseDialog();
        }, 800);
      } else {
        // Register New Mentor
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
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
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
      alertModal({ title: 'Status Update Failed', message: err.message || 'Failed to update mentor status', type: 'danger' });
    } finally {
      setTogglingStatus(null);
    }
  };

  const handleDeleteMentor = async (m: any) => {
    if (!user) return;
    const ok = await confirmModal({
      title: 'Delete Mentor Account',
      message: `Are you sure you want to permanently delete mentor "${m.fullName || m.username}"?\nThis will delete their user login account and profile.`,
      type: 'danger',
      confirmText: 'Delete Mentor',
      cancelText: 'Cancel',
    });
    if (!ok) return;

    setDeletingMentor(m.username);
    try {
      const res = await fetch(`${API_BASE}/mentors/${encodeURIComponent(m.username)}`, {
        method: 'DELETE',
        headers: {
          'x-user-role': user.role,
          'x-user-name': user.username,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete mentor');
      }

      await refreshData();
    } catch (err: any) {
      alertModal({ title: 'Delete Failed', message: err.message || 'Failed to delete mentor', type: 'danger' });
    } finally {
      setDeletingMentor(null);
    }
  };

  const handleCopy = async (text: string, fieldKey: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldKey);
      setTimeout(() => setCopiedField(null), 1500);
    } catch {
      // fallback
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manage Mentors</h1>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold rounded-lg text-sm transition cursor-pointer"
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
              <th className="p-4">Password</th>
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
                        onClick={() => openImagePreview(m.avatar, `${m.fullName || m.username} - Photo`)}
                        className="w-8 h-8 rounded-full object-cover border border-foreground/10 cursor-pointer hover:scale-110 hover:ring-2 hover:ring-primary transition"
                        title="Click to view full photo"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-secondary/15 text-secondary flex items-center justify-center font-bold text-xs">
                        {(m.fullName || m.username || 'M').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="font-semibold text-foreground">{m.fullName || m.username}</span>
                  </div>
                </td>
                <td className="p-4 text-xs text-foreground font-medium">{m.email || m.username}</td>
                <td className="p-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-foreground font-mono bg-muted/50 px-2 py-1 rounded border border-foreground/5">{m.password || '—'}</span>
                    {m.password && (
                      <button
                        onClick={() => handleCopy(m.password!, `pw-${m._id}`)}
                        className="p-1 rounded hover:bg-foreground/5 text-muted-foreground hover:text-foreground transition cursor-pointer"
                        title="Copy password"
                      >
                        {copiedField === `pw-${m._id}` ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                      </button>
                    )}
                  </div>
                </td>
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
                  <div className="flex items-center justify-end gap-1">
                    {/* Edit Mentor Button */}
                    <button
                      onClick={() => handleOpenEdit(m)}
                      className="p-2 rounded-lg hover:bg-blue-500/10 text-blue-500 hover:text-blue-600 transition duration-150 cursor-pointer"
                      title="Edit mentor"
                    >
                      <Pencil size={15} />
                    </button>

                    {/* Toggle Active / Deactivate Status */}
                    <button
                      onClick={() => handleToggleStatus(m.username)}
                      disabled={togglingStatus === m.username}
                      className={`p-2 rounded-lg transition duration-150 cursor-pointer ${
                        m.isActive !== false
                          ? 'hover:bg-amber-500/10 text-amber-500 hover:text-amber-600'
                          : 'hover:bg-green-500/10 text-green-500 hover:text-green-600'
                      } disabled:opacity-50`}
                      title={m.isActive !== false ? 'Deactivate login' : 'Activate login'}
                    >
                      {togglingStatus === m.username ? (
                        <span className="text-xs">...</span>
                      ) : m.isActive !== false ? (
                        <PowerOff size={15} />
                      ) : (
                        <Power size={15} />
                      )}
                    </button>

                    {/* Delete Mentor Button */}
                    <button
                      onClick={() => handleDeleteMentor(m)}
                      disabled={deletingMentor === m.username}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 hover:text-red-600 transition duration-150 cursor-pointer disabled:opacity-50"
                      title="Delete mentor"
                    >
                      {deletingMentor === m.username ? (
                        <span className="text-xs">...</span>
                      ) : (
                        <Trash2 size={15} />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {mentors.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  No mentors registered yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Mentor Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingMentor ? (
                <>
                  <Pencil className="text-secondary" size={20} />
                  <span>Edit Mentor</span>
                </>
              ) : (
                <>
                  <UserPlus className="text-secondary" size={20} />
                  <span>Register New Mentor</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {editingMentor
                ? "Update the mentor's details, designation, password, and account login status."
                : "Enter the mentor's name and email address. An account will be created, and their login credentials will be dispatched to their email automatically."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
                  <User size={12} /> First Name
                </label>
                <input
                  required
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Charles"
                  className="w-full px-3.5 py-2 bg-muted/20 border border-foreground/10 rounded-lg text-sm focus:outline-none focus:border-secondary transition text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
                  <User size={12} /> Last Name
                </label>
                <input
                  required
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Sterling"
                  className="w-full px-3.5 py-2 bg-muted/20 border border-foreground/10 rounded-lg text-sm focus:outline-none focus:border-secondary transition text-foreground"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
                <Mail size={12} /> Email Address (Username)
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. mentor@example.com"
                className="w-full px-3.5 py-2 bg-muted/20 border border-foreground/10 rounded-lg text-sm focus:outline-none focus:border-secondary transition text-foreground"
              />
            </div>

            {editingMentor && (
              <>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
                    <Briefcase size={12} /> Designation / Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Head of Bioinformatics"
                    className="w-full px-3.5 py-2 bg-muted/20 border border-foreground/10 rounded-lg text-sm focus:outline-none focus:border-secondary transition text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
                    <KeyRound size={12} /> Password
                  </label>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-3.5 py-2 bg-muted/20 border border-foreground/10 rounded-lg text-sm font-mono focus:outline-none focus:border-secondary transition text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Account Status
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                      <input
                        type="radio"
                        name="mentor-status"
                        checked={isActive === true}
                        onChange={() => setIsActive(true)}
                        className="text-secondary focus:ring-secondary"
                      />
                      <span className="flex items-center gap-1 text-green-600 font-bold text-xs">
                        <CheckCircle2 size={13} /> Active
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                      <input
                        type="radio"
                        name="mentor-status"
                        checked={isActive === false}
                        onChange={() => setIsActive(false)}
                        className="text-secondary focus:ring-secondary"
                      />
                      <span className="flex items-center gap-1 text-red-500 font-bold text-xs">
                        <XCircle size={13} /> Inactive (Deactivated)
                      </span>
                    </label>
                  </div>
                </div>
              </>
            )}

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
                className="flex-1 py-2.5 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-lg text-sm transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold rounded-lg text-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading
                  ? editingMentor
                    ? 'Saving...'
                    : 'Registering...'
                  : editingMentor
                  ? 'Save Changes'
                  : 'Register Mentor'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
