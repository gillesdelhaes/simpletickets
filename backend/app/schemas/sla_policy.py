from pydantic import BaseModel, field_validator

from app.models.enums import Priority


class SLAPolicyCreate(BaseModel):
    name: str
    priority: Priority
    first_response_minutes: int
    resolution_minutes: int

    @field_validator("first_response_minutes", "resolution_minutes")
    @classmethod
    def positive(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("Minutes must be a positive integer")
        return v

    @field_validator("name")
    @classmethod
    def not_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Policy name cannot be blank")
        return v


class SLAPolicyUpdate(BaseModel):
    name: str | None = None
    first_response_minutes: int | None = None
    resolution_minutes: int | None = None

    @field_validator("first_response_minutes", "resolution_minutes")
    @classmethod
    def positive(cls, v: int | None) -> int | None:
        if v is not None and v <= 0:
            raise ValueError("Minutes must be a positive integer")
        return v

    @field_validator("name")
    @classmethod
    def not_blank(cls, v: str | None) -> str | None:
        if v is not None:
            v = v.strip()
            if not v:
                raise ValueError("Policy name cannot be blank")
        return v


class SLAPolicyRead(BaseModel):
    id: int
    name: str
    priority: Priority
    first_response_minutes: int
    resolution_minutes: int

    model_config = {"from_attributes": True}
