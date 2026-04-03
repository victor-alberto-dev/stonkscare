import { useState, useEffect } from 'react'
import { Pencil, Trash2, Filter } from 'lucide-react'
import api from '../services/api'
import TransactionForm from '../components/TransactionForm'

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

const formatDate = (dateStr) =>
  new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR')

export default function TransacoesPage() {
  const [transacoes, setTransacoes] = useState([])
  const [categorias, setCategorias] = useState([])
  const [editando, setEditando] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ categoria_id: '', data_inicio: '', data_fim: '' })

  const fetchTransacoes = async () => {
    const params = {}
    if (filters.categoria_id) params.categoria_id = filters.categoria_id
    if (filters.data_inicio) params.data_inicio = filters.data_inicio
    if (filters.data_fim) params.data_fim = filters.data_fim
    const res = await api.get('/transacoes/', { params })
    setTransacoes(res.data)
    setLoading(false)
  }

  useEffect(() => {
    api.get('/categorias/').then(res => setCategorias(res.data))
  }, [])

  useEffect(() => {
    fetchTransacoes()
  }, [filters])

  const handleDelete = async (id) => {
    if (!confirm('Excluir esta transação?')) return
    await api.delete(`/transacoes/${id}`)
    fetchTransacoes()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Transações</h1>
        <button
          onClick={() => { setEditando(null); setShowForm(true) }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + Nova Transação
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-600">
          <Filter size={16} />
          Filtros
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select
            value={filters.categoria_id}
            onChange={e => setFilters({ ...filters, categoria_id: e.target.value })}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Todas as categorias</option>
            {categorias.map(c => <option key={c.id} value={c.id}>{c.nome_categoria}</option>)}
          </select>
          <input
            type="date"
            value={filters.data_inicio}
            onChange={e => setFilters({ ...filters, data_inicio: e.target.value })}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Data início"
          />
          <input
            type="date"
            value={filters.data_fim}
            onChange={e => setFilters({ ...filters, data_fim: e.target.value })}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Data fim"
          />
        </div>
        {(filters.categoria_id || filters.data_inicio || filters.data_fim) && (
          <button
            onClick={() => setFilters({ categoria_id: '', data_inicio: '', data_fim: '' })}
            className="mt-3 text-xs text-indigo-600 hover:underline"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Carregando...</div>
        ) : transacoes.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Nenhuma transação encontrada</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Data</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Descrição</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Categoria</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Tipo</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Valor</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {transacoes.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(t.data_transacao)}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{t.descricao_transacao || '-'}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {t.categoria.nome_categoria}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        t.tipo_transacao === 'receita'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-700'
                      }`}>
                        {t.tipo_transacao === 'receita' ? 'Receita' : 'Despesa'}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-sm font-semibold text-right ${
                      t.tipo_transacao === 'receita' ? 'text-emerald-600' : 'text-red-500'
                    }`}>
                      {t.tipo_transacao === 'receita' ? '+' : '-'} {formatCurrency(t.valor_transacao)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => { setEditando(t); setShowForm(true) }}
                          className="text-gray-400 hover:text-indigo-600 transition-colors"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <TransactionForm
          transacao={editando}
          onClose={() => { setShowForm(false); setEditando(null) }}
          onSuccess={() => { setShowForm(false); setEditando(null); fetchTransacoes() }}
        />
      )}
    </div>
  )
}
