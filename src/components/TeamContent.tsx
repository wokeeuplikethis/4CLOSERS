'use client'

import { SocialLinks } from '@/components/StreamingLinks'

interface Member {
  id: string
  name: string
  nickname: string | null
  position: string
  timeInTeam: string | null
  experience: string | null
  bio: string | null
  photo: string | null
  telegramUrl: string | null
  vkUrl: string | null
  instagramUrl: string | null
}

export function TeamContent({ members }: { members: Member[] }) {
  return (
    <section className="band pt-6 lg:pt-10">
      <div className="shell">
        <header className="mb-10">
          <div className="section-mark">
            <span className="num">02</span>
            <span className="rule" />
          </div>
          <h1
            className="font-display font-light text-bone tracking-[-0.03em] leading-[0.95]"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
          >
            Команда
          </h1>
          <p className="text-sm lg:text-base text-bone/60 mt-3 max-w-[68ch]">
            Те, кто делает звук. Без них ничего бы не звучало.
          </p>
        </header>

        {members.length === 0 ? (
          <p className="text-bone/50 text-sm">Пока пусто.</p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {members.map((m) => (
              <article
                key={m.id}
                className="panel overflow-hidden flex flex-col transition-transform duration-300 ease-out hover:-translate-y-1"
                >
                {/* Фото */}
                <div className="aspect-square bg-void border-b border-ash overflow-hidden shrink-0">
                  {m.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.photo}
                      alt={m.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-slate">
                      <span className="font-display text-5xl text-bone/15">
                        {m.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Текст */}
                <div className="p-4 flex flex-col gap-2 flex-1">
                  <div>
                    <h3 className="font-display text-base text-bone tracking-[-0.02em] leading-tight">
                      {m.name}
                    </h3>
                    {m.nickname && (
                      <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-bone/40 mt-1">
                        {m.nickname}
                      </div>
                    )}
                  </div>

                  <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-signal">
                    {m.position}
                  </div>

                  {(m.timeInTeam || m.experience) && (
                    <div className="space-y-0.5 pt-2 border-t border-ash">
                      {m.timeInTeam && (
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-bone/40">
                            в команде
                          </span>
                          <span className="font-mono text-[11px] text-bone/70">
                            {m.timeInTeam}
                          </span>
                        </div>
                      )}
                      {m.experience && (
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-bone/40">
                            стаж
                          </span>
                          <span className="font-mono text-[11px] text-bone/70">
                            {m.experience}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {m.bio && (
                    <p className="text-[12px] leading-snug text-bone/55 mt-1 line-clamp-3">
                      {m.bio}
                    </p>
                  )}

                  <SocialLinks
                    size="sm"
                    className="mt-auto pt-3"
                    links={[
                      { href: m.telegramUrl, label: 'Telegram', icon: 'telegram', color: 'FFFFFF' },
                      { href: m.vkUrl, label: 'ВКонтакте', icon: 'vk', color: 'FFFFFF' },
                      { href: m.instagramUrl, label: 'Instagram', icon: 'instagram', color: 'FFFFFF' },
                    ]}
                  />
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}