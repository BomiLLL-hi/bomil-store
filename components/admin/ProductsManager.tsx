'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import type { Product } from '@/lib/types'

const CATEGORIES = ['godly', 'chroma', 'vintage', 'set', 'pet']
const TYPES = ['knife', 'gun', 'pet', 'other']
const CATEGORY_LABELS: Record<string, string> = {
  godly: 'Godly', chroma: 'Chroma', vintage: 'Vintage', set: 'Set', pet: 'Pet',
}

type FormData = {
  title: string
  slug: string
  aliases: string
  description: string
  category: string
  extra_categories: string[]
  is_best_of_all_time: boolean
  type: string
  stock_status: 'in_stock' | 'sold_out'
  current_price: string
  old_price: string
  hidden_status: boolean
  is_set: boolean
  included_items: string[]
  images: string[]
}

const emptyForm: FormData = {
  title: '', slug: '', aliases: '', description: '',
  category: 'godly', extra_categories: [], is_best_of_all_time: false,
  type: 'knife', stock_status: 'in_stock',
  current_price: '', old_price: '',
  hidden_status: false, is_set: false, included_items: [],
  images: [],
}

const CYRILLIC_MAP: Record<string, string> = {
  а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'yo',ж:'zh',з:'z',и:'i',й:'y',
  к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',
  х:'kh',ц:'ts',ч:'ch',ш:'sh',щ:'shch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya',
}

