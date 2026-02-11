"""add electricity_cost_per_day to tanks

Revision ID: h9c0d1e2f3g4
Revises: g8b9c0d1e2f3
Create Date: 2026-02-12

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'h9c0d1e2f3g4'
down_revision: Union[str, None] = 'g8b9c0d1e2f3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('tanks', sa.Column('electricity_cost_per_day', sa.Float(), nullable=True))


def downgrade() -> None:
    op.drop_column('tanks', 'electricity_cost_per_day')
