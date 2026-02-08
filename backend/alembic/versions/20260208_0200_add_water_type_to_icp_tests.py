"""add water_type to icp_tests

Revision ID: p7q8r9s0t1u2
Revises: k2l3m4n5o6p7
Create Date: 2026-02-08 02:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'p7q8r9s0t1u2'
down_revision = 'k2l3m4n5o6p7'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add water_type column with default value 'saltwater'
    op.add_column('icp_tests', sa.Column('water_type', sa.String(), nullable=False, server_default='saltwater'))

    # Create index on water_type
    op.create_index('ix_icp_tests_water_type', 'icp_tests', ['water_type'])


def downgrade() -> None:
    op.drop_index('ix_icp_tests_water_type', 'icp_tests')
    op.drop_column('icp_tests', 'water_type')
