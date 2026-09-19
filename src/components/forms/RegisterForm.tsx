'use client'
export default function RegisterForm() {
  return (
    <form
      className="space-y-5"
      onSubmit={async (e) => {
        e.preventDefault()
        const form = e.currentTarget
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: (form.elements.namedItem('name') as HTMLInputElement).value,
            email: (form.elements.namedItem('email') as HTMLInputElement).value,
            password: (form.elements.namedItem('password') as HTMLInputElement).value,
          }),
        })
        const data = await res.json()
        if (res.ok) {
          window.location.href = '/profile'
        } else {
          alert(data.error || 'Ошибка регистрации')
        }
      }}
    >
      <div>
        <label htmlFor="name" className="label">Имя</label>
        <input id="name" name="name" type="text" className="input-field" placeholder="Ваше имя" required />
      </div>
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input id="email" name="email" type="email" className="input-field" placeholder="you@studio.ru" required />
      </div>
      <div>
        <label htmlFor="password" className="label">Пароль</label>
        <input id="password" name="password" type="password" className="input-field" placeholder="••••••••" required />
      </div>
      <button type="submit" className="btn-primary w-full py-3">Зарегистрироваться</button>
    </form>
  )
}
