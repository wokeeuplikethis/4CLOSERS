import { ServiceForm } from '@/components/admin/ServiceForm'

export default function AdminServiceNewPage() {
  return (
    <div>
      <div className="section-mark mb-6">
        <span className="num">новая</span>
        <span className="rule" />
      </div>

      <h1
        className="font-display font-light text-bone tracking-[-0.03em] leading-[0.95] mb-10"
        style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)' }}
      >
        Новая услуга
      </h1>

      <ServiceForm
        mode="create"
        initial={{
          studioSlug: 'moscow',
          name: '',
          slug: '',
          description: '',
          price: 0,
          duration: 60,
          features: [],
          isActive: true,
          sortOrder: 0,
        }}
      />
    </div>
  )
}