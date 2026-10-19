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

    # Auto-seed default demo account if it doesn't exist yet
    try:
        from sqlalchemy.future import select
        from app.models.user import User
        from app.models.profile import UserProfile
        from app.models.consent import ConsentRecord
        from app.core.security import get_password_hash

        async with AsyncSessionLocal() as session:
            result = await session.execute(select(User).where(User.email == "ssdemo@gmail.com"))
            existing = result.scalars().first()
            if not existing:
                demo_user = User(
                    email="ssdemo@gmail.com",
                    hashed_password=get_password_hash("DemoPassword123!"),
                    is_active=True,
                )
                session.add(demo_user)
                await session.flush()

                profile = UserProfile(
                    user_id=demo_user.id,
                    display_name="Demo User",
                    gender="prefer_not_to_say",
                    age=28,
                    height_cm=175.0,
                    weight_kg=70.0,
                    dietary_preference="vegetarian",
                    fitness_goal="general_wellness",
                    activity_level="moderate",
                    daily_budget=250.0,
                    daily_calorie_target=2150.0,
                    daily_protein_target=75.0,
                    daily_carb_target=260.0,
                    daily_fat_target=60.0,
                    daily_fiber_target=32.0,
                    daily_water_target_ml=3000,
                    onboarding_completed=True,
                )
                session.add(profile)

                consent = ConsentRecord(
                    user_id=demo_user.id,
                    health_data_consent=True,
                    ai_processing_consent=True,
                )
                session.add(consent)
                await session.commit()
    except Exception as e:
        print(f"Demo user auto-seed notice: {e}")
