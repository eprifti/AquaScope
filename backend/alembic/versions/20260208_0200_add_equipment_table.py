"""add equipment table

Revision ID: e5f6g7h8i9j0
Revises: c4d5e6f7g8h9
Create Date: 2026-02-08 02:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'e5f6g7h8i9j0'
down_revision = 'c4d5e6f7g8h9'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create equipment table
    op.create_table(
        'equipment',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tank_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('equipment_type', sa.String(), nullable=False),
        sa.Column('manufacturer', sa.String(), nullable=True),
        sa.Column('model', sa.String(), nullable=True),
        sa.Column('specs', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('purchase_date', sa.Date(), nullable=True),
        sa.Column('purchase_price', sa.String(), nullable=True),
        sa.Column('condition', sa.String(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['tank_id'], ['tanks.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Create indexes
    op.create_index(op.f('ix_equipment_id'), 'equipment', ['id'], unique=False)
    op.create_index(op.f('ix_equipment_tank_id'), 'equipment', ['tank_id'], unique=False)
    op.create_index(op.f('ix_equipment_user_id'), 'equipment', ['user_id'], unique=False)
    op.create_index(op.f('ix_equipment_name'), 'equipment', ['name'], unique=False)
    op.create_index(op.f('ix_equipment_equipment_type'), 'equipment', ['equipment_type'], unique=False)

    # Add equipment_id column to maintenance_reminders
    op.add_column('maintenance_reminders', sa.Column('equipment_id', postgresql.UUID(as_uuid=True), nullable=True))
    op.create_index(op.f('ix_maintenance_reminders_equipment_id'), 'maintenance_reminders', ['equipment_id'], unique=False)
    op.create_foreign_key(
        'fk_maintenance_reminders_equipment_id_equipment',
        'maintenance_reminders', 'equipment',
        ['equipment_id'], ['id'],
        ondelete='SET NULL'
    )


def downgrade() -> None:
    # Remove equipment_id from maintenance_reminders
    op.drop_constraint('fk_maintenance_reminders_equipment_id_equipment', 'maintenance_reminders', type_='foreignkey')
    op.drop_index(op.f('ix_maintenance_reminders_equipment_id'), table_name='maintenance_reminders')
    op.drop_column('maintenance_reminders', 'equipment_id')

    # Drop equipment table
    op.drop_index(op.f('ix_equipment_equipment_type'), table_name='equipment')
    op.drop_index(op.f('ix_equipment_name'), table_name='equipment')
    op.drop_index(op.f('ix_equipment_user_id'), table_name='equipment')
    op.drop_index(op.f('ix_equipment_tank_id'), table_name='equipment')
    op.drop_index(op.f('ix_equipment_id'), table_name='equipment')
    op.drop_table('equipment')
