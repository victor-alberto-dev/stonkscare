from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas, auth
from database import get_db

router = APIRouter(prefix="/categorias", tags=["categorias"])

@router.get("/", response_model=list[schemas.CategoriaOut])
def list_categorias(db: Session = Depends(get_db), current_user: models.Usuario = Depends(auth.get_current_user)):
    return db.query(models.Categoria).all()

@router.post("/", response_model=schemas.CategoriaOut, status_code=201)
def create_categoria(cat: schemas.CategoriaCreate, db: Session = Depends(get_db), current_user: models.Usuario = Depends(auth.get_current_user)):
    existing = db.query(models.Categoria).filter(models.Categoria.nome_categoria == cat.nome_categoria).first()
    if existing:
        raise HTTPException(status_code=400, detail="Categoria já existe")
    db_cat = models.Categoria(nome_categoria=cat.nome_categoria)
    db.add(db_cat)
    db.commit()
    db.refresh(db_cat)
    return db_cat
