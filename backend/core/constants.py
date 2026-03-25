from core.settings import settings

db_properties = {
  "user": settings.maria_user,
  "password": settings.maria_password,
  "driver": "org.mariadb.jdbc.Driver",
  "char.encoding": "utf-8",
  "characterEncoding": "UTF-8",
  "useUnicode": "true",
  "sessionVariables": "sql_mode='ANSI_QUOTES'"
  }
