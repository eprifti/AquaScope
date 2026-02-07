#!/bin/bash
# Database Initialization Script
#
# This script initializes the database by:
# 1. Waiting for PostgreSQL to be ready
# 2. Running Alembic migrations to create tables
#
# Usage: ./scripts/init_db.sh

set -e

echo "Waiting for PostgreSQL to be ready..."
until PGPASSWORD=$POSTGRES_PASSWORD psql -h "postgres" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\q' 2>/dev/null; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

echo "PostgreSQL is up - running migrations..."
cd /app
alembic upgrade head

echo "Database initialized successfully!"
