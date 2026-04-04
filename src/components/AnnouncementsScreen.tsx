import { BellRing, ExternalLink, Sparkles } from 'lucide-react';
import { Announcement } from '../lib/supabase';

interface AnnouncementsScreenProps {
  announcements: Announcement[];
  loading: boolean;
  onAnnouncementAction: (link?: string | null) => void;
}

const priorityClasses: Record<Announcement['priority'], string> = {
  high: 'border-orange-500/30 bg-orange-500/10 text-orange-200',
  normal: 'border-blue-500/30 bg-blue-500/10 text-blue-200',
  low: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
};

export default function AnnouncementsScreen({
  announcements,
  loading,
  onAnnouncementAction,
}: AnnouncementsScreenProps) {
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
        <div className="mb-8 h-10 w-72 rounded-full bg-gray-800" />
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="overflow-hidden rounded-[24px] border border-gray-800 bg-gray-900/80">
              <div className="h-52 bg-gray-800" />
              <div className="space-y-4 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="h-6 w-32 rounded-full bg-gray-800" />
                  <div className="h-8 w-20 rounded-full bg-gray-800" />
                </div>
                <div className="space-y-2">
                  <div className="h-5 w-3/4 rounded-full bg-gray-800" />
                  <div className="h-4 w-full rounded-full bg-gray-800" />
                  <div className="h-4 w-4/5 rounded-full bg-gray-800" />
                </div>
                <div className="h-10 w-36 rounded-full bg-gray-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-orange-200">
            <Sparkles className="h-4 w-4" />
            Campus updates
          </p>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Announcements & Offers</h1>
        </div>
        <p className="max-w-md text-sm leading-6 text-gray-400">
          See the latest offers, campaigns, and in-app updates broadcast from the admin workspace.
        </p>
      </div>

      {announcements.length === 0 ? (
        <div className="rounded-[28px] border border-gray-800 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800/90 px-6 py-14 text-center shadow-xl shadow-black/20">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-gray-700 bg-gray-800/80">
            <BellRing className="h-10 w-10 text-gray-400" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-white">No active announcements right now</h2>
          <p className="mx-auto max-w-lg text-sm leading-6 text-gray-400">
            New promotions and campus updates will appear here as soon as they are broadcast.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {announcements.map((announcement) => (
            <article
              key={announcement.id}
              className="overflow-hidden rounded-[24px] border border-white/5 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800/95 shadow-xl shadow-black/20"
            >
              {announcement.image_url && (
                <div className="relative h-52 overflow-hidden bg-gray-800">
                  <img
                    src={announcement.image_url}
                    alt={announcement.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
                </div>
              )}

              <div className="p-5">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className={`inline-flex items-center rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] ${priorityClasses[announcement.priority]}`}>
                    {announcement.priority} priority
                  </div>
                  <span className="text-xs uppercase tracking-[0.16em] text-gray-500">
                    {new Date(announcement.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h2 className="mb-3 text-2xl font-bold text-white">{announcement.title}</h2>
                <p className="mb-5 text-sm leading-6 text-gray-400">{announcement.message}</p>

                {(announcement.cta_text || announcement.cta_link) && (
                  <button
                    onClick={() => onAnnouncementAction(announcement.cta_link)}
                    className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
                  >
                    <span>{announcement.cta_text || 'Open announcement'}</span>
                    <ExternalLink className="h-4 w-4" />
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
