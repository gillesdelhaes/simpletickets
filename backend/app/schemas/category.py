from datetime import datetime

from pydantic import BaseModel, field_validator


class CategoryCreate(BaseModel):
    name: str

    @field_validator("name")
    @classmethod
    def not_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Category name cannot be blank")
        return v


class CategoryUpdate(BaseModel):
    name: str | None = None
    is_archived: bool | None = None

    @field_validator("name")
    @classmethod
    def not_blank(cls, v: str | None) -> str | None:
        if v is not None:
            v = v.strip()
            if not v:
                raise ValueError("Category name cannot be blank")
        return v


class CategoryRead(BaseModel):
    id: int
    name: str
    is_archived: bool
    created_at: datetime

    model_config = {"from_attributes": True}
