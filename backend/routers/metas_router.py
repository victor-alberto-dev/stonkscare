from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas, auth
from database import get_db

router = APIRouter(prefix="/metas", tags=["metas"])

@router.get("/", response_model=list[schemas.MetaOut])
def list_metas(db: Session = Depends(get_db), current_user: models.Usuario = Depends(auth.get_current_user)):
    return db.query(models.Meta).filter(models.Meta.usuario_id == current_user.id).all()

@router.post("/", response_model=schemas.MetaOut, status_code=201)
def create_meta(m: schemas.MetaCreate, db: Session = Depends(get_db), current_user: models.Usuario = Depends(auth.get_current_user)):
    db_m = models.Meta(**m.model_dump(), usuario_id=current_user.id)
    db.add(db_m)
    db.commit()
    db.refresh(db_m)
    return db_m

@router.put("/{id}", response_model=schemas.MetaOut)
def update_meta(id: int, m: schemas.MetaUpdate, db: Session = Depends(get_db), current_user: models.Usuario = Depends(auth.get_current_user)):
    db_m = db.query(models.Meta).filter(models.Meta.id == id, models.Meta.usuario_id == current_user.id).first()
    if not db_m:
        raise HTTPException(status_code=404, detail="Meta não encontrada")
    for key, value in m.model_dump(exclude_unset=True).items():
        setattr(db_m, key, value)
    db.commit()
    db.refresh(db_m)
    return db_m

@router.delete("/{id}", status_code=204)
def delete_meta(id: int, db: Session = Depends(get_db), current_user: models.Usuario = Depends(auth.get_current_user)):
    db_m = db.query(models.Meta).filter(models.Meta.id == id, models.Meta.usuario_id == current_user.id).first()
    if not db_m:
        raise HTTPException(status_code=404, detail="Meta não encontrada")
    db.delete(db_m)
    db.commit()
