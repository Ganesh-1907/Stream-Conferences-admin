import { ArrowRight, CalendarDays, Check, Plus, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { FileUploadCard } from '@/components/file-upload-card';
import { useAppStore } from '@/store/app-store';
import { formatDisplayDate, stringToDate, dateToString } from '@/lib/utils';

export function Wizard() {
  const store = useAppStore();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-1 bg-secondary/10 text-secondary text-xs font-bold rounded-full capitalize">{store.wizardType}</span>
            <span className="text-xs text-muted-foreground">{store.wizardEditId ? 'Editing existing event' : 'New announcement'}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight capitalize">
            {store.wizardEditId ? 'Edit' : 'Add'} {store.wizardType}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Complete the steps below and publish when ready.</p>
        </div>
        <button
          type="button"
          onClick={store.closeWizard}
          className="px-3 py-1.5 bg-muted hover:bg-muted/70 border border-foreground/10 rounded-lg text-xs font-semibold transition duration-150 cursor-pointer"
        >
          Cancel
        </button>
      </div>

      {/* Stepper */}
      <div className="flex flex-wrap gap-2">
        {['Event Info', 'Schedule & Venue', 'Fees', 'Tracks', 'Contact'].map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => i + 1 < store.wizardStep && store.setWizardStep(i + 1)}
            className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition duration-150 cursor-pointer ${
              store.wizardStep === i + 1
                ? 'bg-primary text-primary-foreground'
                : i + 1 < store.wizardStep
                  ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                  : 'bg-muted/40 text-muted-foreground border border-foreground/10'
            }`}
          >
            {i + 1}. {label}
          </button>
        ))}
      </div>

      {/* STEP 1: EVENT INFO + MEDIA */}
      {store.wizardStep === 1 && (
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Title</label>
            <input
              required
              type="text"
              value={store.wizardTitle()}
              onChange={(e) => store.setWizardTitle(e.target.value)}
              placeholder={store.wizardType === 'conference' ? 'e.g. International Conference on Medical Sciences' : 'e.g. Precision systems: turning data into better decisions'}
              className="w-full px-6 py-4 bg-muted/20 border border-foreground/10 rounded-2xl text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition duration-200"
            />
          </div>

          {store.wizardType === 'webinar' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Speaker</label>
              <input
                required
                type="text"
                value={store.webSpeaker}
                onChange={(e) => store.setWebSpeaker(e.target.value)}
                placeholder="e.g. Dr. Amina Rao"
                className="w-full px-6 py-4 bg-muted/20 border border-foreground/10 rounded-2xl text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition duration-200"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Description</label>
            <textarea
              value={store.wizardDesc()}
              onChange={(e) => store.setWizardDesc(e.target.value)}
              placeholder="Short summary/agenda outline..."
              rows={5}
              className="w-full px-6 py-4 bg-muted/20 border border-foreground/10 rounded-2xl text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition duration-200 resize-none"
            />
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Media Assets (Brochure · Banner · Logo)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FileUploadCard title="Brochure" accept=".pdf,image/*" preview={store.wizardMedia().brochurePreview} onSelect={(f) => store.handleMediaUpload('brochure', f)} onClear={() => store.clearMedia('brochure')} />
              <FileUploadCard title="Banner" preview={store.wizardMedia().bannerPreview} onSelect={(f) => store.handleMediaUpload('banner', f)} onClear={() => store.clearMedia('banner')} />
              <FileUploadCard title="Logo" preview={store.wizardMedia().logoPreview} onSelect={(f) => store.handleMediaUpload('logo', f)} onClear={() => store.clearMedia('logo')} />
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: SCHEDULE & VENUE */}
      {store.wizardStep === 2 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Location Type</label>
              <Select
                value={store.wizardIsOnline() ? 'online' : 'offline'}
                onValueChange={(val) => store.setWizardIsOnline(val === 'online')}
              >
                <SelectTrigger className="w-full pl-6 pr-12 py-4 h-auto bg-muted/20 border border-foreground/10 rounded-2xl text-base text-foreground focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition duration-200 text-left flex justify-between items-center cursor-pointer">
                  <SelectValue placeholder="Select Location Type" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border border-foreground/10 bg-card p-1 text-base shadow-2xl z-[100] min-w-[200px]">
                  <SelectItem value="offline" className="rounded-xl py-3 px-4 text-base font-semibold focus:bg-foreground/5 focus:text-foreground cursor-pointer">Offline (Venue)</SelectItem>
                  <SelectItem value="online" className="rounded-xl py-3 px-4 text-base font-semibold focus:bg-foreground/5 focus:text-foreground cursor-pointer">Online (Web link)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {store.wizardIsOnline() ? (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Online Link</label>
                <input
                  required
                  type="text"
                  value={store.wizardOnlineLink()}
                  onChange={(e) => store.setWizardOnlineLink(e.target.value)}
                  placeholder="e.g. https://zoom.us/j/123456789"
                  className="w-full px-6 py-4 bg-muted/20 border border-foreground/10 rounded-2xl text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition duration-200"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Venue Location</label>
                <select
                  required
                  value={store.wizardVenue()}
                  onChange={(e) => store.setWizardVenue(e.target.value)}
                  className="w-full px-6 py-4 bg-muted/20 border border-foreground/10 rounded-2xl text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition duration-200 cursor-pointer"
                >
                  <option value="" disabled>Select a venue</option>
                  {store.venues.map((v) => (
                    <option key={v._id} value={v.name}>{v.name}</option>
                  ))}
                  {store.wizardVenue() && !store.venues.some((v) => v.name === store.wizardVenue()) && (
                    <option value={store.wizardVenue()}>{store.wizardVenue()}</option>
                  )}
                </select>
                {store.venues.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-1">No venues added yet. Add one in the Venues section.</p>
                )}
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="w-full pl-6 pr-12 py-4 bg-muted/20 border border-foreground/10 rounded-2xl text-lg font-semibold text-foreground focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition duration-200 cursor-pointer text-left flex justify-between items-center"
                  >
                    <span>{store.wizardStartDate() ? formatDisplayDate(store.wizardStartDate()) : 'mm/dd/yyyy'}</span>
                    <CalendarDays size={18} className="text-muted-foreground" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="!w-[360px] p-0 rounded-2xl border border-foreground/10 bg-card overflow-hidden shadow-2xl z-[100]" align="start">
                  <Calendar mode="single" selected={stringToDate(store.wizardStartDate())} onSelect={(date) => store.setWizardStartDate(date ? dateToString(date) : '')} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="w-full pl-6 pr-12 py-4 bg-muted/20 border border-foreground/10 rounded-2xl text-lg font-semibold text-foreground focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition duration-200 cursor-pointer text-left flex justify-between items-center"
                  >
                    <span>{store.wizardEndDate() ? formatDisplayDate(store.wizardEndDate()) : 'mm/dd/yyyy'}</span>
                    <CalendarDays size={18} className="text-muted-foreground" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="!w-[360px] p-0 rounded-2xl border border-foreground/10 bg-card overflow-hidden shadow-2xl z-[100]" align="start">
                  <Calendar mode="single" selected={stringToDate(store.wizardEndDate())} onSelect={(date) => store.setWizardEndDate(date ? dateToString(date) : '')} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Times */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Start Time</label>
              <input
                type="time"
                value={store.wizardStartTime()}
                onChange={(e) => store.setWizardStartTime(e.target.value)}
                className="w-full px-6 py-4 bg-muted/20 border border-foreground/10 rounded-2xl text-base text-foreground focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition duration-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">End Time</label>
              <input
                type="time"
                value={store.wizardEndTime()}
                onChange={(e) => store.setWizardEndTime(e.target.value)}
                className="w-full px-6 py-4 bg-muted/20 border border-foreground/10 rounded-2xl text-base text-foreground focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition duration-200"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: FEES */}
      {store.wizardStep === 3 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold tracking-tight">Fee Structure</h3>
              <p className="text-sm text-muted-foreground">Add registration categories and their amounts.</p>
            </div>
            <button type="button" onClick={store.addFeeRow} className="cta-button">
              <Plus size={14} /> Add Fee
            </button>
          </div>

          <div className="border border-foreground/10 rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-muted text-muted-foreground font-semibold border-b border-foreground/10">
                  <th className="p-4">Label</th>
                  <th className="p-4">Amount (₹)</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {store.wizardFees().map((fee, index) => (
                  <tr key={index} className="border-b border-foreground/5 last:border-0">
                    <td className="p-3">
                      <input
                        type="text"
                        value={fee.label}
                        onChange={(e) => store.updateFeeRow(index, 'label', e.target.value)}
                        placeholder="e.g. Student, Regular, Repeater"
                        className="w-full px-4 py-2.5 bg-muted/20 border border-foreground/10 rounded-lg text-sm focus:outline-none focus:border-secondary transition"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        value={fee.amount || ''}
                        onChange={(e) => store.updateFeeRow(index, 'amount', e.target.value)}
                        placeholder="e.g. 200"
                        className="w-full px-4 py-2.5 bg-muted/20 border border-foreground/10 rounded-lg text-sm focus:outline-none focus:border-secondary transition"
                      />
                    </td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => store.removeFeeRow(index)}
                        className="p-1.5 hover:bg-red-500/10 text-red-500 rounded-lg transition cursor-pointer"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
                {store.wizardFees().length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-muted-foreground">
                      No fees added yet. Click "Add Fee" to create a registration category.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* STEP 4: TRACKS */}
      {store.wizardStep === 4 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold tracking-tight">Conference Tracks</h3>
              <p className="text-sm text-muted-foreground">Add the thematic tracks attendees can submit to or follow.</p>
            </div>
            <button type="button" onClick={store.addTrack} className="cta-button">
              <Plus size={14} /> Add Track
            </button>
          </div>

          {store.wizardTracks().map((track, ti) => (
            <div key={ti} className="border border-foreground/10 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-accent">Track {ti + 1}</span>
                <button
                  type="button"
                  onClick={() => store.removeTrack(ti)}
                  className="p-1.5 hover:bg-red-500/10 text-red-500 rounded-lg transition cursor-pointer"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Title</label>
                <input
                  type="text"
                  value={track.title}
                  onChange={(e) => store.updateTrack(ti, 'title', e.target.value)}
                  placeholder="e.g. Artificial Intelligence & Machine Learning"
                  className="w-full px-4 py-2.5 bg-muted/20 border border-foreground/10 rounded-lg text-sm focus:outline-none focus:border-secondary transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Description</label>
                <textarea
                  value={track.description}
                  onChange={(e) => store.updateTrack(ti, 'description', e.target.value)}
                  placeholder="Short description of this track..."
                  rows={2}
                  className="w-full px-4 py-2.5 bg-muted/20 border border-foreground/10 rounded-lg text-sm focus:outline-none focus:border-secondary transition resize-none"
                />
              </div>

              <FileUploadCard
                title="Track Image"
                preview={track.imagePreview || ''}
                onSelect={(f) => store.handleTrackImageUpload(ti, f)}
                onClear={() => {
                  const next = [...store.wizardTracks()];
                  next[ti].image = '';
                  next[ti].imagePreview = '';
                  store.setWizardTracks(next);
                }}
              />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Reference Links</label>
                  <button type="button" onClick={() => store.addReferenceLink(ti)} className="px-2.5 py-1 bg-muted hover:bg-muted/80 border border-foreground/10 rounded-md text-[10px] font-semibold cursor-pointer transition inline-flex items-center gap-1">
                    <Plus size={12} /> Add Link
                  </button>
                </div>
                {track.referenceLinks.map((link, li) => (
                  <div key={li} className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={link.label}
                      onChange={(e) => store.updateReferenceLink(ti, li, 'label', e.target.value)}
                      placeholder="Label (e.g. Official page)"
                      className="flex-1 px-3 py-2 bg-muted/20 border border-foreground/10 rounded-lg text-sm focus:outline-none focus:border-secondary transition"
                    />
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => store.updateReferenceLink(ti, li, 'url', e.target.value)}
                      placeholder="https://..."
                      className="flex-1 px-3 py-2 bg-muted/20 border border-foreground/10 rounded-lg text-sm focus:outline-none focus:border-secondary transition"
                    />
                    <button
                      type="button"
                      onClick={() => store.removeReferenceLink(ti, li)}
                      className="p-1.5 hover:bg-red-500/10 text-red-500 rounded-lg transition cursor-pointer"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
                {track.referenceLinks.length === 0 && (
                  <p className="text-xs text-muted-foreground">No reference links added for this track.</p>
                )}
              </div>
            </div>
          ))}

          {store.wizardTracks().length === 0 && (
            <div className="border border-foreground/10 rounded-xl p-8 text-center text-muted-foreground">
              No tracks added yet. Click "Add Track" to create one.
            </div>
          )}
        </div>
      )}

      {/* STEP 5: ORGANIZER CONTACT */}
      {store.wizardStep === 5 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold tracking-tight">Organizer Contact</h3>
            <p className="text-sm text-muted-foreground">Who should attendees reach out to for this {store.wizardType}?</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Contact Name</label>
              <input
                type="text"
                value={store.wizardOrg().name}
                onChange={(e) => store.setWizardOrg({ ...store.wizardOrg(), name: e.target.value })}
                placeholder="e.g. Dr. Sarah Chen"
                className="w-full px-6 py-4 bg-muted/20 border border-foreground/10 rounded-2xl text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition duration-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Contact Email</label>
              <input
                type="email"
                value={store.wizardOrg().email}
                onChange={(e) => store.setWizardOrg({ ...store.wizardOrg(), email: e.target.value })}
                placeholder="e.g. organizer@example.com"
                className="w-full px-6 py-4 bg-muted/20 border border-foreground/10 rounded-2xl text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition duration-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Contact Phone</label>
              <input
                type="text"
                value={store.wizardOrg().phone}
                onChange={(e) => store.setWizardOrg({ ...store.wizardOrg(), phone: e.target.value })}
                placeholder="e.g. +1 555 010 0200"
                className="w-full px-6 py-4 bg-muted/20 border border-foreground/10 rounded-2xl text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition duration-200"
              />
            </div>
          </div>

          {/* Summary */}
          <div className="bg-muted/20 border border-foreground/10 rounded-xl p-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Review & Publish</h4>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <div><dt className="text-xs text-muted-foreground uppercase tracking-wider">Title</dt><dd className="font-semibold">{store.wizardTitle() || '—'}</dd></div>
              <div><dt className="text-xs text-muted-foreground uppercase tracking-wider">Schedule</dt><dd className="font-semibold">{store.wizardStartDate() ? `${formatDisplayDate(store.wizardStartDate())}${store.wizardEndDate() && store.wizardEndDate() !== store.wizardStartDate() ? ` – ${formatDisplayDate(store.wizardEndDate())}` : ''}` : '—'}{store.wizardStartTime() || store.wizardEndTime() ? ` · ${store.wizardStartTime() || '—'} to ${store.wizardEndTime() || '—'}` : ''}</dd></div>
              <div><dt className="text-xs text-muted-foreground uppercase tracking-wider">Location</dt><dd className="font-semibold">{store.wizardIsOnline() ? `Online · ${store.wizardOnlineLink() || 'TBD'}` : (store.wizardVenue() || '—')}</dd></div>
              <div><dt className="text-xs text-muted-foreground uppercase tracking-wider">Fees</dt><dd className="font-semibold">{store.wizardFees().filter((f) => f.label.trim() && f.amount > 0).map((f) => `${f.label} ₹${f.amount}`).join(', ') || 'None'}</dd></div>
              <div><dt className="text-xs text-muted-foreground uppercase tracking-wider">Tracks</dt><dd className="font-semibold">{store.wizardTracks().filter((t) => t.title.trim()).length || 'None'}</dd></div>
              <div><dt className="text-xs text-muted-foreground uppercase tracking-wider">Organizer</dt><dd className="font-semibold">{store.wizardOrg().name || '—'}{store.wizardOrg().email ? ` (${store.wizardOrg().email})` : ''}</dd></div>
              <div><dt className="text-xs text-muted-foreground uppercase tracking-wider">Assets</dt><dd className="font-semibold">{[store.wizardMedia().brochureUrl && 'Brochure', store.wizardMedia().bannerUrl && 'Banner', store.wizardMedia().logoUrl && 'Logo'].filter(Boolean).join(', ') || 'None'}</dd></div>
            </dl>
          </div>

          {store.wizardError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-sm rounded-lg text-center font-medium">
              {store.wizardError}
            </div>
          )}
        </div>
      )}

      {/* Nav buttons */}
      <div className="pt-4 border-t border-foreground/10 flex justify-between gap-3">
        <button
          type="button"
          onClick={() => (store.wizardStep > 1 ? store.setWizardStep(store.wizardStep - 1) : store.closeWizard())}
          className="ghost-button"
        >
          {store.wizardStep > 1 ? '← Back' : 'Cancel'}
        </button>
        {store.wizardStep < 5 ? (
          <button
            type="button"
            disabled={!store.canGoNext()}
            onClick={() => store.setWizardStep(store.wizardStep + 1)}
            className="cta-button disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next <ArrowRight size={14} />
          </button>
        ) : (
          <button
            type="button"
            disabled={store.wizardSaving}
            onClick={store.submitWizard}
            className="cta-button disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {store.wizardSaving ? 'Saving...' : store.wizardEditId ? 'Save Changes' : 'Publish'} <Check size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
