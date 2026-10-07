import { useState } from 'react';
import {
  Image as ImageIcon,
  Sparkles,
  Layout,
  Globe,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Maximize2,
  Layers,
  ArrowRight,
} from 'lucide-react';

export function ImageGuidelinesTab() {
  const [activeSection, setActiveSection] = useState<'microsite' | 'main'>('microsite');

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-foreground/10">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 shadow-xs">
            <ImageIcon size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-['Space_Grotesk'] text-foreground tracking-tight">
              Image Dimensions & Aspect Ratio Guidelines
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Official design standards for uploading images across Stream Conferences websites to ensure visual symmetry and high quality.
            </p>
          </div>
        </div>

        {/* Section Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-foreground/5 rounded-xl border border-foreground/10 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveSection('microsite')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeSection === 'microsite'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'
            }`}
          >
            <Layout size={16} />
            <span>Micro Website</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('main')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeSection === 'main'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'
            }`}
          >
            <Globe size={16} />
            <span>Main Website</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* 3:2 Ratio Card */}
        <div className="p-5 rounded-2xl bg-card border border-emerald-500/20 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center px-3 py-1 rounded-lg font-mono font-bold text-sm bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
              3:2 Aspect Ratio
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              Standard Content
            </span>
          </div>
          <div className="mt-3">
            <h3 className="font-bold text-base text-foreground">All Content & Media Cards</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tracks, Venue photos, City attractions, Blog cards, Sponsor/Partner cards, and Conference listings.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-foreground/10 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Recommended:</span>
            <span className="font-mono font-bold text-primary">1200 × 800 px</span>
          </div>
        </div>

        {/* 3:1 Ratio Card */}
        <div className="p-5 rounded-2xl bg-card border border-blue-500/20 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center px-3 py-1 rounded-lg font-mono font-bold text-sm bg-blue-500/15 text-blue-700 dark:text-blue-300">
              3:1 Aspect Ratio
            </span>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
              Panoramic
            </span>
          </div>
          <div className="mt-3">
            <h3 className="font-bold text-base text-foreground">Hero Header Carousel</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Edge-to-edge panoramic slide banners in the microsite hero header section.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-foreground/10 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Exact Size:</span>
            <span className="font-mono font-bold text-primary">1500 × 500 px</span>
          </div>
        </div>

        {/* 1:1 Ratio Card */}
        <div className="p-5 rounded-2xl bg-card border border-purple-500/20 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center px-3 py-1 rounded-lg font-mono font-bold text-sm bg-purple-500/15 text-purple-700 dark:text-purple-300">
              1:1 Aspect Ratio
            </span>
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
              Square / Circle
            </span>
          </div>
          <div className="mt-3">
            <h3 className="font-bold text-base text-foreground">Hero Logo & Avatars</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Microsite hero logo emblem disc, speaker headshots, and organizing committee profiles.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-foreground/10 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Recommended:</span>
            <span className="font-mono font-bold text-primary">500 × 500 / 400 × 400 px</span>
          </div>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            {activeSection === 'microsite' ? (
              <>
                <Layout size={18} className="text-primary" />
                <span>Micro Website (Conference Subdomains) Specifications</span>
              </>
            ) : (
              <>
                <Globe size={18} className="text-primary" />
                <span>Main Website (streamconferences.com) Specifications</span>
              </>
            )}
          </h2>
          <span className="text-xs text-muted-foreground">
            {activeSection === 'microsite' ? 'Subdomain event portals' : 'Primary domain'}
          </span>
        </div>

        <div className="rounded-2xl border border-foreground/10 overflow-hidden bg-card shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-muted/60 text-foreground font-bold uppercase text-[11px] tracking-wider border-b border-foreground/10">
                <tr>
                  <th className="py-3.5 px-5">Section / Location</th>
                  <th className="py-3.5 px-5">Image Purpose</th>
                  <th className="py-3.5 px-5 text-center">Aspect Ratio</th>
                  <th className="py-3.5 px-5">Recommended Dimensions</th>
                  <th className="py-3.5 px-5">Format & Instructions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/5 text-foreground">
                {activeSection === 'microsite' ? (
                  <>
                    <tr className="hover:bg-foreground/[0.02] transition-colors">
                      <td className="py-4 px-5 font-semibold">Hero Header (Home)</td>
                      <td className="py-4 px-5">Banner Carousel</td>
                      <td className="py-4 px-5 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-mono font-bold text-xs bg-blue-500/15 text-blue-700 dark:text-blue-300">
                          3:1
                        </span>
                      </td>
                      <td className="py-4 px-5 font-mono font-bold text-primary">
                        1500 × 500 px
                      </td>
                      <td className="py-4 px-5 text-xs text-muted-foreground">
                        Wide panoramic banners. Keep main text centered within safe area.
                      </td>
                    </tr>

                    <tr className="hover:bg-foreground/[0.02] transition-colors">
                      <td className="py-4 px-5 font-semibold">Hero Disc (Home)</td>
                      <td className="py-4 px-5">Conference Logo Emblem</td>
                      <td className="py-4 px-5 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-mono font-bold text-xs bg-purple-500/15 text-purple-700 dark:text-purple-300">
                          1:1 Circle
                        </span>
                      </td>
                      <td className="py-4 px-5 font-mono font-bold text-primary">
                        500 × 500 px
                      </td>
                      <td className="py-4 px-5 text-xs text-muted-foreground">
                        Square or transparent PNG. Fits circle edge-to-edge without borders.
                      </td>
                    </tr>

                    <tr className="hover:bg-foreground/[0.02] transition-colors">
                      <td className="py-4 px-5 font-semibold">Conference Tracks</td>
                      <td className="py-4 px-5">Track Thumbnail & Detail Banner</td>
                      <td className="py-4 px-5 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-mono font-bold text-xs bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                          3:2
                        </span>
                      </td>
                      <td className="py-4 px-5 font-mono font-bold text-primary">
                        1200 × 800 px <span className="text-muted-foreground font-normal text-xs">(or 900×600)</span>
                      </td>
                      <td className="py-4 px-5 text-xs text-muted-foreground">
                        Used across Home Top Tracks and dedicated <code className="bg-foreground/5 px-1 py-0.5 rounded font-mono">/tracks</code> page.
                      </td>
                    </tr>

                    <tr className="hover:bg-foreground/[0.02] transition-colors">
                      <td className="py-4 px-5 font-semibold">Venue Showcase</td>
                      <td className="py-4 px-5">Main Venue Featured Photo</td>
                      <td className="py-4 px-5 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-mono font-bold text-xs bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                          3:2
                        </span>
                      </td>
                      <td className="py-4 px-5 font-mono font-bold text-primary">
                        1200 × 800 px <span className="text-muted-foreground font-normal text-xs">(or 1500×1000)</span>
                      </td>
                      <td className="py-4 px-5 text-xs text-muted-foreground">
                        Primary showcase photo on <code className="bg-foreground/5 px-1 py-0.5 rounded font-mono">/venue</code> page.
                      </td>
                    </tr>

                    <tr className="hover:bg-foreground/[0.02] transition-colors">
                      <td className="py-4 px-5 font-semibold">Venue Gallery</td>
                      <td className="py-4 px-5">4 Sub Photos Gallery</td>
                      <td className="py-4 px-5 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-mono font-bold text-xs bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                          3:2
                        </span>
                      </td>
                      <td className="py-4 px-5 font-mono font-bold text-primary">
                        900 × 600 px <span className="text-muted-foreground font-normal text-xs">(or 1200×800)</span>
                      </td>
                      <td className="py-4 px-5 text-xs text-muted-foreground">
                        Rendered in side-by-side gallery grid below main venue.
                      </td>
                    </tr>

                    <tr className="hover:bg-foreground/[0.02] transition-colors">
                      <td className="py-4 px-5 font-semibold">City Attractions</td>
                      <td className="py-4 px-5">Attractions / Highlights</td>
                      <td className="py-4 px-5 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-mono font-bold text-xs bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                          3:2
                        </span>
                      </td>
                      <td className="py-4 px-5 font-mono font-bold text-primary">
                        900 × 600 px <span className="text-muted-foreground font-normal text-xs">(or 1200×800)</span>
                      </td>
                      <td className="py-4 px-5 text-xs text-muted-foreground">
                        City tourism & attraction cards marquee.
                      </td>
                    </tr>

                    <tr className="hover:bg-foreground/[0.02] transition-colors">
                      <td className="py-4 px-5 font-semibold">Sponsors & Exhibitors</td>
                      <td className="py-4 px-5">Partner & Sponsor Logos</td>
                      <td className="py-4 px-5 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-mono font-bold text-xs bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                          3:2
                        </span>
                      </td>
                      <td className="py-4 px-5 font-mono font-bold text-primary">
                        600 × 400 px
                      </td>
                      <td className="py-4 px-5 text-xs text-muted-foreground">
                        Transparent PNG recommended with logo centered.
                      </td>
                    </tr>

                    <tr className="hover:bg-foreground/[0.02] transition-colors">
                      <td className="py-4 px-5 font-semibold">Media Partners</td>
                      <td className="py-4 px-5">Media Partner Logos</td>
                      <td className="py-4 px-5 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-mono font-bold text-xs bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                          3:2
                        </span>
                      </td>
                      <td className="py-4 px-5 font-mono font-bold text-primary">
                        600 × 400 px
                      </td>
                      <td className="py-4 px-5 text-xs text-muted-foreground">
                        Transparent PNG recommended with logo centered.
                      </td>
                    </tr>

                    <tr className="hover:bg-foreground/[0.02] transition-colors">
                      <td className="py-4 px-5 font-semibold">Speakers & Committee</td>
                      <td className="py-4 px-5">Speaker & Chair Headshots</td>
                      <td className="py-4 px-5 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-mono font-bold text-xs bg-purple-500/15 text-purple-700 dark:text-purple-300">
                          1:1 Circle
                        </span>
                      </td>
                      <td className="py-4 px-5 font-mono font-bold text-primary">
                        400 × 400 px
                      </td>
                      <td className="py-4 px-5 text-xs text-muted-foreground">
                        Square portraits cropped to circle. Centered face headshots.
                      </td>
                    </tr>
                  </>
                ) : (
                  <>
                    <tr className="hover:bg-foreground/[0.02] transition-colors">
                      <td className="py-4 px-5 font-semibold">Conferences Grid (/conferences)</td>
                      <td className="py-4 px-5">Conference Card Cover Image</td>
                      <td className="py-4 px-5 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-mono font-bold text-xs bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                          3:2
                        </span>
                      </td>
                      <td className="py-4 px-5 font-mono font-bold text-primary">
                        1200 × 800 px <span className="text-muted-foreground font-normal text-xs">(or 900×600)</span>
                      </td>
                      <td className="py-4 px-5 text-xs text-muted-foreground">
                        Displayed on main conference listings grid and filter cards.
                      </td>
                    </tr>

                    <tr className="hover:bg-foreground/[0.02] transition-colors">
                      <td className="py-4 px-5 font-semibold">Home Featured Conferences</td>
                      <td className="py-4 px-5">Home Upcoming Event Cards</td>
                      <td className="py-4 px-5 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-mono font-bold text-xs bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                          3:2
                        </span>
                      </td>
                      <td className="py-4 px-5 font-mono font-bold text-primary">
                        1200 × 800 px
                      </td>
                      <td className="py-4 px-5 text-xs text-muted-foreground">
                        Featured conference cards on homepage.
                      </td>
                    </tr>

                    <tr className="hover:bg-foreground/[0.02] transition-colors">
                      <td className="py-4 px-5 font-semibold">Blogs Listing (/blog)</td>
                      <td className="py-4 px-5">Blog Post Card Banner</td>
                      <td className="py-4 px-5 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-mono font-bold text-xs bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                          3:2
                        </span>
                      </td>
                      <td className="py-4 px-5 font-mono font-bold text-primary">
                        1200 × 800 px <span className="text-muted-foreground font-normal text-xs">(or 900×600)</span>
                      </td>
                      <td className="py-4 px-5 text-xs text-muted-foreground">
                        Blog card header thumbnail on main blogs page.
                      </td>
                    </tr>

                    <tr className="hover:bg-foreground/[0.02] transition-colors">
                      <td className="py-4 px-5 font-semibold">Home Field Notes</td>
                      <td className="py-4 px-5">Latest Blog Preview Cards</td>
                      <td className="py-4 px-5 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-mono font-bold text-xs bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                          3:2
                        </span>
                      </td>
                      <td className="py-4 px-5 font-mono font-bold text-primary">
                        1200 × 800 px
                      </td>
                      <td className="py-4 px-5 text-xs text-muted-foreground">
                        Homepage preview cards for latest insights and notes.
                      </td>
                    </tr>

                    <tr className="hover:bg-foreground/[0.02] transition-colors">
                      <td className="py-4 px-5 font-semibold">Blog Article Details</td>
                      <td className="py-4 px-5">Article Hero Banner</td>
                      <td className="py-4 px-5 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-mono font-bold text-xs bg-blue-500/15 text-blue-700 dark:text-blue-300">
                          Wide Banner
                        </span>
                      </td>
                      <td className="py-4 px-5 font-mono font-bold text-primary">
                        1600 × 600 px
                      </td>
                      <td className="py-4 px-5 text-xs text-muted-foreground">
                        Full width header banner on individual blog article pages.
                      </td>
                    </tr>

                    <tr className="hover:bg-foreground/[0.02] transition-colors">
                      <td className="py-4 px-5 font-semibold">Sponsors & Partners (/sponsors)</td>
                      <td className="py-4 px-5">Partner Logo Cards</td>
                      <td className="py-4 px-5 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-mono font-bold text-xs bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                          3:2
                        </span>
                      </td>
                      <td className="py-4 px-5 font-mono font-bold text-primary">
                        600 × 400 px
                      </td>
                      <td className="py-4 px-5 text-xs text-muted-foreground">
                        Transparent PNG recommended with logo centered.
                      </td>
                    </tr>

                    <tr className="hover:bg-foreground/[0.02] transition-colors">
                      <td className="py-4 px-5 font-semibold">Mentors & Team Profiles</td>
                      <td className="py-4 px-5">Profile Headshot</td>
                      <td className="py-4 px-5 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-mono font-bold text-xs bg-purple-500/15 text-purple-700 dark:text-purple-300">
                          1:1 Circle
                        </span>
                      </td>
                      <td className="py-4 px-5 font-mono font-bold text-primary">
                        400 × 400 px
                      </td>
                      <td className="py-4 px-5 text-xs text-muted-foreground">
                        Square photo cropped to circle avatar.
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Visual Aspect Ratio Diagrams */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Layers size={18} className="text-primary" />
          <span>Visual Aspect Ratio Comparison</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 3:1 Visual */}
          <div className="p-5 rounded-2xl bg-card border border-foreground/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-foreground">3:1 Wide Banner</span>
              <span className="font-mono text-xs text-muted-foreground">1500 × 500 px</span>
            </div>
            <div className="w-full aspect-[3/1] rounded-xl bg-blue-500/10 border-2 border-dashed border-blue-500/40 flex items-center justify-center text-blue-600 dark:text-blue-400 font-mono font-bold text-sm shadow-inner">
              3 : 1
            </div>
            <p className="text-xs text-muted-foreground">
              Used exclusively for top hero carousel banners.
            </p>
          </div>

          {/* 3:2 Visual */}
          <div className="p-5 rounded-2xl bg-card border border-foreground/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-foreground">3:2 Content Standard</span>
              <span className="font-mono text-xs text-muted-foreground">1200 × 800 px</span>
            </div>
            <div className="w-full aspect-[3/2] rounded-xl bg-emerald-500/10 border-2 border-dashed border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-mono font-bold text-sm shadow-inner">
              3 : 2
            </div>
            <p className="text-xs text-muted-foreground">
              Standard for all content, tracks, venues, and media cards.
            </p>
          </div>

          {/* 1:1 Visual */}
          <div className="p-5 rounded-2xl bg-card border border-foreground/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-foreground">1:1 Square / Circle</span>
              <span className="font-mono text-xs text-muted-foreground">500 × 500 px</span>
            </div>
            <div className="w-full aspect-[3/2] flex items-center justify-center">
              <div className="h-full aspect-square rounded-full bg-purple-500/10 border-2 border-dashed border-purple-500/40 flex items-center justify-center text-purple-600 dark:text-purple-400 font-mono font-bold text-sm shadow-inner">
                1 : 1
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Used for circular hero logo discs and speaker headshots.
            </p>
          </div>
        </div>
      </div>

      {/* Best Practices Checklist */}
      <div className="rounded-2xl border border-primary/25 bg-primary/5 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Sparkles className="text-primary shrink-0" size={22} />
          <div>
            <h3 className="font-bold text-base text-foreground">Best Practices for High Quality & Fast Loading</h3>
            <p className="text-xs text-muted-foreground">Follow these guidelines when preparing images for upload.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-card border border-foreground/10 space-y-1.5">
            <div className="flex items-center gap-2 text-primary font-bold text-xs">
              <CheckCircle2 size={16} />
              <span>Transparent Logos</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Always upload logos in <strong>PNG</strong> format with a transparent background so they seamlessly adapt to both Light and Dark themes.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-card border border-foreground/10 space-y-1.5">
            <div className="flex items-center gap-2 text-primary font-bold text-xs">
              <CheckCircle2 size={16} />
              <span>3:2 Symmetry</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Maintaining <strong>3:2 ratio</strong> (1200×800 px) across tracks, venue photos, and blog cards ensures equal heights and no awkward gaps.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-card border border-foreground/10 space-y-1.5">
            <div className="flex items-center gap-2 text-primary font-bold text-xs">
              <CheckCircle2 size={16} />
              <span>File Size & Formats</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Keep file sizes under <strong>2MB</strong>. Recommended formats are <strong>WebP</strong>, <strong>JPG</strong>, and <strong>PNG</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
