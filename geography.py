#!/usr/bin/env python3
"""
geography.py - Airport Database & Route Mapping for CASA Dashboard

Provides airport coordinates and route calculations for visualizing
flight routes to Switzerland.

Uses airportsdata package for comprehensive IATA airport coverage.
"""

import math
from functools import lru_cache
from typing import Dict, List, Optional, Tuple
import pandas as pd

try:
    import airportsdata
    AIRPORTS_AVAILABLE = True
except ImportError:
    AIRPORTS_AVAILABLE = False
    print("Warning: airportsdata package not installed. Install with: pip install airportsdata")


# Switzerland coordinates (center point for all routes)
SWITZERLAND = {
    'name': 'Switzerland',
    'lat': 46.8182,
    'lon': 8.2275,
    'city': 'Switzerland'
}

# Fallback coordinates for airports commonly in INAD data but possibly missing from database
FALLBACK_AIRPORTS = {
    # Middle East
    'DXB': {'name': 'Dubai International', 'city': 'Dubai', 'country': 'AE', 'lat': 25.2532, 'lon': 55.3657},
    'DOH': {'name': 'Hamad International', 'city': 'Doha', 'country': 'QA', 'lat': 25.2731, 'lon': 51.6081},
    'AUH': {'name': 'Abu Dhabi International', 'city': 'Abu Dhabi', 'country': 'AE', 'lat': 24.4330, 'lon': 54.6511},
    'RUH': {'name': 'King Khalid International', 'city': 'Riyadh', 'country': 'SA', 'lat': 24.9576, 'lon': 46.6988},
    'JED': {'name': 'King Abdulaziz International', 'city': 'Jeddah', 'country': 'SA', 'lat': 21.6796, 'lon': 39.1566},
    'TLV': {'name': 'Ben Gurion Airport', 'city': 'Tel Aviv', 'country': 'IL', 'lat': 32.0114, 'lon': 34.8867},
    'AMM': {'name': 'Queen Alia International', 'city': 'Amman', 'country': 'JO', 'lat': 31.7226, 'lon': 35.9932},
    'BEY': {'name': 'Beirut–Rafic Hariri', 'city': 'Beirut', 'country': 'LB', 'lat': 33.8209, 'lon': 35.4884},
    'CAI': {'name': 'Cairo International', 'city': 'Cairo', 'country': 'EG', 'lat': 30.1219, 'lon': 31.4056},
    'KWI': {'name': 'Kuwait International', 'city': 'Kuwait City', 'country': 'KW', 'lat': 29.2266, 'lon': 47.9689},
    'BAH': {'name': 'Bahrain International', 'city': 'Manama', 'country': 'BH', 'lat': 26.2708, 'lon': 50.6336},
    'MCT': {'name': 'Muscat International', 'city': 'Muscat', 'country': 'OM', 'lat': 23.5933, 'lon': 58.2844},
    
    # Turkey
    'IST': {'name': 'Istanbul Airport', 'city': 'Istanbul', 'country': 'TR', 'lat': 41.2753, 'lon': 28.7519},
    'SAW': {'name': 'Sabiha Gökçen', 'city': 'Istanbul', 'country': 'TR', 'lat': 40.8986, 'lon': 29.3092},
    'AYT': {'name': 'Antalya Airport', 'city': 'Antalya', 'country': 'TR', 'lat': 36.8987, 'lon': 30.8005},
    'ADB': {'name': 'Izmir Adnan Menderes', 'city': 'Izmir', 'country': 'TR', 'lat': 38.2924, 'lon': 27.1570},
    'ESB': {'name': 'Ankara Esenboğa', 'city': 'Ankara', 'country': 'TR', 'lat': 40.1281, 'lon': 32.9951},
    
    # Africa
    'ADD': {'name': 'Bole International', 'city': 'Addis Ababa', 'country': 'ET', 'lat': 8.9779, 'lon': 38.7993},
    'NBO': {'name': 'Jomo Kenyatta International', 'city': 'Nairobi', 'country': 'KE', 'lat': -1.3192, 'lon': 36.9278},
    'JNB': {'name': 'O.R. Tambo International', 'city': 'Johannesburg', 'country': 'ZA', 'lat': -26.1392, 'lon': 28.2460},
    'CPT': {'name': 'Cape Town International', 'city': 'Cape Town', 'country': 'ZA', 'lat': -33.9649, 'lon': 18.6017},
    'CMN': {'name': 'Mohammed V International', 'city': 'Casablanca', 'country': 'MA', 'lat': 33.3675, 'lon': -7.5898},
    'ALG': {'name': 'Houari Boumediene', 'city': 'Algiers', 'country': 'DZ', 'lat': 36.6910, 'lon': 3.2154},
    'TUN': {'name': 'Tunis-Carthage', 'city': 'Tunis', 'country': 'TN', 'lat': 36.8510, 'lon': 10.2272},
    'LOS': {'name': 'Murtala Muhammed', 'city': 'Lagos', 'country': 'NG', 'lat': 6.5774, 'lon': 3.3212},
    'ACC': {'name': 'Kotoka International', 'city': 'Accra', 'country': 'GH', 'lat': 5.6052, 'lon': -0.1668},
    'DAR': {'name': 'Julius Nyerere', 'city': 'Dar es Salaam', 'country': 'TZ', 'lat': -6.8781, 'lon': 39.2026},
    'EBB': {'name': 'Entebbe International', 'city': 'Entebbe', 'country': 'UG', 'lat': 0.0424, 'lon': 32.4435},
    'KGL': {'name': 'Kigali International', 'city': 'Kigali', 'country': 'RW', 'lat': -1.9686, 'lon': 30.1395},
    'DKR': {'name': 'Blaise Diagne', 'city': 'Dakar', 'country': 'SN', 'lat': 14.6700, 'lon': -17.0733},
    
    # Asia
    'DEL': {'name': 'Indira Gandhi International', 'city': 'Delhi', 'country': 'IN', 'lat': 28.5562, 'lon': 77.1000},
    'BOM': {'name': 'Chhatrapati Shivaji', 'city': 'Mumbai', 'country': 'IN', 'lat': 19.0896, 'lon': 72.8656},
    'BLR': {'name': 'Kempegowda International', 'city': 'Bangalore', 'country': 'IN', 'lat': 13.1986, 'lon': 77.7066},
    'MAA': {'name': 'Chennai International', 'city': 'Chennai', 'country': 'IN', 'lat': 12.9941, 'lon': 80.1709},
    'HYD': {'name': 'Rajiv Gandhi International', 'city': 'Hyderabad', 'country': 'IN', 'lat': 17.2403, 'lon': 78.4294},
    'CCU': {'name': 'Netaji Subhas Chandra Bose', 'city': 'Kolkata', 'country': 'IN', 'lat': 22.6547, 'lon': 88.4467},
    'BKK': {'name': 'Suvarnabhumi Airport', 'city': 'Bangkok', 'country': 'TH', 'lat': 13.6900, 'lon': 100.7501},
    'SIN': {'name': 'Changi Airport', 'city': 'Singapore', 'country': 'SG', 'lat': 1.3644, 'lon': 103.9915},
    'HKG': {'name': 'Hong Kong International', 'city': 'Hong Kong', 'country': 'HK', 'lat': 22.3080, 'lon': 113.9185},
    'PVG': {'name': 'Shanghai Pudong', 'city': 'Shanghai', 'country': 'CN', 'lat': 31.1434, 'lon': 121.8052},
    'PEK': {'name': 'Beijing Capital', 'city': 'Beijing', 'country': 'CN', 'lat': 40.0799, 'lon': 116.6031},
    'NRT': {'name': 'Narita International', 'city': 'Tokyo', 'country': 'JP', 'lat': 35.7647, 'lon': 140.3864},
    'ICN': {'name': 'Incheon International', 'city': 'Seoul', 'country': 'KR', 'lat': 37.4691, 'lon': 126.4505},
    'KUL': {'name': 'Kuala Lumpur International', 'city': 'Kuala Lumpur', 'country': 'MY', 'lat': 2.7456, 'lon': 101.7099},
    'CGK': {'name': 'Soekarno-Hatta', 'city': 'Jakarta', 'country': 'ID', 'lat': -6.1256, 'lon': 106.6558},
    'MNL': {'name': 'Ninoy Aquino International', 'city': 'Manila', 'country': 'PH', 'lat': 14.5086, 'lon': 121.0194},
    'CMB': {'name': 'Bandaranaike International', 'city': 'Colombo', 'country': 'LK', 'lat': 7.1808, 'lon': 79.8841},
    'DAC': {'name': 'Hazrat Shahjalal', 'city': 'Dhaka', 'country': 'BD', 'lat': 23.8433, 'lon': 90.3978},
    'KTM': {'name': 'Tribhuvan International', 'city': 'Kathmandu', 'country': 'NP', 'lat': 27.6966, 'lon': 85.3591},
    'ISB': {'name': 'Islamabad International', 'city': 'Islamabad', 'country': 'PK', 'lat': 33.5605, 'lon': 72.8526},
    'KHI': {'name': 'Jinnah International', 'city': 'Karachi', 'country': 'PK', 'lat': 24.9065, 'lon': 67.1609},
    'LHE': {'name': 'Allama Iqbal International', 'city': 'Lahore', 'country': 'PK', 'lat': 31.5216, 'lon': 74.4036},
    'THR': {'name': 'Imam Khomeini', 'city': 'Tehran', 'country': 'IR', 'lat': 35.4161, 'lon': 51.1522},
    'IKA': {'name': 'Imam Khomeini International', 'city': 'Tehran', 'country': 'IR', 'lat': 35.4161, 'lon': 51.1522},
    'KBL': {'name': 'Hamid Karzai International', 'city': 'Kabul', 'country': 'AF', 'lat': 34.5659, 'lon': 69.2124},
    
    # Europe
    'LHR': {'name': 'London Heathrow', 'city': 'London', 'country': 'GB', 'lat': 51.4700, 'lon': -0.4543},
    'LGW': {'name': 'London Gatwick', 'city': 'London', 'country': 'GB', 'lat': 51.1537, 'lon': -0.1821},
    'CDG': {'name': 'Paris Charles de Gaulle', 'city': 'Paris', 'country': 'FR', 'lat': 49.0097, 'lon': 2.5479},
    'FRA': {'name': 'Frankfurt Airport', 'city': 'Frankfurt', 'country': 'DE', 'lat': 50.0379, 'lon': 8.5622},
    'AMS': {'name': 'Amsterdam Schiphol', 'city': 'Amsterdam', 'country': 'NL', 'lat': 52.3105, 'lon': 4.7683},
    'MAD': {'name': 'Madrid-Barajas', 'city': 'Madrid', 'country': 'ES', 'lat': 40.4983, 'lon': -3.5676},
    'BCN': {'name': 'Barcelona El Prat', 'city': 'Barcelona', 'country': 'ES', 'lat': 41.2971, 'lon': 2.0785},
    'FCO': {'name': 'Rome Fiumicino', 'city': 'Rome', 'country': 'IT', 'lat': 41.8003, 'lon': 12.2389},
    'MXP': {'name': 'Milan Malpensa', 'city': 'Milan', 'country': 'IT', 'lat': 45.6306, 'lon': 8.7281},
    'MUC': {'name': 'Munich Airport', 'city': 'Munich', 'country': 'DE', 'lat': 48.3538, 'lon': 11.7861},
    'VIE': {'name': 'Vienna International', 'city': 'Vienna', 'country': 'AT', 'lat': 48.1103, 'lon': 16.5697},
    'ATH': {'name': 'Athens International', 'city': 'Athens', 'country': 'GR', 'lat': 37.9364, 'lon': 23.9445},
    'WAW': {'name': 'Warsaw Chopin', 'city': 'Warsaw', 'country': 'PL', 'lat': 52.1657, 'lon': 20.9671},
    'PRG': {'name': 'Prague Václav Havel', 'city': 'Prague', 'country': 'CZ', 'lat': 50.1008, 'lon': 14.2600},
    'BUD': {'name': 'Budapest Ferenc Liszt', 'city': 'Budapest', 'country': 'HU', 'lat': 47.4369, 'lon': 19.2556},
    'OTP': {'name': 'Bucharest Henri Coandă', 'city': 'Bucharest', 'country': 'RO', 'lat': 44.5711, 'lon': 26.0850},
    'SOF': {'name': 'Sofia Airport', 'city': 'Sofia', 'country': 'BG', 'lat': 42.6952, 'lon': 23.4062},
    'BEG': {'name': 'Belgrade Nikola Tesla', 'city': 'Belgrade', 'country': 'RS', 'lat': 44.8184, 'lon': 20.3091},
    'SKP': {'name': 'Skopje International', 'city': 'Skopje', 'country': 'MK', 'lat': 41.9616, 'lon': 21.6214},
    'TIA': {'name': 'Tirana International', 'city': 'Tirana', 'country': 'AL', 'lat': 41.4147, 'lon': 19.7206},
    'PRN': {'name': 'Pristina International', 'city': 'Pristina', 'country': 'XK', 'lat': 42.5728, 'lon': 21.0358},
    'SJJ': {'name': 'Sarajevo International', 'city': 'Sarajevo', 'country': 'BA', 'lat': 43.8246, 'lon': 18.3315},
    'ZAG': {'name': 'Zagreb Airport', 'city': 'Zagreb', 'country': 'HR', 'lat': 45.7429, 'lon': 16.0688},
    'LJU': {'name': 'Ljubljana Jože Pučnik', 'city': 'Ljubljana', 'country': 'SI', 'lat': 46.2237, 'lon': 14.4576},
    'TGD': {'name': 'Podgorica Airport', 'city': 'Podgorica', 'country': 'ME', 'lat': 42.3594, 'lon': 19.2519},
    
    # Americas
    'JFK': {'name': 'John F. Kennedy', 'city': 'New York', 'country': 'US', 'lat': 40.6413, 'lon': -73.7781},
    'LAX': {'name': 'Los Angeles International', 'city': 'Los Angeles', 'country': 'US', 'lat': 33.9416, 'lon': -118.4085},
    'MIA': {'name': 'Miami International', 'city': 'Miami', 'country': 'US', 'lat': 25.7959, 'lon': -80.2870},
    'ORD': {'name': 'Chicago O\'Hare', 'city': 'Chicago', 'country': 'US', 'lat': 41.9742, 'lon': -87.9073},
    'SFO': {'name': 'San Francisco International', 'city': 'San Francisco', 'country': 'US', 'lat': 37.6213, 'lon': -122.3790},
    'GRU': {'name': 'São Paulo-Guarulhos', 'city': 'São Paulo', 'country': 'BR', 'lat': -23.4356, 'lon': -46.4731},
    'EZE': {'name': 'Buenos Aires Ezeiza', 'city': 'Buenos Aires', 'country': 'AR', 'lat': -34.8222, 'lon': -58.5358},
    'BOG': {'name': 'El Dorado International', 'city': 'Bogotá', 'country': 'CO', 'lat': 4.7016, 'lon': -74.1469},
    'MEX': {'name': 'Mexico City International', 'city': 'Mexico City', 'country': 'MX', 'lat': 19.4363, 'lon': -99.0721},
    'YYZ': {'name': 'Toronto Pearson', 'city': 'Toronto', 'country': 'CA', 'lat': 43.6777, 'lon': -79.6248},
    'YUL': {'name': 'Montréal-Trudeau', 'city': 'Montréal', 'country': 'CA', 'lat': 45.4706, 'lon': -73.7408},
    
    # Russia & CIS
    'SVO': {'name': 'Sheremetyevo International', 'city': 'Moscow', 'country': 'RU', 'lat': 55.9726, 'lon': 37.4146},
    'DME': {'name': 'Domodedovo International', 'city': 'Moscow', 'country': 'RU', 'lat': 55.4088, 'lon': 37.9063},
    'LED': {'name': 'Pulkovo Airport', 'city': 'St. Petersburg', 'country': 'RU', 'lat': 59.8003, 'lon': 30.2625},
    'TBS': {'name': 'Tbilisi International', 'city': 'Tbilisi', 'country': 'GE', 'lat': 41.6692, 'lon': 44.9547},
    'EVN': {'name': 'Zvartnots International', 'city': 'Yerevan', 'country': 'AM', 'lat': 40.1473, 'lon': 44.3959},
    'GYD': {'name': 'Heydar Aliyev International', 'city': 'Baku', 'country': 'AZ', 'lat': 40.4675, 'lon': 50.0467},
    'ALA': {'name': 'Almaty International', 'city': 'Almaty', 'country': 'KZ', 'lat': 43.3521, 'lon': 77.0405},
    'TSE': {'name': 'Astana International', 'city': 'Astana', 'country': 'KZ', 'lat': 51.0222, 'lon': 71.4669},
    'TAS': {'name': 'Tashkent International', 'city': 'Tashkent', 'country': 'UZ', 'lat': 41.2573, 'lon': 69.2817},
    'KIV': {'name': 'Chișinău International', 'city': 'Chișinău', 'country': 'MD', 'lat': 46.9277, 'lon': 28.9313},
    'IEV': {'name': 'Kyiv Zhuliany', 'city': 'Kyiv', 'country': 'UA', 'lat': 50.4019, 'lon': 30.4497},
    'KBP': {'name': 'Boryspil International', 'city': 'Kyiv', 'country': 'UA', 'lat': 50.3450, 'lon': 30.8947},
    'ODS': {'name': 'Odesa International', 'city': 'Odesa', 'country': 'UA', 'lat': 46.4268, 'lon': 30.6765},
    'FRU': {'name': 'Manas International', 'city': 'Bishkek', 'country': 'KG', 'lat': 43.0613, 'lon': 74.4776},
    'DYU': {'name': 'Dushanbe International', 'city': 'Dushanbe', 'country': 'TJ', 'lat': 38.5433, 'lon': 68.8250},
}


