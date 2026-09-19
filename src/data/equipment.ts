import { EquipmentItem } from '@/types'

export const equipmentData: Record<'moscow' | 'spb', EquipmentItem[]> = {
  moscow: [
    // Microphones
    { id: 'mic-1', category: 'Microphones', name: 'Neumann U 87 Ai', model: 'U 87 Ai', description: 'Легендарный конденсаторный микрофон. Стандарт индустрии для вокала.', image: '/images/moscow/equipment/u87.jpg', sortOrder: 1 },
    { id: 'mic-2', category: 'Microphones', name: 'Telefunken ELA M 251E', model: 'ELA M 251E', description: 'Винтажный трубный микрофон. Вел벳овый, теплый звук для вокала.', image: '/images/moscow/equipment/ela251.jpg', sortOrder: 2 },
    { id: 'mic-3', category: 'Microphones', name: 'Shure SM7B', model: 'SM7B', description: 'Индустриальный стандарт для рэпа и бродкастинга. Плотный, детальный звук.', image: '/images/moscow/equipment/sm7b.jpg', sortOrder: 3 },
    { id: 'mic-4', category: 'Microphones', name: 'Neumann TLM 103', model: 'TLM 103', description: 'Крупнодиафрагменный конденсатор. Яркий, современный вокальный звук.', image: '/images/moscow/equipment/tlm103.jpg', sortOrder: 4 },
    { id: 'mic-5', category: 'Microphones', name: 'Sony C-800G', model: 'C-800G', description: 'Флагманский трубный микрофон. Нереальная детализация и воздух.', image: '/images/moscow/equipment/c800g.jpg', sortOrder: 5 },

    // Preamps
    { id: 'pre-1', category: 'Preamps', name: 'Neve 1073', model: '1073', description: 'Легендарный преамп. Тепло, насыщенность, легендарный "британский" звук.', image: '/images/moscow/equipment/1073.jpg', sortOrder: 1 },
    { id: 'pre-2', category: 'Preamps', name: 'API 512c', model: '512c', description: 'Американский панч и агрессия. Идеально для рэпа и басов.', image: '/images/moscow/equipment/api512.jpg', sortOrder: 2 },
    { id: 'pre-3', category: 'Preamps', name: 'Manley VoxBox', model: 'VoxBox', description: 'Канальная полоска: преамт + компрессор + EQ + де-эссер. Вокальная станция мечты.', image: '/images/moscow/equipment/voxbox.jpg', sortOrder: 3 },
    { id: 'pre-4', category: 'Preamps', name: 'Chandler TG2', model: 'TG2', description: 'EMI/Abbey Road наследие. Кремовый мид-рейндж и шелковые верха.', image: '/images/moscow/equipment/tg2.jpg', sortOrder: 4 },

    // Audio Interfaces
    { id: 'int-1', category: 'Audio Interfaces', name: 'Antelope Orion 32+', model: 'Orion 32+', description: '32 канала AD/DA с клокингом 64-bit AFC. Мастер-клочек студии.', image: '/images/moscow/equipment/orion32.jpg', sortOrder: 1 },
    { id: 'int-2', category: 'Audio Interfaces', name: 'Apollo x8p', model: 'x8p', description: '8 преампов Unison + UAD-2 QUAD. Реал-тайм обработка на записи.', image: '/images/moscow/equipment/apollo-x8p.jpg', sortOrder: 2 },

    // Monitors
    { id: 'mon-1', category: 'Monitors', name: 'ATC SCM25A Pro', model: 'SCM25A Pro', description: 'Референсные мониторы. Честность, детализация, никакого "раскрашивания".', image: '/images/moscow/equipment/atc-scm25.jpg', sortOrder: 1 },
    { id: 'mon-2', category: 'Monitors', name: 'Focal Trio6 Be', model: 'Trio6 Be', description: 'Трехпутевые мониторы с бериллиевой твитером. Огромная звуковая сцена.', image: '/images/moscow/equipment/focal-trio6.jpg', sortOrder: 2 },
    { id: 'mon-3', category: 'Monitors', name: 'Avantone MixCubes', model: 'MixCubes', description: 'Кубики для проверки микса в моно. Средний диапазон под микроскопом.', image: '/images/moscow/equipment/avantone.jpg', sortOrder: 3 },

    // Outboard
    { id: 'out-1', category: 'Outboard', name: 'Universal Audio 1176LN', model: '1176LN', description: 'Самый быстрый FET-компрессор. Пэнч, агрессия, характер.', image: '/images/moscow/equipment/1176.jpg', sortOrder: 1 },
    { id: 'out-2', category: 'Outboard', name: 'Teletronix LA-2A', model: 'LA-2A', description: 'Оптический трубный компрессор. Магия для вокала и баса.', image: '/images/moscow/equipment/la2a.jpg', sortOrder: 2 },
    { id: 'out-3', category: 'Outboard', name: 'Manley Massive Passive', model: 'Massive Passive', description: 'Параллельный трубный EQ. Музыкальный, вдохновляющий.', image: '/images/moscow/equipment/massive-passive.jpg', sortOrder: 3 },
    { id: 'out-4', category: 'Outboard', name: 'Empirical Labs Distressor', model: 'Distressor', description: 'Новейший классик. От мягкого оптического до агрессивного FET — в одном.', image: '/images/moscow/equipment/distressor.jpg', sortOrder: 4 },
    { id: 'out-5', category: 'Outboard', name: 'Eventide H9000', model: 'H9000', description: 'Флагманский процессор эффектов. Ревербы, дели, питч, модуляция — лучшее в мире.', image: '/images/moscow/equipment/h9000.jpg', sortOrder: 5 },
  ],
  spb: [
    // Microphones
    { id: 'mic-1', category: 'Microphones', name: 'Neumann U 87 Ai', model: 'U 87 Ai', description: 'Стандарт индустрии. Чистота, детальность, универсальность.', image: '/images/spb/equipment/u87.jpg', sortOrder: 1 },
    { id: 'mic-2', category: 'Microphones', name: 'Brauner VM1', model: 'VM1', description: 'Немецкое качество. Невероятная транзиентность и "дорогой" звук.', image: '/images/spb/equipment/vm1.jpg', sortOrder: 2 },
    { id: 'mic-3', category: 'Microphones', name: 'Shure SM7B', model: 'SM7B', description: 'Король рэп-записи. Без лишних деталей — только суть.', image: '/images/spb/equipment/sm7b.jpg', sortOrder: 3 },
    { id: 'mic-4', category: 'Microphones', name: 'AKG C414 XLII', model: 'C414 XLII', description: '9 полярных диаграмм. Универсальный солдат для любой задачи.', image: '/images/spb/equipment/c414.jpg', sortOrder: 4 },
    { id: 'mic-5', category: 'Microphones', name: 'Lauten Audio Atlantis FC-387', model: 'FC-387', description: 'Трубный микрофон с переключаемыми капсюлями. Три цвета в одном.', image: '/images/spb/equipment/atlantis.jpg', sortOrder: 5 },

    // Preamps
    { id: 'pre-1', category: 'Preamps', name: 'Neve 1073', model: '1073', description: 'Легенда, не требующая представления. Тепло и вес.', image: '/images/spb/equipment/1073.jpg', sortOrder: 1 },
    { id: 'pre-2', category: 'Preamps', name: 'Great River MP-2NV', model: 'MP-2NV', description: 'Современная классика на трансформаторах Jensen. Открытость и глубина.', image: '/images/spb/equipment/mp2nv.jpg', sortOrder: 2 },
    { id: 'pre-3', category: 'Preamps', name: 'Avalon VT-737sp', model: 'VT-737sp', description: 'Трубная канальная полоска. Оптикум + EQ + компрессор. Вокальный стандарт.', image: '/images/spb/equipment/vt737.jpg', sortOrder: 3 },
    { id: 'pre-4', category: 'Preamps', name: 'Shadow Hills Mastering Compressor', model: 'Mastering Compressor', description: 'Два режима: Nickel (VCA) и Iron (трансформаторы). Мастеринг-класс.', image: '/images/spb/equipment/shadow-hills.jpg', sortOrder: 4 },

    // Audio Interfaces
    { id: 'int-1', category: 'Audio Interfaces', name: 'Antelope Orion 32 HD', model: 'Orion 32 HD', description: '128 каналов, клокинг Atomic. Сердце цифровой студии.', image: '/images/spb/equipment/orion32hd.jpg', sortOrder: 1 },
    { id: 'int-2', category: 'Audio Interfaces', name: 'Apollo x16', model: 'x16', description: '16 каналов, 2x UAD QUAD. Мощность для больших сессий.', image: '/images/spb/equipment/apollo-x16.jpg', sortOrder: 2 },

    // Monitors
    { id: 'mon-1', category: 'Monitors', name: 'Barefoot Sound Footprint01', model: 'Footprint01', description: 'MEME технология. Невероятная динамика в компактном корпусе.', image: '/images/spb/equipment/barefoot.jpg', sortOrder: 1 },
    { id: 'mon-2', category: 'Monitors', name: 'PMC6-2', model: '6-2', description: 'ATL (Advanced Transmission Line). Бас без порта, честный мид.', image: '/images/spb/equipment/pmc6.jpg', sortOrder: 2 },
    { id: 'mon-3', category: 'Monitors', name: 'Avantone MixCubes', model: 'MixCubes', description: 'Контроль среднего диапазона в моно. Обязательны для любого микса.', image: '/images/spb/equipment/avantone.jpg', sortOrder: 3 },

    // Outboard
    { id: 'out-1', category: 'Outboard', name: 'Universal Audio 1176LN', model: '1176LN', description: 'FET-компрессор №1 в мире. Скорость, характер, пэнч.', image: '/images/spb/equipment/1176.jpg', sortOrder: 1 },
    { id: 'out-2', category: 'Outboard', name: 'Teletronix LA-2A', model: 'LA-2A', description: 'Оптический трубный уровень. Магия для вокала.', image: '/images/spb/equipment/la2a.jpg', sortOrder: 2 },
    { id: 'out-3', category: 'Outboard', name: 'Pultec EQP-1A', model: 'EQP-1A', description: 'Пассивный трубный EQ. Подъем и срез одновременно — только тут.', image: '/images/spb/equipment/pultec.jpg', sortOrder: 3 },
    { id: 'out-4', category: 'Outboard', name: 'Drawmer 1978', model: '1978', description: 'Трехдиапазонный FET-компрессор. Хирургическая точность.', image: '/images/spb/equipment/drawmer.jpg', sortOrder: 4 },
    { id: 'out-5', category: 'Outboard', name: 'Lexicon 480L', model: '480L', description: 'Легендарный реверб. Пространство, в котором живут хиты 90-х и 2000-х.', image: '/images/spb/equipment/lexicon480.jpg', sortOrder: 5 },
  ],
}

export function getEquipment(slug: 'moscow' | 'spb'): EquipmentItem[] {
  return equipmentData[slug].sort((a, b) => a.sortOrder - b.sortOrder)
}

export function getEquipmentByCategory(slug: 'moscow' | 'spb', category: string): EquipmentItem[] {
  return equipmentData[slug].filter(e => e.category === category).sort((a, b) => a.sortOrder - b.sortOrder)
}

export const EQUIPMENT_CATEGORIES = ['Microphones', 'Preamps', 'Audio Interfaces', 'Monitors', 'Outboard'] as const