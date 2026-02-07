"""add is_tank_display to photos

Revision ID: c4d5e6f7g8h9
Revises: b1c2d3e4f5g6
Create Date: 2026-02-08 01:30:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c4d5e6f7g8h9'
down_revision = 'b1c2d3e4f5g6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add is_tank_display column
    op.add_column('photos', sa.Column('is_tank_display', sa.Boolean(), nullable=False, server_default='false'))

    # Remove server default after adding (SQLAlchemy best practice)
    op.alter_column('photos', 'is_tank_display', server_default=None)


def downgrade() -> None:
    op.drop_column('photos', 'is_tank_display')
