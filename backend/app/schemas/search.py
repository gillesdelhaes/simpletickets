from pydantic import BaseModel

from app.schemas.ticket import TicketRead


class SearchResultItem(BaseModel):
    ticket: TicketRead
    rank: float
    headline: str  # ts_headline snippet with <b> highlights


class SearchResponse(BaseModel):
    query: str
    total: int
    items: list[SearchResultItem]
