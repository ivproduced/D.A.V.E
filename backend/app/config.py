from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Google Gemini API
    google_ai_api_key: str
    gemini_model: str = "gemini-3-pro-preview"
    
    # Database
    database_url: str
    
    # Redis
    redis_url: str
    
    # Cloud Storage
    gcs_bucket_name: str = ""
    gcs_project_id: str = ""
    
    # App Config
    environment: str = "development"
    debug: bool = True
    allowed_origins: str = "http://localhost:3000"
    
    # Security
    secret_key: str
    
    # File Upload
    max_upload_size: int = 50 * 1024 * 1024  # 50MB
    allowed_file_types: list = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/png",
        "image/jpeg",
        "application/json",
        "text/yaml",
        "text/plain",
        "text/markdown",
        "text/x-yaml",
        "application/x-yaml",
        "application/octet-stream"  # Fallback for files with unknown mime types
    ]
    
    # Scalability & Performance Settings
    batch_validation_size: int = 10  # Controls validated per batch API call
    batch_remediation_size: int = 15  # Controls remediated per batch
    deep_reasoning_risk_levels: list = ["high", "critical"]  # Risk levels requiring deep reasoning
    nist_cache_size: int = 1000  # LRU cache size for NIST control requirements
    skip_passing_controls: bool = True  # Skip full analysis for fully implemented controls
    max_concurrent_batches: int = 3  # Max parallel batch operations
    
    # Token Management
    max_tokens_per_request: int = 8000  # Max tokens for single Gemini request
    validation_prompt_mode: str = "adaptive"  # detailed, concise, minimal, adaptive
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()