@lru_cache(maxsize=1)
def load_airport_database() -> Dict[str, dict]:
    """
    Load the airport database from airportsdata package.
    Returns dict keyed by IATA code.
    """
    if not AIRPORTS_AVAILABLE:
        return FALLBACK_AIRPORTS.copy()
    
    try:
        airports = airportsdata.load('IATA')
        # Convert to simpler format
        result = {}
        for iata, data in airports.items():
            result[iata] = {
                'name': data.get('name', ''),
                'city': data.get('city', ''),
                'country': data.get('country', ''),
                'lat': data.get('lat', 0),
                'lon': data.get('lon', 0),
            }
        # Add fallbacks for any missing
        for iata, data in FALLBACK_AIRPORTS.items():
            if iata not in result:
                result[iata] = data
        return result
    except Exception as e:
        print(f"Error loading airportsdata: {e}")
        return FALLBACK_AIRPORTS.copy()


def get_airport_info(iata_code: str) -> Optional[dict]:
    """
    Get airport information by IATA code.
    
    Returns:
        dict with name, city, country, lat, lon or None if not found
    """
    if not iata_code:
        return None
    
    iata_code = iata_code.strip().upper()
    airports = load_airport_database()
    
    # Check main database
    if iata_code in airports:
        return airports[iata_code]
    
    # Check fallbacks
    if iata_code in FALLBACK_AIRPORTS:
        return FALLBACK_AIRPORTS[iata_code]
    
    return None


