from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Member
from ..schemas import MemberOut

router = APIRouter(prefix="/api/members", tags=["members"])


@router.get("", response_model=list[MemberOut])
def list_members(db: Session = Depends(get_db)):
    return db.scalars(select(Member).order_by(Member.name)).all()
