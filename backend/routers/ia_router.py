from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date, timedelta
import os
import models, schemas, auth
from database import get_db

router = APIRouter(prefix="/ia", tags=["ia"])

@router.post("/conselho", response_model=schemas.ConselhoIAOut)
def gerar_conselho(db: Session = Depends(get_db), current_user: models.Usuario = Depends(auth.get_current_user)):
    hoje = date.today()
    semana_atras = hoje - timedelta(days=7)

    transacoes = db.query(models.Transacao).filter(
        models.Transacao.usuario_id == current_user.id,
        models.Transacao.data_transacao >= semana_atras
    ).all()

    if not transacoes:
        raise HTTPException(status_code=400, detail="Sem transações na última semana para análise")

    resumo_linhas = []
    total_despesas = 0
    categorias = {}

    for t in transacoes:
        if t.tipo_transacao == "despesa":
            total_despesas += t.valor_transacao
            cat = t.categoria.nome_categoria
            categorias[cat] = categorias.get(cat, 0) + t.valor_transacao

    for cat, valor in sorted(categorias.items(), key=lambda x: x[1], reverse=True):
        pct = (valor / total_despesas * 100) if total_despesas > 0 else 0
        resumo_linhas.append(f"- {cat}: R$ {valor:.2f} ({pct:.1f}%)")

    resumo = f"Resumo financeiro da última semana do usuário {current_user.nome_usuario}:\n"
    resumo += f"Total de despesas: R$ {total_despesas:.2f}\n"
    resumo += "Distribuição por categoria:\n" + "\n".join(resumo_linhas)

    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        texto_conselho = f"Análise automática: {resumo}\n\nDica: Monitore seus maiores gastos e tente reduzir em 10% as categorias com maior participação."
    else:
        try:
            import anthropic
            client = anthropic.Anthropic(api_key=api_key)
            message = client.messages.create(
                model="claude-haiku-4-5-20251001",
                max_tokens=300,
                messages=[{
                    "role": "user",
                    "content": f"{resumo}\n\nCom base nesses dados, gere um conselho financeiro personalizado, objetivo e encorajador em português, com no máximo 3 frases."
                }]
            )
            texto_conselho = message.content[0].text
        except Exception as e:
            texto_conselho = f"Análise: {resumo}\n\nDica: Revise seus gastos e identifique onde pode economizar."

    conselho = models.ConselhoIA(texto_conselho=texto_conselho, usuario_id=current_user.id)
    db.add(conselho)
    db.commit()
    db.refresh(conselho)
    return conselho

@router.get("/conselhos", response_model=list[schemas.ConselhoIAOut])
def list_conselhos(db: Session = Depends(get_db), current_user: models.Usuario = Depends(auth.get_current_user)):
    return db.query(models.ConselhoIA).filter(
        models.ConselhoIA.usuario_id == current_user.id
    ).order_by(models.ConselhoIA.data_emissao_conselho.desc()).limit(5).all()
