import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import api from '../services/api'

export default function TransactionForm({ onClose, onSuccess, transacao }) {
  const [form, setForm] = useState({
    valor_transacao: transacao?.valor_transacao || '',
    data_transacao: transacao?.data_transacao || new Date().toISOString().split('T')[0],
    tipo_transacao: transacao?.tipo_transacao || 'despesa',
    descricao_transacao: transacao?.descricao_transacao || '',
    categoria_id: transacao?.categoria_id || '',
  })
  const [categorias, setCategorias] = useState([])
  const [novaCategoria, setNovaCategoria] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/categorias/').then(res => setCategorias(res.data))
  }, [])

  const handleAddCategoria = async () => {
    if (!novaCategoria.trim()) return
    try {
      const res = await api.post('/categorias/', { nome_categoria: novaCategoria.trim() })
      setCategorias([...categorias, res.data])
      setForm({ ...form, categoria_id: res.data.id })
      setNovaCategoria('')
    } catch (err) {
      setError('Categoria já existe ou erro ao criar')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.categoria_id) {
      setError('Selecione uma categoria')
      return
    }
    setLoading(true)
    setError('')
    try {
      const payload = { ...form, valor_transacao: parseFloat(form.valor_transacao), categoria_id: parseInt(form.categoria_id) }
      if (transacao) {
        await api.put(`/transacoes/${transacao.id}`, payload)
      } else {
        await api.post('/transacoes/', payload)
      }
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao salvar transação')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">
            {transacao ? 'Editar Transação' : 'Nova Transação'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {/* Tipo */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            {['despesa', 'receita'].map((tipo) => (
              <button
                key={tipo}
                type="button"
                onClick={() => setForm({ ...form, tipo_transacao: tipo })}
                className={`flex-1 py-2.5 text-sm font-medium capitalize transition-colors ${
                  form.tipo_transacao === tipo
                    ? tipo === 'despesa'
                      ? 'bg-red-500 text-white'
                      : 'bg-emerald-500 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tipo === 'despesa' ? 'Despesa' : 'Receita'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={form.valor_transacao}
                onChange={e => setForm({ ...form, valor_transacao: e.target.value })}
                required
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                placeholder="0,00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
              <input
                type="date"
                value={form.data_transacao}
                onChange={e => setForm({ ...form, data_transacao: e.target.value })}
                required
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
            <select
              value={form.categoria_id}
              onChange={e => setForm({ ...form, categoria_id: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              <option value="">Selecione...</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nome_categoria}</option>
              ))}
            </select>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={novaCategoria}
                onChange={e => setNovaCategoria(e.target.value)}
                placeholder="Nova categoria..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddCategoria}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors"
              >
                Criar
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <input
              type="text"
              value={form.descricao_transacao}
              onChange={e => setForm({ ...form, descricao_transacao: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              placeholder="Descrição opcional"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
