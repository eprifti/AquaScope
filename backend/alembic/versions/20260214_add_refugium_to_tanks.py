"""add refugium columns to tanks

Revision ID: l3g4h5i6j7k8
Revises: k2f3g4h5i6j7
Create Date: 2026-02-14

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'l3g4h5i6j7k8'
down_revision: Union[str, None] = 'k2f3g4h5i6j7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('tanks', sa.Column('has_refugium', sa.Boolean, nullable=False, server_default=sa.text('false')))
    op.add_column('tanks', sa.Column('refugium_volume_liters', sa.Float, nullable=True))
    op.add_column('tanks', sa.Column('refugium_type', sa.String, nullable=True))
    op.add_column('tanks', sa.Column('refugium_algae', sa.String, nullable=True))
    op.add_column('tanks', sa.Column('refugium_lighting_hours', sa.Float, nullable=True))
    op.add_column('tanks', sa.Column('refugium_notes', sa.Text, nullable=True))


def downgrade() -> None:
    op.drop_column('tanks', 'refugium_notes')
    op.drop_column('tanks', 'refugium_lighting_hours')
    op.drop_column('tanks', 'refugium_algae')
    op.drop_column('tanks', 'refugium_type')
    op.drop_column('tanks', 'refugium_volume_liters')
    op.drop_column('tanks', 'has_refugium')
