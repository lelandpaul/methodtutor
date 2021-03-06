"""bumper mode

Revision ID: 1690c4f115c2
Revises: fcf602eb4363
Create Date: 2020-11-13 17:11:40.554646

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '1690c4f115c2'
down_revision = 'fcf602eb4363'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('card', sa.Column('bumper_mode', sa.Boolean(), default=False))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('card', 'bumper_mode')
    # ### end Alembic commands ###
