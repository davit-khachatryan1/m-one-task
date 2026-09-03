import { Building2, Globe2, Mail, MapPin, Phone } from 'lucide-react'
import type { ReactNode } from 'react'
import type { User } from '../../types/user'

interface UserDetailsGridProps {
  user: User
}

function DetailCard({ title, icon, children, wide = false }: { title: string; icon: ReactNode; children: ReactNode; wide?: boolean }) {
  return (
    <section className={`rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 ${wide ? 'lg:col-span-2' : ''}`}>
      <div className="mb-5 flex items-center gap-2.5">
        <span className="grid h-8 w-8 place-items-center rounded-lg border border-neutral-200 bg-neutral-100 text-brand-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-brand-400" aria-hidden="true">
          {icon}
        </span>
        <h2 className="text-base font-semibold text-neutral-950 dark:text-white">{title}</h2>
      </div>
      {children}
    </section>
  )
}

const termClassName = 'text-xs font-medium text-neutral-500 dark:text-neutral-400'
const definitionClassName = 'mt-1 min-w-0 break-words text-sm leading-6 text-neutral-800 dark:text-neutral-200'

export function UserDetailsGrid({ user }: UserDetailsGridProps) {
  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-2">
      <DetailCard title="Contact details" icon={<Mail size={17} />}>
        <dl className="grid gap-5">
          <div className="flex gap-3">
            <Mail className="mt-0.5 shrink-0 text-neutral-400" aria-hidden="true" size={17} />
            <div className="min-w-0">
              <dt className={termClassName}>Email</dt>
              <dd className={definitionClassName}>
                <a className="text-brand-700 hover:underline hover:underline-offset-2 dark:text-brand-300" href={`mailto:${user.email}`}>
                  {user.email}
                </a>
              </dd>
            </div>
          </div>
          <div className="flex gap-3">
            <Phone className="mt-0.5 shrink-0 text-neutral-400" aria-hidden="true" size={17} />
            <div className="min-w-0">
              <dt className={termClassName}>Phone</dt>
              <dd className={definitionClassName}>
                <a className="text-brand-700 hover:underline hover:underline-offset-2 dark:text-brand-300" href={`tel:${user.phone}`}>
                  {user.phone}
                </a>
              </dd>
            </div>
          </div>
          <div className="flex gap-3">
            <Globe2 className="mt-0.5 shrink-0 text-neutral-400" aria-hidden="true" size={17} />
            <div className="min-w-0">
              <dt className={termClassName}>Website</dt>
              <dd className={definitionClassName}>
                <a className="text-brand-700 hover:underline hover:underline-offset-2 dark:text-brand-300" href={`https://${user.website}`} target="_blank" rel="noreferrer">
                  {user.website}
                </a>
              </dd>
            </div>
          </div>
        </dl>
      </DetailCard>

      <DetailCard title="Location" icon={<MapPin size={17} />}>
        <address className="text-sm leading-7 text-neutral-800 not-italic dark:text-neutral-200">
          {user.address.street}, {user.address.suite}
          <br />
          {user.address.city}, {user.address.zipcode}
        </address>
        <div className="mt-5 rounded-lg bg-neutral-50 px-4 py-3 dark:bg-neutral-950">
          <p className={termClassName}>Coordinates</p>
          <p className="mt-1 font-mono text-xs text-neutral-600 dark:text-neutral-400">
            {user.address.geo.lat}, {user.address.geo.lng}
          </p>
        </div>
      </DetailCard>

      <DetailCard title="Company" icon={<Building2 size={17} />} wide>
        <dl className="grid gap-5 md:grid-cols-3">
          <div>
            <dt className={termClassName}>Organization</dt>
            <dd className={definitionClassName}>{user.company.name}</dd>
          </div>
          <div>
            <dt className={termClassName}>Focus</dt>
            <dd className={definitionClassName}>{user.company.catchPhrase}</dd>
          </div>
          <div>
            <dt className={termClassName}>Business</dt>
            <dd className={definitionClassName}>{user.company.bs}</dd>
          </div>
        </dl>
      </DetailCard>
    </div>
  )
}
