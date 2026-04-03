from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
import models, schemas, auth
from database import get_db

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=schemas.UsuarioOut, status_code=201)
def register(user: schemas.UsuarioCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Usuario).filter(models.Usuario.email_usuario == user.email_usuario).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    hashed = auth.get_password_hash(user.senha_usuario)
    db_user = models.Usuario(
        nome_usuario=user.nome_usuario,
        email_usuario=user.email_usuario,
        senha_usuario=hashed
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.Usuario).filter(models.Usuario.email_usuario == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.senha_usuario):
        raise HTTPException(status_code=401, detail="Email ou senha incorretos")
    access_token = auth.create_access_token(
        data={"sub": user.email_usuario},
        expires_delta=timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.UsuarioOut)
def get_me(current_user: models.Usuario = Depends(auth.get_current_user)):
    return current_user
