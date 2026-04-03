import { useState, useEffect } from 'react'
import { Wallet, TrendingUp, TrendingDown, Sparkles, RefreshCw } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import api from '../services/api'
import TransactionForm from '../components/TransactionForm'

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#14b8a6', '#f97316', '#06b6d4']

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState(null)
  const [conselho, setConselho] = useState(null)
  const [loadingConselho, setLoadingConselho] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboard/')
      setDashboard(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchLastConselho = async () => {
    try {
      const res = await api.get('/ia/conselhos')
      if (res.data.length > 0) setConselho(res.data[0])
    } catch (err) {}
  }

  useEffect(() => {
    fetchDashboard()
    fetchLastConselho()
  }, [])

  const handleGerarConselho = async () => {
    setLoadingConselho(true)
    try {
      const res = await api.post('/ia/conselho')
      setConselho(res.data)
    } catch (err) {
      alert(err.response?.data?.detail || 'Erro ao gerar conselho')
    } finally {
      setLoadingConselho(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-400">Carregando dashboard...</div>
  }

  const pieData = dashboard?.distribuicao_categorias?.map(d => ({
    name: d.categoria,
    value: parseFloat(d.valor.toFixed(2))
  })) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + Nova Transação
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-xl">
            <Wallet className="text-indigo-600" size={22} />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Saldo Atual</p>
            <p className={`text-2xl font-bold ${dashboard?.saldo_atual >= 0 ? 'text-gray-800' : 'text-red-600'}`}>
              {formatCurrency(dashboard?.saldo_atual || 0)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-xl">
            <TrendingUp className="text-emerald-600" size={22} />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Receitas do Mês</p>
            <p className="text-2xl font-bold text-emerald-600">
              {formatCurrency(dashboard?.total_receitas || 0)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-xl">
            <TrendingDown className="text-red-500" size={22} />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Despesas do Mês</p>
            <p className="text-2xl font-bold text-red-500">
              {formatCurrency(dashboard?.total_despesas || 0)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            Distribuição de Gastos
          </h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
              Nenhuma despesa registrada este mês
            </div>
          )}
        </div>

        {/* AI Advice */}
        <div className="bg-indigo-700 rounded-2xl p-6 flex flex-col">
          <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
            <Sparkles size={18} />
            Dica da IA
          </h2>
          {conselho ? (
            <p className="text-indigo-100 text-sm leading-relaxed flex-1">
              "{conselho.texto_conselho}"
            </p>
          ) : (
            <p className="text-indigo-200 text-sm flex-1">
              Gere um conselho financeiro personalizado baseado nas suas transações da última semana.
            </p>
          )}
          <button
            onClick={handleGerarConselho}
            disabled={loadingConselho}
            className="mt-4 flex items-center justify-center gap-2 bg-white text-indigo-700 py-2 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-colors disabled:opacity-60"
          >
            <RefreshCw size={14} className={loadingConselho ? 'animate-spin' : ''} />
            {loadingConselho ? 'Gerando...' : 'Gerar Conselho'}
          </button>
        </div>
      </div>

      {showForm && (
        <TransactionForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false)
            fetchDashboard()
          }}
        />
      )}
    </div>
  )
}
