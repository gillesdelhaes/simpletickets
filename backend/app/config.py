from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # App
    app_secret_key: str = "dev-secret-change-in-production"
    app_base_url: str = "http://localhost:3000"

    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@db:5432/simplytickets"

    # Slack
    slack_bot_token: str = ""
    slack_signing_secret: str = ""
    slack_app_token: str = ""
    slack_trigger_emoji: str = "ticket"
    slack_monitored_channels: str = ""
    slack_two_way_sync: bool = True

    # Storage
    storage_local_path: str = "/data/attachments"
    attachment_max_size_mb: int = 10


settings = Settings()
