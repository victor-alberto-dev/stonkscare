from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date, datetime

# Auth
class UsuarioCreate(BaseModel):
    nome_usuario: str
    email_usuario: str
    senha_usuario: str

class UsuarioOut(BaseModel):
    id: int
    nome_usuario: str
    email_usuario: str
    data_criacao_usuario: Optional[datetime] = None
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Categoria
class CategoriaCreate(BaseModel):
    nome_categoria: str

class CategoriaOut(BaseModel):
    id: int
    nome_categoria: str
    class Config:
        from_attributes = True

# Transacao
class TransacaoCreate(BaseModel):
    valor_transacao: float
    data_transacao: date
    tipo_transacao: str  # "receita" or "despesa"
    descricao_transacao: Optional[str] = None
    categoria_id: int

class TransacaoUpdate(BaseModel):
    valor_transacao: Optional[float] = None
    data_transacao: Optional[date] = None
    tipo_transacao: Optional[str] = None
    descricao_transacao: Optional[str] = None
    categoria_id: Optional[int] = None

class TransacaoOut(BaseModel):
    id: int
    valor_transacao: float
    data_transacao: date
    tipo_transacao: str
    descricao_transacao: Optional[str] = None
    usuario_id: int
    categoria_id: int
    categoria: CategoriaOut
    class Config:
        from_attributes = True

# Meta
class MetaCreate(BaseModel):
    nome_meta: str
    valor_alvo: float
    valor_poupado: Optional[float] = 0.0
    prazo_meta: Optional[date] = None

class MetaUpdate(BaseModel):
    nome_meta: Optional[str] = None
    valor_alvo: Optional[float] = None
    valor_poupado: Optional[float] = None
    prazo_meta: Optional[date] = None

class MetaOut(BaseModel):
    id: int
    nome_meta: str
    valor_alvo: float
    valor_poupado: float
    prazo_meta: Optional[date] = None
    usuario_id: int
    class Config:
        from_attributes = True

# ConselhoIA
class ConselhoIAOut(BaseModel):
    id: int
    texto_conselho: str
    data_emissao_conselho: datetime
    usuario_id: int
    class Config:
        from_attributes = True

# Dashboard
class DashboardOut(BaseModel):
    saldo_atual: float
    total_receitas: float
    total_despesas: float
    variacao_mensal: float
    distribuicao_categorias: list
