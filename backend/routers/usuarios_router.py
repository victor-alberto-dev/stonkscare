from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import models, schemas, auth
from database import get_db

router = APIRouter(prefix="/usuarios", tags=["usuarios"])


@router.get("/me", response_model=schemas.UsuarioOut)
def get_me(current_user: models.Usuario = Depends(auth.get_current_user)):
    return current_user


@router.put("/me", response_model=schemas.UsuarioOut)
def update_me(
    dados: schemas.UsuarioUpdate,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(auth.get_current_user),
):
    if dados.email_usuario and dados.email_usuario != current_user.email_usuario:
        conflito = db.query(models.Usuario).filter(
            models.Usuario.email_usuario == dados.email_usuario
        ).first()
        if conflito:
            raise HTTPException(status_code=400, detail="Email já está em uso")
        current_user.email_usuario = dados.email_usuario

    if dados.nome_usuario:
        current_user.nome_usuario = dados.nome_usuario

    db.commit()
    db.refresh(current_user)
    return current_user


@router.put("/me/senha", status_code=204)
def update_senha(
    dados: schemas.SenhaUpdate,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(auth.get_current_user),
):
    if not auth.verify_password(dados.senha_atual, current_user.senha_usuario):
        raise HTTPException(status_code=400, detail="Senha atual incorreta")

    current_user.senha_usuario = auth.get_password_hash(dados.nova_senha)
    db.commit()


@router.delete("/me", status_code=204)
def delete_me(
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(auth.get_current_user),
):
    db.delete(current_user)
    db.commit()
