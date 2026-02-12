"""
Tank Maturity Score Service

Computes a 0-100 maturity score for each tank based on:
- Age (0-30): Time since setup
- Parameter Stability (0-40): Low CV of key parameters over 60 days
- Livestock Diversity (0-30): Species count, type diversity, population health
"""
import math
from datetime import date
from typing import Dict, List, Optional, Tuple
from uuid import UUID
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.livestock import Livestock
from app.services.influxdb import influxdb_service


MATURITY_LEVELS = [
    (80, "mature"),
    (60, "thriving"),
    (40, "established"),
    (20, "growing"),
    (0, "new"),
]

STABILITY_PARAMS = {
    "saltwater": ["temperature", "alkalinity_kh", "calcium", "magnesium", "nitrate", "phosphate"],
    "freshwater": ["temperature", "ph", "gh"],
    "brackish": ["temperature", "ph", "salinity"],
}

MIN_READINGS = 5


def get_maturity_level(score: int) -> str:
    for threshold, name in MATURITY_LEVELS:
        if score >= threshold:
            return name
    return "new"


def calculate_age_score(setup_date: Optional[date]) -> int:
    if setup_date is None:
        return 0
    age_days = (date.today() - setup_date).days
    if age_days < 0:
        return 0
    if age_days <= 30:
        return round(5 * (age_days / 30))
    if age_days <= 90:
        return round(5 + 10 * ((age_days - 30) / 60))
    if age_days <= 365:
        return round(15 + 10 * ((age_days - 90) / 275))
    if age_days <= 730:
        return round(25 + 3 * ((age_days - 365) / 365))
    return 30


def _cv_to_score(cv: float) -> float:
    """Map coefficient of variation to a 0.0-1.0 score."""
    if cv <= 0.02:
        return 1.0
    if cv <= 0.05:
        return 0.7 + 0.3 * ((0.05 - cv) / 0.03)
    if cv <= 0.10:
        return 0.4 + 0.3 * ((0.10 - cv) / 0.05)
    if cv <= 0.20:
        return 0.1 + 0.3 * ((0.20 - cv) / 0.10)
    return 0.0


def calculate_stability_scores_batch(
    user_id: str,
    tank_configs: Dict[str, str],
) -> Dict[str, int]:
    """Compute parameter stability scores for all tanks in one InfluxDB call."""
    if not tank_configs:
        return {}

    try:
        stats = influxdb_service.query_parameter_stats_batch(
            user_id=user_id,
            tank_ids=list(tank_configs.keys()),
            start="-90d",
        )
    except Exception:
        return {}

    results = {}
    for tank_id, water_type in tank_configs.items():
        params = STABILITY_PARAMS.get(water_type, STABILITY_PARAMS["saltwater"])
        tank_stats = stats.get(tank_id, {})

        if not params:
            results[tank_id] = 0
            continue

        points_per_param = 40.0 / len(params)
        total = 0.0

        for param in params:
            ps = tank_stats.get(param)
            if not ps or ps["count"] < MIN_READINGS:
                continue
            mean = ps["mean"]
            stddev = ps["stddev"]
            cv = (stddev / mean) if mean != 0 else 0.0
            total += points_per_param * _cv_to_score(cv)

        results[tank_id] = round(total)

    return results


def calculate_livestock_scores_batch(
    db: Session,
    tank_ids: List[UUID],
) -> Dict[str, int]:
    """Compute livestock diversity scores for all tanks in one SQL query."""
    if not tank_ids:
        return {}

    rows = (
        db.query(
            Livestock.tank_id,
            func.count(func.distinct(Livestock.species_name)).label("species_count"),
            func.count(func.distinct(Livestock.type)).label("type_count"),
            func.avg(Livestock.quantity).label("avg_quantity"),
        )
        .filter(
            Livestock.tank_id.in_(tank_ids),
            Livestock.status == "alive",
            Livestock.is_archived == False,
        )
        .group_by(Livestock.tank_id)
        .all()
    )

    results = {}
    for row in rows:
        tid = str(row.tank_id)
        sc = row.species_count or 0
        tc = row.type_count or 0
        aq = float(row.avg_quantity or 0)

        # Species count score (0-15)
        if sc == 0:
            species_score = 0
        elif sc <= 2:
            species_score = 3
        elif sc <= 5:
            species_score = 7
        elif sc <= 10:
            species_score = 11
        elif sc <= 20:
            species_score = 13
        else:
            species_score = 15

        # Type diversity score (0-10)
        type_score = {0: 0, 1: 3, 2: 7}.get(tc, 10)

        # Population health score (0-5)
        if aq >= 3:
            pop_score = 5
        elif aq >= 2:
            pop_score = 3
        elif aq >= 1:
            pop_score = 1
        else:
            pop_score = 0

        results[tid] = species_score + type_score + pop_score

    return results


def compute_maturity_batch(
    db: Session,
    user_id: str,
    tanks: List[Tuple[UUID, Optional[date], str]],
) -> Dict[str, dict]:
    """
    Compute maturity scores for all tanks.

    Args:
        tanks: List of (tank_id, setup_date, water_type) tuples
    Returns:
        {tank_id_str: {score, level, age_score, stability_score, livestock_score}}
    """
    if not tanks:
        return {}

    tank_ids = [t[0] for t in tanks]
    tank_configs = {str(t[0]): (t[2] or "saltwater") for t in tanks}

    age_scores = {str(t[0]): calculate_age_score(t[1]) for t in tanks}
    stability_scores = calculate_stability_scores_batch(user_id, tank_configs)
    livestock_scores = calculate_livestock_scores_batch(db, tank_ids)

    results = {}
    for t in tanks:
        tid = str(t[0])
        age = age_scores.get(tid, 0)
        stability = stability_scores.get(tid, 0)
        livestock = livestock_scores.get(tid, 0)
        total = min(age + stability + livestock, 100)
        results[tid] = {
            "score": total,
            "level": get_maturity_level(total),
            "age_score": age,
            "stability_score": stability,
            "livestock_score": livestock,
        }
    return results
