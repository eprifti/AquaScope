"""
Price Parsing Utility

Extracts numeric values from price strings that may contain
currency symbols, codes, or formatting.
"""
import re
from typing import Optional


def parse_price(price_str: Optional[str]) -> Optional[float]:
    """Extract numeric value from a price string.

    Examples:
        parse_price("$249.99") -> 249.99
        parse_price("€120") -> 120.0
        parse_price("150 USD") -> 150.0
        parse_price("1,250.00") -> 1250.0
        parse_price(None) -> None
        parse_price("N/A") -> None
    """
    if not price_str:
        return None

    # Remove everything except digits, dots, commas, and minus
    cleaned = re.sub(r'[^\d.,\-]', '', price_str)
    if not cleaned:
        return None

    # Handle mixed dot/comma formats
    if ',' in cleaned and '.' in cleaned:
        if cleaned.rfind(',') > cleaned.rfind('.'):
            # European: 1.250,00
            cleaned = cleaned.replace('.', '').replace(',', '.')
        else:
            # American: 1,250.00
            cleaned = cleaned.replace(',', '')
    elif ',' in cleaned:
        parts = cleaned.split(',')
        if len(parts) == 2 and len(parts[1]) <= 2:
            # Likely decimal: 100,50
            cleaned = cleaned.replace(',', '.')
        else:
            # Likely thousands: 1,250
            cleaned = cleaned.replace(',', '')

    try:
        return float(cleaned)
    except ValueError:
        return None
