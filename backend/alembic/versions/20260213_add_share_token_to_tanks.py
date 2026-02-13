"""add share_token and share_enabled to tanks

Revision ID: i0d1e2f3g4h5
Revises: h9c0d1e2f3g4
Create Date: 2026-02-13

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'i0d1e2f3g4h5'
down_revision: Union[str, None] = 'h9c0d1e2f3g4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('tanks', sa.Column('share_token', sa.String(16), nullable=True))
    op.add_column('tanks', sa.Column('share_enabled', sa.Boolean(), nullable=False, server_default=sa.text('false')))
    op.create_index('ix_tanks_share_token', 'tanks', ['share_token'], unique=True)


def downgrade() -> None:
    op.drop_index('ix_tanks_share_token', table_name='tanks')
    op.drop_column('tanks', 'share_enabled')
    op.drop_column('tanks', 'share_token')
