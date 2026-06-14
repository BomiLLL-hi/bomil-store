import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <p className="text-[#8b5cf6] font-bold text-6xl mb-4">404</p>
      <h1 className="text-2xl font-bold text-white mb-3">Страница не найдена</h1>
      <p className="text-[#888888] mb-8 max-w-sm">
        Запрошенная страница не существует или была удалена.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-lg font-semibold text-sm transition-colors"
      >
        Вернуться в каталог
      </Link>
    </div>
  )
}
