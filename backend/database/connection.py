from sqlalchemy import create_engine, inspect
from core.settings import settings

engine_mariadb = create_engine(settings.mariadb_host)
