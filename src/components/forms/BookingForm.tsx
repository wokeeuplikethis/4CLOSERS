'use client'
import { useState } from 'react'

export default function BookingForm() {
  return (
    <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert('Запись отправлена! (демо)') }}>
      <div>
        <label htmlFor="service" className="label">Услуга</label>
        <select id="service" className="input-field" defaultValue="">
          <option value="">Выберите услугу</option>
          <option value="vocal-recording">Запись вокала — 8000₽</option>
          <option value="rap-recording">Запись рэпа — 7000₽</option>
          <option value="mixing">Сведение — 15000₽</option>
          <option value="mastering">Мастеринг — 8000₽</option>
          <option value="autotune">Автотюн — 5000₽</option>
          <option value="production">Продакшн — 35000₽</option>
          <option value="sound-design">Саунд-дизайн — 12000₽</option>
        </select>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="label">Дата</label>
          <input id="date" type="date" className="input-field" />
        </div>
        <div>
          <label htmlFor="time" className="label">Время</label>
          <input id="time" type="time" className="input-field" />
        </div>
      </div>

      <div>
        <label htmlFor="comment" className="label">Комментарий</label>
        <textarea id="comment" rows={3} className="input-field resize-none" placeholder="Расскажите о вашем проекте..." />
      </div>

      <button type="submit" className="btn-primary w-full py-4 text-lg">
        Подтвердить запись
      </button>
    </form>
  )
}
