import { useState, useEffect } from 'react'
import { categorias } from '../data/transactions'

const EMPTY_FORM = {
  descricao: '',
  categoria: '',
  valor: '',
  data: '',
  tipo: 'saida',
}

function validate(form) {
  const errs = {}
  if (!form.descricao.trim())                     errs.descricao = 'Obrigatório'
  if (!form.categoria)                            errs.categoria = 'Obrigatório'
  if (!form.valor || isNaN(form.valor) || +form.valor <= 0) errs.valor = 'Valor inválido'
  if (!form.data)                                 errs.data      = 'Obrigatório'
  return errs
}

function Field({ label, error, children }) {
  return (
    <div className={`field${error ? ' field--error' : ''}`}>
      <label>{label}</label>
      {children}
      {error && <span className="field-error">{error}</span>}
    </div>
  )
}

export default function Formulario({ onSave, selectedTransaction, onCancelEdit }) {
  const [form, setForm]           = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState({})
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    if (selectedTransaction) {
      setForm({
        descricao: selectedTransaction.descricao || '',
        categoria: selectedTransaction.categoria || '',
        valor: selectedTransaction.valor ?? '',
        data: selectedTransaction.data || '',
        tipo: selectedTransaction.tipo || 'saida',
      })
      setSuccessMsg('')
      setFormErrors({})
    } else {
      setForm(EMPTY_FORM)
      setFormErrors({})
    }
  }, [selectedTransaction])

  function set(key, value) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function handleSubmit() {
    const errs = validate(form)
    if (Object.keys(errs).length) {
      setFormErrors(errs)
      return
    }

    onSave({
      ...form,
      valor: parseFloat(form.valor),
    })

    setForm(EMPTY_FORM)
    setFormErrors({})
    setSuccessMsg(selectedTransaction ? 'Transação atualizada com sucesso!' : 'Transação cadastrada com sucesso!')
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  function handleClear() {
    setForm(EMPTY_FORM)
    setFormErrors({})
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>{selectedTransaction ? 'Editar Transação' : 'Cadastrar Transação'}</h1>
          <p>{selectedTransaction ? 'Atualize os dados da movimentação' : 'Adicione uma nova movimentação financeira'}</p>
        </div>
      </header>

      <div className="form-container">
        {/* ── Feedback de sucesso ── */}
        {successMsg && (
          <div className="success-msg">{successMsg}</div>
        )}

        {/* ── Seletor de tipo ── */}
        <div className="tipo-toggle">
          {['entrada', 'saida'].map(tipo => (
            <button
              key={tipo}
              className={`tipo-btn ${tipo}${form.tipo === tipo ? ' active' : ''}`}
              onClick={() => set('tipo', tipo)}
            >
              {tipo === 'entrada' ? '↑ Entrada' : '↓ Saída'}
            </button>
          ))}
        </div>

        {/* ── Campos ── */}
        <div className="form-grid">
          <Field label="Descrição" error={formErrors.descricao}>
            <input
              type="text"
              placeholder="Ex: Salário, Aluguel..."
              value={form.descricao}
              onChange={e => set('descricao', e.target.value)}
            />
          </Field>

          <Field label="Categoria" error={formErrors.categoria}>
            <select
              value={form.categoria}
              onChange={e => set('categoria', e.target.value)}
            >
              <option value="">Selecione...</option>
              {categorias.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>

          <Field label="Valor (R$)" error={formErrors.valor}>
            <input
              type="number"
              placeholder="0,00"
              min="0"
              step="0.01"
              value={form.valor}
              onChange={e => set('valor', e.target.value)}
            />
          </Field>

          <Field label="Data" error={formErrors.data}>
            <input
              type="date"
              value={form.data}
              onChange={e => set('data', e.target.value)}
            />
          </Field>
        </div>

        {/* ── Ações ── */}
        <div className="form-actions">
          {selectedTransaction ? (
            <button className="btn-cancel" onClick={() => {
              onCancelEdit()
              setForm(EMPTY_FORM)
              setFormErrors({})
            }}>
              Cancelar edição
            </button>
          ) : (
            <button className="btn-cancel" onClick={handleClear}>
              Limpar
            </button>
          )}

          <button
            className={`btn-submit ${form.tipo}`}
            onClick={handleSubmit}
          >
            {selectedTransaction ? 'Salvar alterações' : 'Cadastrar Transação'}
          </button>
        </div>
      </div>
    </div>
  )
}
