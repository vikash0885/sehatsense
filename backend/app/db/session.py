import os
import shutil
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.core.config import settings

Base = declarative_base()

db_url = settings.DATABASE_URL

# Handle Vercel serverless read-only filesystem for SQLite
if os.environ.get("VERCEL") and db_url.startswith("sqlite"):
    tmp_db_path = "/tmp/nutriai.db"
    if not os.path.exists(tmp_db_path):
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
        seed_db = os.path.join(base_dir, "nutriai.db")
        if os.path.exists(seed_db):
            try:
                shutil.copy2(seed_db, tmp_db_path)
            except Exception:
                pass
    db_url = f"sqlite+aiosqlite:///{tmp_db_path}"

connect_args = {}
if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_async_engine(
    db_url,
    echo=False,
    connect_args=connect_args,
    future=True,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
