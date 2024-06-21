from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    use_mock_api: bool = True
    backend_base_url: str = ""
    app_port: int = 8080
    app_host: str = "0.0.0.0"


settings = Settings()
