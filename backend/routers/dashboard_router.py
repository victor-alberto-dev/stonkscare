from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date
import pandas as pd
import models, schemas, auth
from database import get_db, engine

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/", response_model=schemas.DashboardOut)
def get_dashboard(db: Session = Depends(get_db), current_user: models.Usuario = Depends(auth.get_current_user)):
    hoje = date.today()
    mes_atual = hoje.month
    ano_atual = hoje.year

    transacoes = db.query(models.Transacao).filter(models.Transacao.usuario_id == current_user.id).all()

    if not transacoes:
        return {
            "saldo_atual": 0.0,
            "total_receitas": 0.0,
            "total_despesas": 0.0,
            "variacao_mensal": 0.0,
            "distribuicao_categorias": []
        }

    # Convert to DataFrame using Pandas
    data = [{
        "valor": t.valor_transacao,
        "tipo": t.tipo_transacao,
        "data": t.data_transacao,
        "categoria": t.categoria.nome_categoria,
        "mes": t.data_transacao.month,
        "ano": t.data_transacao.year
    } for t in transacoes]
    df = pd.DataFrame(data)

    # Current month filter
    df_mes = df[(df["mes"] == mes_atual) & (df["ano"] == ano_atual)]

    total_receitas = float(df_mes[df_mes["tipo"] == "receita"]["valor"].sum())
    total_despesas = float(df_mes[df_mes["tipo"] == "despesa"]["valor"].sum())
    saldo_atual = total_receitas - total_despesas

    # Previous month for variation
    mes_anterior = mes_atual - 1 if mes_atual > 1 else 12
    ano_anterior = ano_atual if mes_atual > 1 else ano_atual - 1
    df_mes_ant = df[(df["mes"] == mes_anterior) & (df["ano"] == ano_anterior)]
    despesas_anterior = float(df_mes_ant[df_mes_ant["tipo"] == "despesa"]["valor"].sum())
    variacao_mensal = total_despesas - despesas_anterior

    # Distribution by category (expenses only)
    df_despesas = df_mes[df_mes["tipo"] == "despesa"]
    if not df_despesas.empty:
        dist = df_despesas.groupby("categoria")["valor"].sum().reset_index()
        dist.columns = ["categoria", "valor"]
        total = dist["valor"].sum()
        dist["percentual"] = (dist["valor"] / total * 100).round(2)
        distribuicao = dist.to_dict(orient="records")
    else:
        distribuicao = []

    return {
        "saldo_atual": saldo_atual,
        "total_receitas": total_receitas,
        "total_despesas": total_despesas,
        "variacao_mensal": variacao_mensal,
        "distribuicao_categorias": distribuicao
    }
