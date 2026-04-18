import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

export default function PerfilPage() {
  const { user, setUser, logout } = useAuth()
  const navigate = useNavigate()

  const [dadosForm, setDadosForm] = useState({
    nome_usuario: user?.nome_usuario ?? '',
    email_usuario: user?.email_usuario ?? '',
  })
  const [senhaForm, setSenhaForm] = useState({
    senha_atual: '',
    nova_senha: '',
    confirmar_senha: '',
  })
  const [confirmarDelete, setConfirmarDelete] = useState(false)

  const [dadosStatus, setDadosStatus] = useState(null)
  const [senhaStatus, setSenhaStatus] = useState(null)

  async function salvarDados(e) {
    e.preventDefault()
    setDadosStatus(null)
    try {
      const res = await api.put('/usuarios/me', {
        nome_usuario: dadosForm.nome_usuario,
        email_usuario: dadosForm.email_usuario,
      })
      setUser(res.data)
      setDadosStatus({ tipo: 'sucesso', msg: 'Perfil atualizado com sucesso.' })
    } catch (err) {
      setDadosStatus({ tipo: 'erro', msg: err.response?.data?.detail ?? 'Erro ao atualizar perfil.' })
    }
  }

  async function trocarSenha(e) {
    e.preventDefault()
    setSenhaStatus(null)
    if (senhaForm.nova_senha !== senhaForm.confirmar_senha) {
      setSenhaStatus({ tipo: 'erro', msg: 'A nova senha e a confirmação não coincidem.' })
      return
    }
    try {
      await api.put('/usuarios/me/senha', {
        senha_atual: senhaForm.senha_atual,
        nova_senha: senhaForm.nova_senha,
      })
      setSenhaForm({ senha_atual: '', nova_senha: '', confirmar_senha: '' })
      setSenhaStatus({ tipo: 'sucesso', msg: 'Senha alterada com sucesso.' })
    } catch (err) {
      setSenhaStatus({ tipo: 'erro', msg: err.response?.data?.detail ?? 'Erro ao trocar senha.' })
    }
  }

  async function deletarConta() {
    try {
      await api.delete('/usuarios/me')
      logout()
      navigate('/login')
    } catch {
      setConfirmarDelete(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Meu Perfil</h1>

      {/* Dados pessoais */}
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Dados pessoais</h2>
        <form onSubmit={salvarDados} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Nome</label>
            <input
              type="text"
              value={dadosForm.nome_usuario}
              onChange={e => setDadosForm(f => ({ ...f, nome_usuario: e.target.value }))}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">E-mail</label>
            <input
              type="email"
              value={dadosForm.email_usuario}
              onChange={e => setDadosForm(f => ({ ...f, email_usuario: e.target.value }))}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          {dadosStatus && (
            <p className={`text-sm ${dadosStatus.tipo === 'sucesso' ? 'text-green-600' : 'text-red-500'}`}>
              {dadosStatus.msg}
            </p>
          )}
          <button
            type="submit"
            className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Salvar alterações
          </button>
        </form>
      </section>

      {/* Troca de senha */}
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Trocar senha</h2>
        <form onSubmit={trocarSenha} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Senha atual</label>
            <input
              type="password"
              value={senhaForm.senha_atual}
              onChange={e => setSenhaForm(f => ({ ...f, senha_atual: e.target.value }))}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Nova senha</label>
            <input
              type="password"
              value={senhaForm.nova_senha}
              onChange={e => setSenhaForm(f => ({ ...f, nova_senha: e.target.value }))}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Confirmar nova senha</label>
            <input
              type="password"
              value={senhaForm.confirmar_senha}
              onChange={e => setSenhaForm(f => ({ ...f, confirmar_senha: e.target.value }))}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          {senhaStatus && (
            <p className={`text-sm ${senhaStatus.tipo === 'sucesso' ? 'text-green-600' : 'text-red-500'}`}>
              {senhaStatus.msg}
            </p>
          )}
          <button
            type="submit"
            className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Alterar senha
          </button>
        </form>
      </section>

      {/* Deletar conta */}
      <section className="bg-white rounded-xl border border-red-200 p-6">
        <h2 className="text-lg font-semibold text-red-600 mb-2">Deletar conta</h2>
        <p className="text-sm text-gray-500 mb-4">
          Essa ação é irreversível. Todos os seus dados serão removidos permanentemente.
        </p>
        {!confirmarDelete ? (
          <button
            onClick={() => setConfirmarDelete(true)}
            className="bg-red-50 text-red-600 border border-red-300 text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
          >
            Deletar minha conta
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Tem certeza?</span>
            <button
              onClick={deletarConta}
              className="bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Sim, deletar
            </button>
            <button
              onClick={() => setConfirmarDelete(false)}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancelar
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
