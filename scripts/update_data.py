import json
import time
from datetime import datetime, timezone
from pathlib import Path

import requests

BASE = Path(__file__).resolve().parents[1]
DATA = BASE / "data" / "data.json"
DATA.parent.mkdir(parents=True, exist_ok=True)

# Cities with coordinates (Open-Meteo has no key and allows CORS)
CITIES = [
    {"name": "Ho Chi Minh City", "lat": 10.8231, "lon": 106.6297},
    {"name": "Ha Noi", "lat": 21.0278, "lon": 105.8342},
]


def fetch_gold_series():
    # Metals.live provides public endpoint; if fails, return empty
    try:
        r = requests.get("https://api.metals.live/v1/spot/gold", timeout=15)
        if r.ok:
            arr = r.json()
            # Normalize: keep last 24 entries
            series = []
            now = datetime.now(timezone.utc)
            for item in arr[-24:]:
                # item format may be [timestamp, price] or dict; try both
                if isinstance(item, list) and len(item) >= 2:
                    price = float(item[1])
                elif isinstance(item, dict):
                    price = float(item.get("gold", item.get("price", 0)))
                else:
                    continue
                series.append({"t": now.isoformat(), "usd": price})
            return series
    except Exception:
        pass
    return []


def fetch_city_weather(lat, lon):
    try:
        url = (
            "https://api.open-meteo.com/v1/forecast?latitude="
            f"{lat}&longitude={lon}&hourly=temperature_2m&timezone=auto"
        )
        r = requests.get(url, timeout=20)
        if r.ok:
            js = r.json()
            times = js.get("hourly", {}).get("time", [])
            temps = js.get("hourly", {}).get("temperature_2m", [])
            hours = []
            for t, temp in zip(times[-24:], temps[-24:]):
                hours.append({"t": t, "temp": temp})
            return hours
    except Exception:
        pass
    return []


def main():
    updated = datetime.now(timezone.utc).isoformat()

    # Load existing for fallback
    current = {"gold": {"series": []}, "weather": {"cities": []}}
    if DATA.exists():
        try:
            current = json.loads(DATA.read_text("utf-8"))
        except Exception:
            pass

    # Fetch gold
    gold_series = fetch_gold_series() or current.get("gold", {}).get("series", [])

    # Fetch weather
    cities_out = []
    for c in CITIES:
        hours = fetch_city_weather(c["lat"], c["lon"]) or []
        cities_out.append({"name": c["name"], "hours": hours})

    out = {
        "updated_at": updated,
        "gold": {"series": gold_series},
        "weather": {"cities": cities_out},
    }

    DATA.write_text(json.dumps(out, indent=2), encoding="utf-8")
    print("Data updated:", DATA)


if __name__ == "__main__":
    main()
