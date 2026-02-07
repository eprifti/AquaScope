"""add is_admin to users

Revision ID: b1c2d3e4f5g6
Revises: 8d573ff0f26a
Create Date: 2026-02-07 23:45:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'b1c2d3e4f5g6'
down_revision = '8d573ff0f26a'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add is_admin column to users table
    op.add_column('users', sa.Column('is_admin', sa.Boolean(), nullable=False, server_default='false'))

    # Remove server_default after adding the column (cleaner schema)
    op.alter_column('users', 'is_admin', server_default=None)


def downgrade() -> None:
    # Remove is_admin column
    op.drop_column('users', 'is_admin')
