import { EquipmentForm } from '@/components/admin/EquipmentForm'

export default function AdminEquipmentNewPage() {
  return (
    <div>
      <div className="section-mark mb-6">
        <span className="num">новое</span>
        <span className="rule" />
      </div>

      <h1
        className="font-display font-light text-bone tracking-[-0.03em] leading-[0.95] mb-10"
        style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)' }}
      >
        Новое оборудование
      </h1>

      <EquipmentForm
        mode="create"
        initial={{
          studioSlug: 'moscow',
          category: '',
          name: '',
          model: '',
          description: '',
          image: null,
          sortOrder: 0,
        }}
      />
    </div>
  )
}