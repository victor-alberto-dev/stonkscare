import { useState, useEffect } from 'react'
import { Target, Plus, Pencil, Trash2, X } from 'lucide-react'
import api from '../services/api'

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

const formatDate = (dateStr) =>
  dateStr ? new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR') : '-'

function MetaForm({ meta, onClose, onSuccess }) {
  const [form, setForm] = useState({
    nome_meta: meta?.nome_meta || '',
    valor_alvo: meta?.valor_alvo || '',
    valor_poupado: meta?.valor_poupado || 0,
    prazo_meta: meta?.prazo_meta || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const payload = {
        ...form,
        valor_alvo: parseFloat(form.valor_alvo),
        valor_poupado: parseFloat(form.valor_poupado),
        prazo_meta: form.prazo_meta || null,
      }
      if (meta) {
        await api.put(`/metas/${meta.id}`, payload)
      } else {
        await api.post('/metas/', payload)
      }
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao salvar meta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">{meta ? 'Editar Meta' : 'Nova Meta'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Meta</label>
            <input
              type="text"
              value={form.nome_meta}
              onChange={e => setForm({ ...form, nome_meta: e.target.value })}
              required
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              placeholder="Ex: Viagem de Férias"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor Alvo (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={form.valor_alvo}
                onChange={e => setForm({ ...form, valor_alvo: e.target.value })}
                required
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Já Poupado (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.valor_poupado}
                onChange={e => setForm({ ...form, valor_poupado: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prazo (opcional)</label>
            <input
              type="date"
              value={form.prazo_meta}
              onChange={e => setForm({ ...form, prazo_meta: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60">{loading ? 'Salvando...' : 'Salvar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function MetasPage() {
  const [metas, setMetas] = useState([])
  const [editando, setEditando] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchMetas = async () => {
    const res = await api.get('/metas/')
    setMetas(res.data)
    setLoading(false)
  }

  useEffect(() => { fetchMetas() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Excluir esta meta?')) return
    await api.delete(`/metas/${id}`)
    fetchMetas()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Metas de Economia</h1>
        <button
          onClick={() => { setEditando(null); setShowForm(true) }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          Nova Meta
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-12">Carregando...</div>
      ) : metas.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <Target className="mx-auto mb-3 text-gray-300" size={40} />
          <p className="text-gray-500 text-sm">Nenhuma meta cadastrada ainda.</p>
          <p className="text-gray-400 text-xs mt-1">Crie sua primeira meta de economia!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {metas.map(meta => {
            const progresso = Math.min((meta.valor_poupado / meta.valor_alvo) * 100, 100)
            const concluida = progresso >= 100
            return (
              <div key={meta.id} className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm">{meta.nome_meta}</h3>
                    {meta.prazo_meta && (
                      <p className="text-xs text-gray-400 mt-0.5">Prazo: {formatDate(meta.prazo_meta)}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditando(meta); setShowForm(true) }} className="text-gray-400 hover:text-indigo-600 transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(meta.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="mb-2">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{formatCurrency(meta.valor_poupado)} poupado</span>
                    <span>{progresso.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${concluida ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                      style={{ width: `${progresso}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center mt-3">
                  <span className="text-xs text-gray-400">Meta: {formatCurrency(meta.valor_alvo)}</span>
                  {concluida && (
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Concluída!
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showForm && (
        <MetaForm
          meta={editando}
          onClose={() => { setShowForm(false); setEditando(null) }}
          onSuccess={() => { setShowForm(false); setEditando(null); fetchMetas() }}
        />
      )}
    </div>
  )
}
