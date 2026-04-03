from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum

class TipoTransacao(str, enum.Enum):
    receita = "receita"
    despesa = "despesa"

class Usuario(Base):
    __tablename__ = "usuario"
    id = Column(Integer, primary_key=True, index=True)
    nome_usuario = Column(String, nullable=False)
    email_usuario = Column(String, unique=True, index=True, nullable=False)
    senha_usuario = Column(String, nullable=False)
    data_criacao_usuario = Column(DateTime, server_default=func.now())

    transacoes = relationship("Transacao", back_populates="usuario", cascade="all, delete")
    metas = relationship("Meta", back_populates="usuario", cascade="all, delete")
    conselhos = relationship("ConselhoIA", back_populates="usuario", cascade="all, delete")

class Categoria(Base):
    __tablename__ = "categoria"
    id = Column(Integer, primary_key=True, index=True)
    nome_categoria = Column(String, unique=True, nullable=False)

    transacoes = relationship("Transacao", back_populates="categoria")

class Transacao(Base):
    __tablename__ = "transacao"
    id = Column(Integer, primary_key=True, index=True)
    valor_transacao = Column(Float, nullable=False)
    data_transacao = Column(Date, nullable=False)
    tipo_transacao = Column(String, nullable=False)  # "receita" or "despesa"
    descricao_transacao = Column(Text)
    usuario_id = Column(Integer, ForeignKey("usuario.id"), nullable=False)
    categoria_id = Column(Integer, ForeignKey("categoria.id"), nullable=False)

    usuario = relationship("Usuario", back_populates="transacoes")
    categoria = relationship("Categoria", back_populates="transacoes")

class Meta(Base):
    __tablename__ = "meta"
    id = Column(Integer, primary_key=True, index=True)
    nome_meta = Column(String, nullable=False)
    valor_alvo = Column(Float, nullable=False)
    valor_poupado = Column(Float, default=0.0)
    prazo_meta = Column(Date, nullable=True)
    usuario_id = Column(Integer, ForeignKey("usuario.id"), nullable=False)

    usuario = relationship("Usuario", back_populates="metas")

class ConselhoIA(Base):
    __tablename__ = "conselho_ia"
    id = Column(Integer, primary_key=True, index=True)
    texto_conselho = Column(Text, nullable=False)
    data_emissao_conselho = Column(DateTime, server_default=func.now())
    usuario_id = Column(Integer, ForeignKey("usuario.id"), nullable=False)

    usuario = relationship("Usuario", back_populates="conselhos")
