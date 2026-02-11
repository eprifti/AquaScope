"""
Unit tests for the price parsing utility (backend/app/utils/price.py)
"""
import pytest

from app.utils.price import parse_price


@pytest.mark.unit
class TestParsePrice:
    """Test parse_price() with various input formats"""

    def test_usd_with_symbol(self):
        assert parse_price("$249.99") == 249.99

    def test_eur_with_symbol(self):
        assert parse_price("€120") == 120.0

    def test_eur_with_decimals(self):
        assert parse_price("€29.95") == 29.95

    def test_price_with_currency_code(self):
        assert parse_price("150 USD") == 150.0

    def test_american_thousands(self):
        assert parse_price("1,250.00") == 1250.0

    def test_european_thousands(self):
        assert parse_price("1.250,00") == 1250.0

    def test_european_decimal_only(self):
        assert parse_price("250,50") == 250.5

    def test_none_input(self):
        assert parse_price(None) is None

    def test_empty_string(self):
        assert parse_price("") is None

    def test_na_string(self):
        assert parse_price("N/A") is None

    def test_no_digits(self):
        assert parse_price("free") is None

    def test_negative_price(self):
        assert parse_price("-50.00") == -50.0

    def test_integer_price(self):
        assert parse_price("400") == 400.0

    def test_price_with_spaces(self):
        assert parse_price("  €29.95  ") == 29.95

    def test_large_european_price(self):
        assert parse_price("1.982,86") == 1982.86

    def test_gbp_symbol(self):
        assert parse_price("£100.50") == 100.5