def get_coordinates(iata_code: str) -> Optional[Tuple[float, float]]:
    """
    Get (latitude, longitude) for an airport.
    
    Returns:
        Tuple of (lat, lon) or None if not found
    """
    info = get_airport_info(iata_code)
    if info:
        return (info['lat'], info['lon'])
    return None


def calculate_great_circle_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points in kilometers.
    Uses the Haversine formula.
    """
    R = 6371  # Earth's radius in km
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    
    a = math.sin(delta_lat / 2) ** 2 + \
        math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c


def enrich_routes_with_coordinates(df: pd.DataFrame, 
                                   origin_col: str = 'LastStop') -> pd.DataFrame:
    """
    Add geographic coordinates to a routes DataFrame.
    All routes go to Switzerland (center point).
    
    Args:
        df: DataFrame with route data
        origin_col: Column name containing origin airport IATA codes
    
    Returns:
        DataFrame with added coordinate columns
    """
    result = df.copy()
    
    # Initialize coordinate columns
    result['origin_lat'] = None
    result['origin_lon'] = None
    result['origin_city'] = None
    result['origin_country'] = None
    result['dest_lat'] = SWITZERLAND['lat']
    result['dest_lon'] = SWITZERLAND['lon']
    result['dest_name'] = 'Switzerland'
    result['distance_km'] = None
    result['has_coordinates'] = False
    
    for idx, row in result.iterrows():
        origin_iata = row.get(origin_col, '')
        if not origin_iata:
            continue
            
        origin_info = get_airport_info(origin_iata)
        if origin_info:
            result.at[idx, 'origin_lat'] = origin_info['lat']
            result.at[idx, 'origin_lon'] = origin_info['lon']
            result.at[idx, 'origin_city'] = origin_info.get('city', '')
            result.at[idx, 'origin_country'] = origin_info.get('country', '')
            result.at[idx, 'distance_km'] = calculate_great_circle_distance(
                origin_info['lat'], origin_info['lon'],
                SWITZERLAND['lat'], SWITZERLAND['lon']
            )
            result.at[idx, 'has_coordinates'] = True
    
    return result


def get_coverage_stats(df: pd.DataFrame) -> dict:
    """
    Calculate statistics about geographic coverage in the data.
    """
    if 'has_coordinates' not in df.columns:
        return {'coverage_rate': 0, 'missing_airports': []}
    
    total = len(df)
    with_coords = df['has_coordinates'].sum()
    missing = df[~df['has_coordinates']]['LastStop'].unique().tolist() if 'LastStop' in df.columns else []
    
    return {
        'total_routes': total,
        'with_coordinates': int(with_coords),
        'coverage_rate': (with_coords / total * 100) if total > 0 else 0,
        'missing_airports': missing
    }


# Module testing
if __name__ == "__main__":
    # Test airport loading
    airports = load_airport_database()
    print(f"Loaded {len(airports)} airports")
    
    # Test specific airports
    test_codes = ['IST', 'DXB', 'JFK', 'ADD', 'PRN', 'TIA', 'SKP']
    for code in test_codes:
        info = get_airport_info(code)
        if info:
            dist = calculate_great_circle_distance(info['lat'], info['lon'], SWITZERLAND['lat'], SWITZERLAND['lon'])
            print(f"{code}: {info['city']}, {info.get('country', 'N/A')} - {dist:.0f} km to Switzerland")
        else:
            print(f"{code}: NOT FOUND")
