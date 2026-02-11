#!/usr/bin/env python3
"""
Import expenses from Excel (Aquarium_recifal.xlsx / Expenses sheet) into AquaScope.

Reads the Excel file, categorizes items, and creates them via the AquaScope API.
Categories:
  - Materiel → Equipment
  - Décor & consomables → Consumables
  - Poissons → Livestock (fish)
  - Escargots → Livestock (invertebrate)
  - Starfish → Livestock (invertebrate)
  - Crevettes → Livestock (invertebrate)
  - Coraux → Livestock (coral)
"""

import requests
import openpyxl
import sys
import json
from datetime import datetime, date

# Configuration
API_BASE = "http://localhost:8000/api/v1"
EXCEL_PATH = "/app/data/my_raw_data/Aquarium_recifal.xlsx"
EMAIL = "***REDACTED_EMAIL***"
PASSWORD = "***REDACTED***"
TANK_ID = "0104bd6a-6aef-4833-a8d0-f922368feaaa"


def login():
    """Get JWT token."""
    resp = requests.post(
        f"{API_BASE}/auth/login",
        data={"username": EMAIL, "password": PASSWORD},
    )
    resp.raise_for_status()
    return resp.json()["access_token"]


def get_headers(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


def compute_cost(qty, unit_cost, discount):
    """Compute total cost: qty * unit_cost - discount."""
    if unit_cost is None or unit_cost == 0:
        return None
    q = qty if qty and qty > 0 else 1
    d = discount if discount and discount > 0 else 0
    total = q * unit_cost - d
    return round(total, 2) if total > 0 else None


def format_date(d):
    """Convert Excel date to YYYY-MM-DD string."""
    if d is None:
        return None
    if isinstance(d, datetime):
        return d.strftime("%Y-%m-%d")
    if isinstance(d, date):
        return d.strftime("%Y-%m-%d")
    if isinstance(d, str):
        return d
    return None


def format_price(cost):
    """Format cost as EUR string."""
    if cost is None:
        return None
    return f"€{cost:.2f}"


def read_excel():
    """Read the Expenses sheet and return categorized items."""
    wb = openpyxl.load_workbook(EXCEL_PATH)
    ws = wb["Expenses"]

    items = []
    current_category = None

    for row in ws.iter_rows(min_row=2, max_col=13, values_only=False):
        vals = [cell.value for cell in row]
        article = vals[0]
        # Column B (index 1) is sometimes empty
        purchase_date = vals[2]
        vendor = vals[3]
        notes = vals[4]
        quantity = vals[5]
        unit_cost = vals[6]
        discount = vals[7]
        cost_raw = vals[8]
        status = vals[9]
        phone = vals[10]
        url = vals[11]

        # Skip empty rows
        if article is None and all(v is None for v in vals[1:]):
            continue

        # Detect category headers
        if article and isinstance(article, str):
            article_lower = article.strip().lower()
            if article_lower in ("materiel", "matériel"):
                current_category = "equipment"
                continue
            elif article_lower in ("decor & consomables", "décor & consomables",
                                   "décor & consommables", "decor & consommables"):
                current_category = "consumable"
                continue
            elif article_lower in ("poissons", "poisson"):
                current_category = "fish"
                continue
            elif article_lower in ("escargots", "escargot"):
                current_category = "invertebrate_snail"
                continue
            elif article_lower in ("starfish", "étoiles de mer"):
                current_category = "invertebrate_star"
                continue
            elif article_lower in ("crevettes", "crevette"):
                current_category = "invertebrate_shrimp"
                continue
            elif article_lower in ("coraux", "corail"):
                current_category = "coral"
                continue
            elif article_lower.startswith("total"):
                current_category = None
                continue

        if current_category is None or article is None:
            continue

        # Compute actual cost
        if isinstance(cost_raw, (int, float)) and cost_raw > 0:
            cost = round(float(cost_raw), 2)
        else:
            cost = compute_cost(quantity, unit_cost, discount)

        items.append({
            "category": current_category,
            "name": str(article).strip(),
            "date": format_date(purchase_date),
            "vendor": str(vendor).strip() if vendor else None,
            "notes": str(notes).strip() if notes else None,
            "quantity": int(quantity) if quantity and quantity > 0 else 1,
            "unit_cost": float(unit_cost) if unit_cost else None,
            "discount": float(discount) if discount and discount > 0 else None,
            "cost": cost,
            "status": str(status).strip() if status else None,
            "phone": str(phone).strip() if phone else None,
            "url": str(url).strip() if url else None,
        })

    return items


def create_equipment(headers, item):
    """Create an equipment item."""
    notes_parts = []
    if item["vendor"]:
        notes_parts.append(f"Vendor: {item['vendor']}")
    if item["notes"]:
        notes_parts.append(item["notes"])
    if item["url"]:
        notes_parts.append(f"URL: {item['url']}")
    if item["phone"]:
        notes_parts.append(f"Tel: {item['phone']}")

    data = {
        "tank_id": TANK_ID,
        "name": item["name"],
        "equipment_type": "general",
        "purchase_date": item["date"],
        "purchase_price": format_price(item["cost"]),
        "status": "active",
        "notes": "\n".join(notes_parts) if notes_parts else None,
    }
    # Remove None values
    data = {k: v for k, v in data.items() if v is not None}

    resp = requests.post(f"{API_BASE}/equipment/", headers=headers, json=data)
    if resp.status_code in (200, 201):
        print(f"  [OK] Equipment: {item['name']} ({format_price(item['cost'])})")
        return True
    else:
        print(f"  [FAIL] Equipment: {item['name']} - {resp.status_code}: {resp.text}")
        return False


def create_consumable(headers, item):
    """Create a consumable item."""
    notes_parts = []
    if item["vendor"]:
        notes_parts.append(f"Vendor: {item['vendor']}")
    if item["notes"]:
        notes_parts.append(item["notes"])
    if item["url"]:
        notes_parts.append(f"URL: {item['url']}")
    if item["phone"]:
        notes_parts.append(f"Tel: {item['phone']}")

    # Try to guess consumable type
    name_lower = item["name"].lower()
    if any(w in name_lower for w in ("sel ", "salt", "coral pro", "instant ocean", "red sea coral")):
        ctype = "salt_mix"
    elif any(w in name_lower for w in ("test", "reactif", "hanna")):
        ctype = "test_kit"
    elif any(w in name_lower for w in ("kh+", "calcium", "essentials", "manganese", "iron", "fluor", "iode")):
        ctype = "additive"
    elif any(w in name_lower for w in ("carbon", "seagel", "phosguard", "gfo", "charbon")):
        ctype = "filter_media"
    elif any(w in name_lower for w in ("colle", "stone fix", "glue")):
        ctype = "gear"
    elif any(w in name_lower for w in ("sable", "sand", "sandi")):
        ctype = "decoration"
    elif any(w in name_lower for w in ("pierre", "rock", "live rock")):
        ctype = "decoration"
    elif any(w in name_lower for w in ("roller", "rouleau")):
        ctype = "filter_media"
    elif any(w in name_lower for w in ("dino x", "stability", "bacto", "life source", "phytomaxx")):
        ctype = "supplement"
    elif any(w in name_lower for w in ("t-shirt",)):
        ctype = "other"
    else:
        ctype = "other"

    data = {
        "tank_id": TANK_ID,
        "name": item["name"],
        "consumable_type": ctype,
        "quantity_on_hand": item["quantity"],
        "purchase_date": item["date"],
        "purchase_price": format_price(item["cost"]),
        "purchase_url": item["url"],
        "status": "active",
        "notes": "\n".join(notes_parts) if notes_parts else None,
    }
    data = {k: v for k, v in data.items() if v is not None}

    resp = requests.post(f"{API_BASE}/consumables/", headers=headers, json=data)
    if resp.status_code in (200, 201):
        print(f"  [OK] Consumable: {item['name']} ({format_price(item['cost'])})")
        return True
    else:
        print(f"  [FAIL] Consumable: {item['name']} - {resp.status_code}: {resp.text}")
        return False


def create_livestock(headers, item, livestock_type):
    """Create a livestock item."""
    notes_parts = []
    if item["vendor"]:
        notes_parts.append(f"Vendor: {item['vendor']}")
    if item["notes"]:
        notes_parts.append(item["notes"])
    if item["url"]:
        notes_parts.append(f"URL: {item['url']}")
    if item["phone"]:
        notes_parts.append(f"Tel: {item['phone']}")

    # Determine status
    status = "alive"
    if item["status"]:
        s = item["status"].lower()
        if s in ("disparu", "mort", "dead"):
            status = "dead"
        elif s in ("removed", "retiré"):
            status = "removed"

    data = {
        "tank_id": TANK_ID,
        "species_name": item["name"],
        "type": livestock_type,
        "quantity": item["quantity"],
        "status": status,
        "added_date": item["date"],
        "purchase_price": format_price(item["cost"]),
        "notes": "\n".join(notes_parts) if notes_parts else None,
    }
    data = {k: v for k, v in data.items() if v is not None}

    resp = requests.post(f"{API_BASE}/livestock/", headers=headers, json=data)
    if resp.status_code in (200, 201):
        print(f"  [OK] Livestock ({livestock_type}): {item['name']} x{item['quantity']} ({format_price(item['cost'])})")
        return True
    else:
        print(f"  [FAIL] Livestock ({livestock_type}): {item['name']} - {resp.status_code}: {resp.text}")
        return False


def main():
    print("=" * 60)
    print("AquaScope Expense Import from Excel")
    print("=" * 60)

    # Login
    print("\n[1] Logging in...")
    token = login()
    headers = get_headers(token)
    print("  Authenticated successfully")

    # Read Excel
    print("\n[2] Reading Excel file...")
    items = read_excel()
    print(f"  Found {len(items)} items")

    # Categorize
    categories = {}
    for item in items:
        cat = item["category"]
        categories.setdefault(cat, []).append(item)

    for cat, cat_items in categories.items():
        total = sum(i["cost"] or 0 for i in cat_items)
        print(f"  {cat}: {len(cat_items)} items, total €{total:.2f}")

    # Import
    print("\n[3] Importing equipment...")
    eq_ok = eq_fail = 0
    for item in categories.get("equipment", []):
        if create_equipment(headers, item):
            eq_ok += 1
        else:
            eq_fail += 1

    print(f"\n[4] Importing consumables...")
    co_ok = co_fail = 0
    for item in categories.get("consumable", []):
        if create_consumable(headers, item):
            co_ok += 1
        else:
            co_fail += 1

    print(f"\n[5] Importing fish...")
    ls_ok = ls_fail = 0
    for item in categories.get("fish", []):
        if create_livestock(headers, item, "fish"):
            ls_ok += 1
        else:
            ls_fail += 1

    print(f"\n[6] Importing invertebrates (snails)...")
    for item in categories.get("invertebrate_snail", []):
        if create_livestock(headers, item, "invertebrate"):
            ls_ok += 1
        else:
            ls_fail += 1

    print(f"\n[7] Importing invertebrates (starfish)...")
    for item in categories.get("invertebrate_star", []):
        if create_livestock(headers, item, "invertebrate"):
            ls_ok += 1
        else:
            ls_fail += 1

    print(f"\n[8] Importing invertebrates (shrimp)...")
    for item in categories.get("invertebrate_shrimp", []):
        if create_livestock(headers, item, "invertebrate"):
            ls_ok += 1
        else:
            ls_fail += 1

    print(f"\n[9] Importing corals...")
    for item in categories.get("coral", []):
        if create_livestock(headers, item, "coral"):
            ls_ok += 1
        else:
            ls_fail += 1

    # Summary
    print("\n" + "=" * 60)
    print("Import Summary")
    print("=" * 60)
    print(f"  Equipment:   {eq_ok} created, {eq_fail} failed")
    print(f"  Consumables: {co_ok} created, {co_fail} failed")
    print(f"  Livestock:   {ls_ok} created, {ls_fail} failed")
    total_cost = sum(i["cost"] or 0 for i in items)
    print(f"  Total value: €{total_cost:.2f}")
    print("=" * 60)


if __name__ == "__main__":
    main()
