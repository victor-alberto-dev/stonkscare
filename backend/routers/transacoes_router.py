from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date
import models, schemas, auth
from database import get_db

router = APIRouter(prefix="/transacoes", tags=["transacoes"])

@router.get("/", response_model=list[schemas.TransacaoOut])
def list_transacoes(
    categoria_id: Optional[int] = Query(None),
    data_inicio: Optional[date] = Query(None),
    data_fim: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(auth.get_current_user)
):
    query = db.query(models.Transacao).filter(models.Transacao.usuario_id == current_user.id)
    if categoria_id:
        query = query.filter(models.Transacao.categoria_id == categoria_id)
    if data_inicio:
        query = query.filter(models.Transacao.data_transacao >= data_inicio)
    if data_fim:
        query = query.filter(models.Transacao.data_transacao <= data_fim)
    return query.order_by(models.Transacao.data_transacao.desc()).all()

@router.post("/", response_model=schemas.TransacaoOut, status_code=201)
def create_transacao(t: schemas.TransacaoCreate, db: Session = Depends(get_db), current_user: models.Usuario = Depends(auth.get_current_user)):
    if t.tipo_transacao not in ("receita", "despesa"):
        raise HTTPException(status_code=400, detail="tipo_transacao deve ser 'receita' ou 'despesa'")
    cat = db.query(models.Categoria).filter(models.Categoria.id == t.categoria_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")
    db_t = models.Transacao(**t.model_dump(), usuario_id=current_user.id)
    db.add(db_t)
    db.commit()
    db.refresh(db_t)
    return db_t

@router.put("/{id}", response_model=schemas.TransacaoOut)
def update_transacao(id: int, t: schemas.TransacaoUpdate, db: Session = Depends(get_db), current_user: models.Usuario = Depends(auth.get_current_user)):
    db_t = db.query(models.Transacao).filter(models.Transacao.id == id, models.Transacao.usuario_id == current_user.id).first()
    if not db_t:
        raise HTTPException(status_code=404, detail="Transação não encontrada")
    for key, value in t.model_dump(exclude_unset=True).items():
        setattr(db_t, key, value)
    db.commit()
    db.refresh(db_t)
    return db_t

@router.delete("/{id}", status_code=204)
def delete_transacao(id: int, db: Session = Depends(get_db), current_user: models.Usuario = Depends(auth.get_current_user)):
    db_t = db.query(models.Transacao).filter(models.Transacao.id == id, models.Transacao.usuario_id == current_user.id).first()
    if not db_t:
        raise HTTPException(status_code=404, detail="Transação não encontrada")
    db.delete(db_t)
    db.commit()