function slugify(str: string) {
  return str.toLowerCase().trim()
    .split('').map(c => CYRILLIC_MAP[c] ?? c).join('')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function productToForm(p: Product): FormData {
  return {
    title: p.title,
    slug: p.slug,
    aliases: p.aliases.join(', '),
    description: p.description,
    category: p.category,
    extra_categories: p.extra_categories ?? [],
    is_best_of_all_time: p.is_best_of_all_time,
    type: p.type,
    stock_status: p.stock_status,
    current_price: String(p.current_price),
    old_price: p.old_price ? String(p.old_price) : '',
    hidden_status: p.hidden_status,
    is_set: p.is_set,
    included_items: p.included_items ?? [],
    images: p.images,
  }
}

function formToPayload(f: FormData) {
  return {
    title: f.title.trim(),
    slug: f.slug.trim(),
    aliases: f.aliases.split(',').map(s => s.trim()).filter(Boolean),
    description: f.description.trim(),
    category: f.category,
    extra_categories: f.extra_categories,
    is_best_of_all_time: f.is_best_of_all_time,
    type: f.type,
    stock_status: f.stock_status,
    current_price: parseFloat(f.current_price) || 0,
    old_price: f.old_price ? parseFloat(f.old_price) : null,
    hidden_status: f.hidden_status,
    is_set: f.is_set,
    included_items: f.included_items,
    images: f.images,
  }
}

// ─── Image Uploader ───────────────────────────────────────────────────────────
function ImageUploader({ images, onChange }: { images: string[]; onChange: (imgs: string[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFiles(files: FileList | null) {
    if (!files || !files.length) return
    setUploading(true)
    const urls: string[] = []
    for (const file of Array.from(files)) {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) urls.push(data.url)
    }
    onChange([...images, ...urls])
    setUploading(false)
  }

  function remove(url: string) {
    onChange(images.filter(i => i !== url))
  }

  function moveLeft(idx: number) {
    if (idx === 0) return
    const arr = [...images]
    ;[arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]]
    onChange(arr)
  }

  return (
    <div>
      <div className="flex gap-2 flex-wrap mb-3">
        {images.map((url, idx) => (
          <div key={url} className="relative group w-20 h-20 rounded-xl overflow-hidden bg-[#1a1a1a] border border-[#333333]">
            <Image src={url} alt="" fill sizes="80px" className="object-contain p-1" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
              {idx > 0 && (
                <button onClick={() => moveLeft(idx)} className="w-6 h-6 rounded bg-white/20 hover:bg-white/40 text-white text-xs flex items-center justify-center">
                  ←
                </button>
              )}
              <button onClick={() => remove(url)} className="w-6 h-6 rounded bg-[#ef4444]/60 hover:bg-[#ef4444] text-white text-xs flex items-center justify-center">
                ✕
              </button>
            </div>
            {idx === 0 && (
              <span className="absolute top-1 left-1 text-[9px] bg-[#8b5cf6] text-white px-1 rounded">гл.</span>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-20 h-20 rounded-xl border-2 border-dashed border-[#333333] hover:border-[#8b5cf6] text-[#555555] hover:text-[#8b5cf6] transition-colors flex flex-col items-center justify-center gap-1 text-xs"
        >
          {uploading ? (
            <span className="w-4 h-4 border-2 border-[#8b5cf6]/30 border-t-[#8b5cf6] rounded-full animate-spin" />
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Фото
            </>
          )}
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />
      <p className="text-[#555555] text-xs">Первое фото — главное. Стрелка ← перемещает левее.</p>
    </div>
  )
}

// ─── Set Items Picker ─────────────────────────────────────────────────────────
function SetItemsPicker({
  allProducts, currentId, selected, onChange,
}: {
  allProducts: Product[]
  currentId?: string
  selected: string[]
  onChange: (ids: string[]) => void
}) {
  const [search, setSearch] = useState('')

  const candidates = allProducts.filter(p =>
    p.id !== currentId &&
    (p.title.toLowerCase().includes(search.toLowerCase()) ||
     p.slug.toLowerCase().includes(search.toLowerCase()))
  )

  const selectedProducts = allProducts.filter(p => selected.includes(p.id))

  function toggle(id: string) {
    onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id])
  }

  return (
    <div>
      <label className="text-[#555555] text-xs mb-2 block">Товары в составе сета</label>

      {selectedProducts.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedProducts.map(p => (
            <div key={p.id} className="flex items-center gap-1.5 bg-[#8b5cf6]/15 border border-[#8b5cf6]/30 rounded-lg px-2 py-1">
              <span className="text-[#a78bfa] text-xs font-medium">{p.title}</span>
              <button
                type="button"
                onClick={() => toggle(p.id)}
                className="text-[#555555] hover:text-[#ef4444] transition-colors text-xs leading-none"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Поиск товара для добавления..."
        className="w-full bg-[#0f0f0f] border border-[#333333] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555555] focus:outline-none focus:border-[#8b5cf6] transition-colors mb-2"
      />

      {search && (
        <div className="border border-[#222222] rounded-xl overflow-hidden max-h-48 overflow-y-auto">
          {candidates.length === 0 ? (
            <p className="text-[#555555] text-xs text-center py-4">Ничего не найдено</p>
          ) : (
            candidates.map(p => {
              const isSelected = selected.includes(p.id)
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggle(p.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors border-b border-[#1a1a1a] last:border-0 ${
                    isSelected ? 'bg-[#8b5cf6]/10' : 'hover:bg-[#111111]'
                  }`}
                >
                  <div className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-[#8b5cf6] border-[#8b5cf6]' : 'border-[#444444]'
                  }`}>
                    {isSelected && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-white flex-1 truncate">{p.title}</span>
                  <span className="text-xs text-[#555555] flex-shrink-0">{p.category}</span>
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

// ─── Product Form ─────────────────────────────────────────────────────────────
function ProductForm({
  initial, allProducts, onSave, onDelete, onCancel,
}: {
  initial: Product | null
  allProducts: Product[]
  onSave: (p: Product) => void
  onDelete: (id: string) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<FormData>(initial ? productToForm(initial) : emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function handleTitle(val: string) {
    set('title', val)
    set('slug', slugify(val))
  }

  async function save() {
    if (!form.title || !form.slug || !form.current_price) {
      setError('Заполните название, slug и цену')
      return
    }
    setSaving(true)
    setError('')
    const payload = formToPayload(form)
    const res = await fetch('/api/admin/products', {
      method: initial ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(initial ? { id: initial.id, ...payload } : payload),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Ошибка'); setSaving(false); return }
    const isNew = !initial
    onSave(data.product)
    setSaving(false)
    if (isNew) {
      setSuccessMsg('Товар успешно добавлен')
      setTimeout(() => setSuccessMsg(''), 3000)
    }
  }

  async function remove() {
    if (!initial) return
    setDeleting(true)
    await fetch('/api/admin/products', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: initial.id }),
    })
    onDelete(initial.id)
    setDeleting(false)
  }

  const inputCls = 'w-full bg-[#0f0f0f] border border-[#333333] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555555] focus:outline-none focus:border-[#8b5cf6] transition-colors'
  const labelCls = 'text-[#555555] text-xs mb-1 block'

  return (
    <div>
      <div className="p-5 space-y-5 max-w-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold">{initial ? 'Редактировать товар' : 'Новый товар'}</h3>
          <button onClick={onCancel} className="text-[#555555] hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Основное */}
        <div className="space-y-3">
          <div>
            <label className={labelCls}>Название *</label>
            <input className={inputCls} value={form.title} onChange={e => handleTitle(e.target.value)} placeholder="Harvester" />
          </div>
          <div>
            <label className={labelCls}>Slug * (URL)</label>
            <input className={inputCls} value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="harvester" />
          </div>
          <div>
            <label className={labelCls}>Aliases (через запятую)</label>
            <input className={inputCls} value={form.aliases} onChange={e => set('aliases', e.target.value)} placeholder="harv, харвестер, sickle" />
          </div>
          <div>
            <label className={labelCls}>Описание</label>
            <textarea rows={3} className={inputCls + ' resize-none'} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Описание товара..." />
          </div>
        </div>

        {/* Категории */}
        <div>
          <label className={labelCls}>Основная категория *</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {CATEGORIES.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  set('category', c)
                  set('extra_categories', form.extra_categories.filter(x => x !== c))
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  form.category === c
                    ? 'bg-[#8b5cf6] border-[#8b5cf6] text-white'
                    : 'border-[#333333] text-[#555555] hover:border-[#8b5cf6]/50 hover:text-[#888888]'
                }`}
              >
                {CATEGORY_LABELS[c]}
              </button>
            ))}
          </div>

          <label className={labelCls}>Дополнительные категории</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {CATEGORIES.filter(c => c !== form.category).map(c => {
              const active = form.extra_categories.includes(c)
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    set('extra_categories', active
                      ? form.extra_categories.filter(x => x !== c)
                      : [...form.extra_categories, c]
                    )
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    active
                      ? 'bg-[#8b5cf6]/20 border-[#8b5cf6]/50 text-[#a78bfa]'
                      : 'border-[#333333] text-[#555555] hover:border-[#444444] hover:text-[#888888]'
                  }`}
                >
                  {CATEGORY_LABELS[c]}
                </button>
              )
            })}
            {/* Лучшее всех времён как категория */}
            <button
              type="button"
              onClick={() => set('is_best_of_all_time', !form.is_best_of_all_time)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                form.is_best_of_all_time
                  ? 'bg-[#f59e0b]/20 border-[#f59e0b]/50 text-[#f59e0b]'
                  : 'border-[#333333] text-[#555555] hover:border-[#444444] hover:text-[#888888]'
              }`}
            >
              ⭐ Лучшее всех времён
            </button>
          </div>
        </div>

        {/* Тип */}
        <div>
          <label className={labelCls}>Тип *</label>
          <select className={inputCls} value={form.type} onChange={e => set('type', e.target.value)}>
            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Цены */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Цена (₽) *</label>
            <input type="number" className={inputCls} value={form.current_price} onChange={e => set('current_price', e.target.value)} placeholder="5000" />
          </div>
          <div>
            <label className={labelCls}>Старая цена (₽)</label>
            <input type="number" className={inputCls} value={form.old_price} onChange={e => set('old_price', e.target.value)} placeholder="6000" />
          </div>
        </div>

        {/* Статус наличия */}
        <div>
          <label className={labelCls}>Наличие</label>
          <div className="flex gap-2">
            {(['in_stock', 'sold_out'] as const).map(s => (
              <button
                key={s}
                type="button"
                onClick={() => set('stock_status', s)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  form.stock_status === s
                    ? s === 'in_stock'
                      ? 'bg-[#22c55e]/10 border-[#22c55e]/40 text-[#22c55e]'
                      : 'bg-[#ef4444]/10 border-[#ef4444]/40 text-[#ef4444]'
                    : 'border-[#333333] text-[#555555] hover:border-[#444444]'
                }`}
              >
                {s === 'in_stock' ? 'В наличии' : 'Нет в наличии'}
              </button>
            ))}
          </div>
        </div>

        {/* Флаги */}
        <div className="space-y-2">
          {[
            { key: 'hidden_status' as const, label: 'Скрыт (не показывать в каталоге)' },
            { key: 'is_set' as const, label: 'Это сет (набор товаров)' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => set(key, !form[key])}
                className={`w-9 h-5 rounded-full transition-colors relative flex-shrink-0 ${form[key] ? 'bg-[#8b5cf6]' : 'bg-[#333333]'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form[key] ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-sm text-[#888888]">{label}</span>
            </label>
          ))}
        </div>

        {/* Состав сета */}
        {form.is_set && (
          <SetItemsPicker
            allProducts={allProducts}
            currentId={initial?.id}
            selected={form.included_items}
            onChange={ids => set('included_items', ids)}
          />
        )}

        {/* Фотографии */}
        <div>
          <label className={labelCls}>Фотографии</label>
          <ImageUploader images={form.images} onChange={imgs => set('images', imgs)} />
        </div>

        {error && <p className="text-[#ef4444] text-xs">{error}</p>}
        {successMsg && <p className="text-[#22c55e] text-xs">{successMsg}</p>}

        {/* Кнопки */}
        <div className="flex gap-2 pt-2">
          {!confirmDelete && (
            <>
              <button
                onClick={save}
                disabled={saving}
                className="flex-1 py-2.5 bg-[#8b5cf6] hover:bg-[#7c3aed] disabled:bg-[#333333] disabled:text-[#555555] text-white text-sm font-semibold rounded-lg transition-colors"
              >
                {saving ? 'Сохранение...' : initial ? 'Сохранить' : 'Создать товар'}
              </button>
              {initial && (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="px-4 py-2.5 border border-[#ef4444]/30 text-[#ef4444] hover:bg-[#ef4444]/10 text-sm rounded-lg transition-colors"
                >
                  Удалить
                </button>
              )}
            </>
          )}
          {initial && confirmDelete && (
            <>
              <button
                onClick={remove}
                disabled={deleting}
                className="flex-1 py-2.5 bg-[#ef4444]/20 border border-[#ef4444]/40 text-[#ef4444] text-sm font-semibold rounded-lg transition-colors"
              >
                {deleting ? '...' : 'Подтвердить удаление'}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="flex-1 py-2.5 border border-[#333333] text-[#888888] hover:text-white text-sm rounded-lg transition-colors"
              >
                Отмена
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Product Row ──────────────────────────────────────────────────────────────
function ProductRow({ product, active, onClick }: { product: Product; active: boolean; onClick: () => void }) {
  const image = product.images[0] ?? null
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
        active ? 'border-[#8b5cf6] bg-[#8b5cf6]/5' : 'border-[#222222] bg-[#111111] hover:border-[#333333]'
      }`}
    >
      <div className="relative w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden bg-[#0d0d0d]">
        {image
          ? <Image src={image} alt={product.title} fill sizes="40px" className="object-contain p-0.5" />
          : <div className="w-full h-full flex items-center justify-center text-[#333333]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01" />
              </svg>
            </div>
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{product.title}</p>
        <p className="text-[#555555] text-xs">{product.category} · {product.current_price} ₽</p>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {product.hidden_status && (
          <span className="text-[#555555] text-[10px] border border-[#333333] rounded px-1">скрыт</span>
        )}
        <span className={`w-2 h-2 rounded-full ${product.stock_status === 'in_stock' ? 'bg-[#22c55e]' : 'bg-[#ef4444]'}`} />
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Product | null | 'new'>(null)

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/products')
    const data = await res.json()
    setProducts(data.products ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = products.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.slug.toLowerCase().includes(search.toLowerCase())
  )

  function handleSave(p: Product) {
    setProducts(prev => {
      const exists = prev.find(x => x.id === p.id)
      return exists ? prev.map(x => x.id === p.id ? p : x) : [p, ...prev]
    })
    setSelected(p)
  }

  function handleDelete(id: string) {
    setProducts(prev => prev.filter(p => p.id !== id))
    setSelected(null)
  }

  return (
    <div className="flex h-full">
      {/* Left: list */}
      <div className="w-80 flex-shrink-0 border-r border-[#222222] flex flex-col">
        <div className="p-3 border-b border-[#222222] space-y-2">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск товара..."
            className="w-full bg-[#0f0f0f] border border-[#333333] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555555] focus:outline-none focus:border-[#8b5cf6] transition-colors"
          />
          <button
            onClick={() => setSelected('new')}
            className="w-full py-2 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-sm font-semibold rounded-lg transition-colors"
          >
            + Добавить товар
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 bg-[#111111] border border-[#222222] rounded-xl animate-pulse" />
            ))
          ) : filtered.length === 0 ? (
            <p className="text-[#555555] text-sm text-center py-8">Нет товаров</p>
          ) : (
            filtered.map(p => (
              <ProductRow
                key={p.id}
                product={p}
                active={selected !== 'new' && selected?.id === p.id}
                onClick={() => setSelected(p)}
              />
            ))
          )}
        </div>

        <div className="px-3 py-2 border-t border-[#222222]">
          <p className="text-[#555555] text-xs text-center">{products.length} товаров</p>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex-1 overflow-y-auto">
        {!selected ? (
          <div className="flex items-center justify-center h-full text-[#333333]">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-sm">Выберите товар или создайте новый</p>
            </div>
          </div>
        ) : (
          <ProductForm
            key={selected === 'new' ? 'new' : selected.id}
            initial={selected === 'new' ? null : selected}
            allProducts={products}
            onSave={handleSave}
            onDelete={handleDelete}
            onCancel={() => setSelected(null)}
          />
        )}
      </div>
    </div>
  )
}
