from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    maria_user: str
    maria_password: str
    maria_host: str
    maria_database: str
    maria_port: int

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )


settings = Settings()
