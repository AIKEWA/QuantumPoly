from __future__ import annotations

from pydantic import BaseSettings, Field, PostgresDsn, constr


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    DB_URL: PostgresDsn = Field(
        ...,
        description="Database connection string",
        example="postgresql://user:pass@localhost/dbname",
    )
    API_KEY: constr(min_length=32) = Field(
        ..., description="API authentication key", example="your_api_key_here"
    )
    DEBUG_MODE: bool = Field(
        False, description="Enable debug output", example=False
    )

    class Config:
        env_file = ".env"
        case_sensitive = True


_settings: Settings | None = None


def get_settings() -> Settings:
    """Return the validated application settings."""
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings
