'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  MapPin,
  Music,
  Mic,
  Headphones,
  Star,
  Calendar,
  Clock,
  Check,
  Send,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCityData } from '@/components/CityDataProvider'
import { useStudio } from '@/components/StudioProvider'
import { StickyCitySwitch } from '@/components/StickyCitySwitch'
import { RoomCard } from '@/components/RoomCard'

const TIME_SLOTS = [
  '10:00', '11:00', '12:00', '13:00', '14:00', '15:00',
  '16:00', '17:00', '18:00', '19:00', '20:00', '21:00',
  '22:00', '23:00', '24:00',
]

const NIGHT_SLOT = 'Ночь (24:00–06:00)'

const HOUR_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8]

/** Локальная дата в формате YYYY-MM-DD (без сдвига часового пояса). */
function toISODate(day: Date): string {
  const year = day.getFullYear()
  const month = String(day.getMonth() + 1).padStart(2, '0')
  const date = String(day.getDate()).padStart(2, '0')
  return `${year}-${month}-${date}`
}

export function BookingsContent() {
  const { all } = useCityData()
  const { currentStudio, user, userLoading } = useStudio()
  const city = currentStudio

  const cityData = all[city]
  const studio = cityData.studio
  const rooms = cityData.rooms
  const services = cityData.services

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [hours, setHours] = useState(1)
  const [showCalendar, setShowCalendar] = useState(false)
  const [formData, setFormData] = useState({ name: '', telegram: '', phone: '', comment: '' })
  const [fieldErrors, setFieldErrors] = useState<{ name?: boolean; phone?: boolean }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const nameRef = useRef<HTMLInputElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId) ?? null

  /** Услуги выбранного помещения: общие для города (roomId = null) + привязанные к комнате. */
  const availableServices = selectedRoom
    ? services.filter((s) => s.roomId === null || s.roomId === selectedRoom.id)
    : []
  const selectedServices = availableServices.filter((s) =>
    selectedServiceIds.includes(s.id)
  )
  const scheduleNeeded = selectedServices.some((s) => s.requiresSchedule)

  /** Оценка суммы: удалённые услуги — фиксированно, сессионные — за каждый час. */
  const remoteTotal = selectedServices
    .filter((s) => !s.requiresSchedule)
    .reduce((sum, s) => sum + s.price, 0)
  const sessionPrice = selectedServices
    .filter((s) => s.requiresSchedule)
    .reduce((sum, s) => sum + s.price, 0)
  const effectiveHours = scheduleNeeded ? hours : 1
  const estimatedTotal = remoteTotal + effectiveHours * sessionPrice

  // Смена города — сброс выбора. В городе с одной комнатой (СПб) она выбирается сразу.
  useEffect(() => {
    const nextRooms = all[currentStudio].rooms
    setSelectedRoomId(nextRooms.length === 1 ? nextRooms[0].id : null)
    setSelectedServiceIds([])
    setSelectedDate(null)
    setSelectedTime('')
    setHours(1)
    setShowCalendar(false)
    setError(null)
    setSubmitted(false)
  }, [all, currentStudio])

  // Имя из профиля — один раз, когда пользователь загрузился, а поле пустое.
  useEffect(() => {
    if (userLoading) return
    const userName = user?.name?.trim()
    if (!userName) return
    setFormData((prev) => (prev.name.trim() ? prev : { ...prev, name: userName }))
  }, [user, userLoading])

  const nextDays = useMemo(() => {
    const days: Date[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    for (let i = 0; i < 60; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() + i)
      days.push(d)
    }
    return days
  }, [])

  const quickDays = nextDays.slice(0, 10)

  const selectRoom = (roomId: string) => {
    setSelectedRoomId(roomId)
    setSelectedServiceIds([])
    setSelectedDate(null)
    setSelectedTime('')
    setHours(1)
    setShowCalendar(false)
    setError(null)
  }

  const toggleService = (serviceId: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    )
    setSelectedDate(null)
    setSelectedTime('')
    setHours(1)
    setShowCalendar(false)
    setError(null)
  }

  const getServiceIcon = (serviceName: string) => {
    const name = serviceName.toLowerCase()
    if (name.includes('запись') || name.includes('вокал')) return Mic
    if (name.includes('сведение') || name.includes('мастеринг')) return Headphones
    if (name.includes('аранжировка') || name.includes('бит')) return Music
    return Star
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setError(null)

    if (!selectedRoom) {
      setError('Выберите студию.')
      return
    }
    if (selectedServices.length === 0) {
      setError('Выберите хотя бы одну услугу.')
      return
    }
    if (scheduleNeeded && (!selectedDate || !selectedTime)) {
      setError('Выберите дату и время для выбранных услуг.')
      return
    }

    // Обязательные поля проверяем до отправки — подсвечиваем красным без общей ошибки.
    const phoneDigits = formData.phone.replace(/\D/g, '')
    const nextFieldErrors: { name?: boolean; phone?: boolean } = {}
    if (!formData.name.trim()) nextFieldErrors.name = true
    if (phoneDigits.length !== 11) nextFieldErrors.phone = true
    if (nextFieldErrors.name || nextFieldErrors.phone) {
      setFieldErrors(nextFieldErrors)
      setError(null)
      if (nextFieldErrors.name) {
        nameRef.current?.focus()
      } else {
        phoneRef.current?.focus()
      }
      return
    }

    setFieldErrors({})
    setIsSubmitting(true)

    const payload = {
      city: currentStudio,
      roomId: selectedRoom.id,
      serviceIds: selectedServices.map((s) => s.id),
      date: scheduleNeeded && selectedDate ? toISODate(selectedDate) : null,
      time: scheduleNeeded
        ? selectedTime === '24:00'
          ? '00:00'
          : selectedTime
        : null,
      hours: effectiveHours,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      telegram: formData.telegram || null,
      comment: formData.comment.trim() || null,
    }

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(json.error ?? 'Не удалось создать заявку. Попробуйте позже.')
        return
      }
      setSubmitted(true)
    } catch {
      setError('Сеть недоступна. Попробуйте ещё раз.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const reset = () => {
    setSelectedRoomId(rooms.length === 1 ? rooms[0].id : null)
    setSelectedServiceIds([])
    setSelectedDate(null)
    setSelectedTime('')
    setHours(1)
    setShowCalendar(false)
    setFormData({
      name: user?.name?.trim() ?? '',
      telegram: '',
      phone: '',
      comment: '',
    })
    setFieldErrors({})
    setError(null)
    setSubmitted(false)
  }

  const roomChosen = rooms.length === 0 || !!selectedRoom
  const scheduleReady = !scheduleNeeded || (!!selectedDate && !!selectedTime)
  const canShowForm =
    roomChosen && selectedServices.length > 0 && scheduleReady

  return (
    <main className="min-h-[100svh] pb-16">
      <StickyCitySwitch />

      <section className="shell max-w-3xl pt-8">
        <div className="section-mark mb-8">
          <span className="num">бронь</span>
          <span className="rule" />
        </div>

        <h1
          className="font-display font-light text-bone tracking-[-0.03em] leading-[0.95] mb-4"
          style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)' }}
        >
          {submitted ? 'Заявка отправлена' : 'Бронирование сессии'}
        </h1>

        {submitted ? (
          <div className="panel p-10 text-center">
            <div className="inline-flex h-12 w-12 rounded-full border border-signal items-center justify-center text-signal mb-6">
              <Check className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 className="font-display text-2xl font-light text-bone mb-3">
              Заявка отправлена
            </h2>
            <p className="text-sm text-bone/60 mb-4 max-w-[44ch] mx-auto">
              Мы свяжемся с вами.
            </p>

            {user && (
              <p className="mb-8 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-mono text-[10px] uppercase tracking-[0.14em] text-bone/40">
                <span>Заявка сохранена в вашем профиле</span>
                <Link
                  href="/profile"
                  className="text-signal hover:text-bone transition-colors underline underline-offset-4"
                >
                  профиль
                </Link>
              </p>
            )}

            <div className="flex items-center justify-center gap-3">
              <button onClick={reset} className="btn btn-line">
                Новая заявка
              </button>
              <Link href="/" className="btn btn-solid">
                На главную
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Адрес */}
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-signal" />
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone/35">
                {studio?.address || 'Адрес студии'}
              </span>
            </div>

            {/* Студия — одно помещение города */}
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone/35 mb-3 flex items-center justify-between gap-4">
                <span>Студия</span>
                {rooms.length > 1 && (
                  <span className="normal-case tracking-normal text-bone/25">
                    {rooms.length} помещения
                  </span>
                )}
              </label>

              {rooms.length === 0 ? (
                <div className="p-6 rounded-xl border border-dashed border-ash/50 text-center">
                  <p className="text-sm text-bone/40">Помещения скоро будут добавлены</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {rooms.map((room) => (
                    <RoomCard
                      key={room.id}
                      room={room}
                      selected={room.id === selectedRoomId}
                      onSelect={() => selectRoom(room.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Услуги выбранной комнаты */}
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone/35 mb-3 block">
                Выберите услуги (можно несколько)
              </label>

              {!selectedRoom ? (
                <div className="p-6 rounded-xl border border-dashed border-ash/50 text-center">
                  <p className="text-sm text-bone/40">
                    Выберите студию, чтобы увидеть услуги
                  </p>
                </div>
              ) : availableServices.length === 0 ? (
                <div className="p-6 rounded-xl border border-dashed border-ash/50 text-center">
                  <p className="text-sm text-bone/40">Услуги скоро будут добавлены</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {availableServices.map((service) => {
                    const Icon = getServiceIcon(service.name)
                    const isSelected = selectedServiceIds.includes(service.id)
                    const remote = !service.requiresSchedule
                    return (
                      <button
                        key={service.id}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => toggleService(service.id)}
                        className={cn(
                          'flex items-start gap-4 p-4 rounded-xl border text-left transition-all duration-200',
                          isSelected
                            ? 'border-signal bg-signal/5'
                            : 'border-ash bg-transparent hover:border-bone/30 hover:bg-ash/10'
                        )}
                      >
                        <div
                          className={cn(
                            'p-2.5 rounded-lg shrink-0',
                            isSelected ? 'bg-signal/20 text-signal' : 'bg-ash/20 text-bone/60'
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h4 className="font-medium text-bone text-sm">{service.name}</h4>
                            {isSelected && (
                              <Check className="h-4 w-4 text-signal shrink-0" aria-hidden="true" />
                            )}
                          </div>
                          <p className="text-xs text-bone/50 line-clamp-2 mb-2">{service.description}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-display text-lg text-signal">
                              {service.price.toLocaleString('ru-RU')} ₽
                            </span>
                            {service.duration > 0 && (
                              <span className="text-[10px] uppercase tracking-wider text-bone/40">
                                / {Math.floor(service.duration / 60)}ч{' '}
                                {service.duration % 60 ? `${service.duration % 60}м` : ''}
                              </span>
                            )}
                            {remote && (
                              <span className="text-[10px] uppercase tracking-wider text-bone/40">
                                · без сессии
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Дата и время — только для услуг, которым нужна запись */}
            {selectedServices.length > 0 && scheduleNeeded && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <label className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone/35 flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    Выберите дату
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCalendar((v) => !v)}
                    className="font-mono text-[10px] uppercase tracking-[0.14em] text-signal hover:text-bone transition-colors"
                  >
                    {showCalendar ? 'ближайшие' : 'все даты →'}
                  </button>
                </div>

                {!showCalendar && (
                  <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar snap-x">
                    {quickDays.map((date, i) => {
                      const isSelected = selectedDate?.toDateString() === date.toDateString()
                      const dayName = date.toLocaleDateString('ru-RU', { weekday: 'short' })
                      const dayNum = date.getDate()
                      const monthName = date.toLocaleDateString('ru-RU', { month: 'short' })

                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setSelectedDate(date)
                            setSelectedTime('')
                          }}
                          className={cn(
                            'flex flex-col items-center justify-center min-w-[4.5rem] h-20 rounded-xl border transition-all duration-200 snap-start shrink-0',
                            isSelected
                              ? 'border-signal bg-signal/10 text-signal'
                              : 'border-ash bg-transparent text-bone/60 hover:border-bone/30 hover:text-bone'
                          )}
                        >
                          <span className="text-[10px] uppercase tracking-wider mb-1">{dayName}</span>
                          <span className="font-display text-2xl font-medium leading-none">{dayNum}</span>
                          <span className="text-[10px] uppercase tracking-wider mt-1">{monthName}</span>
                        </button>
                      )
                    })}
                  </div>
                )}

                {showCalendar && (
                  <MiniCalendar
                    days={nextDays}
                    selected={selectedDate}
                    onSelect={(d) => {
                      setSelectedDate(d)
                      setSelectedTime('')
                    }}
                  />
                )}

                {selectedDate && (
                  <div>
                    <label className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone/35 mb-3 flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5" />
                      Время
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {TIME_SLOTS.map((slot) => {
                        const isSelected = selectedTime === slot
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedTime(slot)}
                            className={cn(
                              'h-10 rounded-lg border text-sm font-mono transition-colors',
                              isSelected
                                ? 'border-signal bg-signal text-void'
                                : 'border-ash text-bone/70 hover:border-bone/40 hover:text-bone'
                            )}
                          >
                            {slot}
                          </button>
                        )
                      })}

                      <button
                        type="button"
                        onClick={() => setSelectedTime(NIGHT_SLOT)}
                        className={cn(
                          'h-10 rounded-lg border text-sm font-mono transition-colors col-span-2 sm:col-span-3',
                          selectedTime === NIGHT_SLOT
                            ? 'border-signal bg-signal text-void'
                            : 'border-ash text-bone/70 hover:border-bone/40 hover:text-bone'
                        )}
                      >
                        {NIGHT_SLOT}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Количество часов — только для услуг с записью */}
            {selectedServices.length > 0 && scheduleNeeded && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <label className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone/35 mb-3 flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" />
                  Количество часов
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {HOUR_OPTIONS.map((option) => {
                    const isSelected = hours === option
                    return (
                      <button
                        key={option}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setHours(option)}
                        className={cn(
                          'h-10 rounded-lg border text-sm font-mono transition-colors',
                          isSelected
                            ? 'border-signal bg-signal text-void'
                            : 'border-ash text-bone/70 hover:border-bone/40 hover:text-bone'
                        )}
                      >
                        {option} ч
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Дата и время не нужны — удалённые услуги */}
            {selectedServices.length > 0 && !scheduleNeeded && (
              <div className="p-4 rounded-xl border border-ash bg-ash/10">
                <p className="text-sm text-bone/60">
                  Для выбранных услуг дата и время не требуются — свяжемся с вами, чтобы обсудить детали.
                </p>
              </div>
            )}

            {/* Форма контактов */}
            {canShowForm && (
              <form
                noValidate
                onSubmit={handleSubmit}
                className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4"
              >
                <label className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone/35 mb-3 block">
                  Ваши контактные данные
                </label>

                <div className="space-y-3">
                  <div>
                    <input
                      ref={nameRef}
                      type="text"
                      placeholder="Ваше имя"
                      required
                      aria-invalid={!!fieldErrors.name}
                      autoComplete="name"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, name: e.target.value }))
                        if (fieldErrors.name) {
                          setFieldErrors((prev) => ({ ...prev, name: false }))
                        }
                      }}
                      className={cn('field', fieldErrors.name && 'field-invalid')}
                    />
                    {fieldErrors.name && <p className="field-error">Укажите имя</p>}
                  </div>

                  <TelegramInput
                    value={formData.telegram}
                    onChange={(tg) => setFormData({ ...formData, telegram: tg })}
                  />

                  <div>
                    <PhoneInput
                      inputRef={phoneRef}
                      invalid={!!fieldErrors.phone}
                      value={formData.phone}
                      onChange={(phone) => {
                        setFormData((prev) => ({ ...prev, phone }))
                        if (fieldErrors.phone) {
                          setFieldErrors((prev) => ({ ...prev, phone: false }))
                        }
                      }}
                    />
                    {fieldErrors.phone && <p className="field-error">Укажите телефон полностью</p>}
                  </div>

                  <textarea
                    placeholder="Комментарий (жанр, референсы, что готово…)"
                    rows={3}
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    className="field resize-none"
                  />
                </div>

                {error && (
                  <p className="field-error" role="alert">
                    {error}
                  </p>
                )}

                <div className="flex items-center justify-between gap-4 pt-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone/35">
                    Итого
                    {scheduleNeeded ? ` · ${hours} ч` : ''}
                  </span>
                  <span className="font-display text-2xl text-signal whitespace-nowrap">
                    {estimatedTotal.toLocaleString('ru-RU')} ₽
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-6 bg-signal text-void font-medium py-3.5 rounded-lg flex items-center justify-center gap-2 hover:bg-signal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    'Отправка...'
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Забронировать
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}
      </section>
    </main>
  )
}

/* ─── Поля с маской ─── */

function PhoneInput({
  value,
  onChange,
  invalid,
  inputRef,
}: {
  value: string
  onChange: (v: string) => void
  invalid?: boolean
  inputRef?: React.Ref<HTMLInputElement>
}) {
  const format = (d: string) => {
    if (!d) return '+7 '
    const rest = d.startsWith('7') ? d.slice(1) : d
    const p1 = rest.slice(0, 3)
    const p2 = rest.slice(3, 6)
    const p3 = rest.slice(6, 8)
    const p4 = rest.slice(8, 10)

    let out = '+7'
    if (p1) out += ` ${p1}`
    if (p2) out += ` ${p2}`
    if (p3) out += ` ${p3}`
    if (p4) out += ` ${p4}`
    return out
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let d = e.target.value.replace(/\D/g, '')
    if (!d) {
      onChange('')
      return
    }
    if (!d.startsWith('7')) d = '7' + d
    d = d.slice(0, 11)
    onChange(format(d))
  }

  const handleFocus = () => {
    if (!value) onChange('+7 ')
  }

  const handleBlur = () => {
    if (value.replace(/\D/g, '') === '7' || value.trim() === '+7') {
      onChange('')
    }
  }

  return (
    <input
      ref={inputRef}
      type="tel"
      inputMode="tel"
      placeholder="+7 999 123 45 67"
      required
      aria-invalid={invalid}
      autoComplete="tel"
      value={value}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={cn('field font-mono tracking-wide', invalid && 'field-invalid')}
    />
  )
}

function TelegramInput({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  /** Внутри храним без @, чтобы проще форматировать. */
  const clean = value.replace(/^@+/, '')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    const withoutAt = raw.replace(/^@+/, '')
    const filtered = withoutAt.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 32)
    onChange(filtered ? `@${filtered}` : '')
  }

  const handleFocus = () => {
    if (!value) onChange('@')
  }

  const handleBlur = () => {
    if (value === '@') onChange('')
  }

  return (
    <input
      type="text"
      inputMode="text"
      placeholder="@username (необязательно)"
      value={value ? `@${clean}` : ''}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className="field font-mono tracking-wide"
    />
  )
}

function MiniCalendar({
  days,
  selected,
  onSelect,
}: {
  days: Date[]
  selected: Date | null
  onSelect: (d: Date) => void
}) {
  const months = new Map<string, Date[]>()
  for (const d of days) {
    const key = d.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
    if (!months.has(key)) months.set(key, [])
    months.get(key)!.push(d)
  }

  return (
    <div className="space-y-6">
      {Array.from(months.entries()).map(([label, dates]) => (
        <div key={label}>
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone/40 mb-2">
            {label}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'].map((w) => (
              <div
                key={w}
                className="text-center font-mono text-[9px] uppercase tracking-[0.1em] text-bone/25 py-1"
              >
                {w}
              </div>
            ))}
            {Array.from({ length: (dates[0].getDay() + 6) % 7 }).map((_, i) => (
              <div key={`pad-${i}`} />
            ))}
            {dates.map((d) => {
              const isSelected = selected?.toDateString() === d.toDateString()
              const isToday = d.toDateString() === new Date().toDateString()
              return (
                <button
                  key={d.toISOString()}
                  type="button"
                  onClick={() => onSelect(d)}
                  className={cn(
                    'h-9 rounded-md text-sm font-mono transition-colors',
                    isSelected
                      ? 'bg-signal text-void'
                      : isToday
                      ? 'border border-signal/40 text-signal hover:bg-signal/10'
                      : 'text-bone/70 hover:bg-bone/5 hover:text-bone'
                  )}
                >
                  {d.getDate()}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
