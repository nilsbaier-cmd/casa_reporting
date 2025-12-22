#!/usr/bin/env python3
"""
globe.py - Interactive Globe Visualization Component for CASA Dashboard

Creates an interactive map view showing flight routes with:
- Priority-based coloring
- Route arcs to Switzerland
- Detailed tooltips

Uses PyDeck with free CartoDB basemap (no API key required).
"""

import pandas as pd
import pydeck as pdk
from typing import Dict, List, Optional, Tuple

# Priority color mapping (RGBA)
PRIORITY_COLORS = {
    'HIGH_PRIORITY': [239, 68, 68, 220],      # Red
    'WATCH_LIST': [245, 158, 11, 200],         # Orange/Amber
    'CLEAR': [16, 185, 129, 160],              # Green/Teal
    'UNRELIABLE': [148, 163, 184, 140],        # Gray
    'NO_DATA': [113, 128, 150, 100],           # Dark gray
}

# Historical comparison colors
COMPARISON_COLORS = {
    'new': [239, 68, 68, 200],          # Red - new flagged routes
    'resolved': [16, 185, 129, 200],    # Green - resolved routes
    'persistent': [245, 158, 11, 200],  # Orange - still flagged
    'worsening': [220, 38, 127, 200],   # Pink - worsening trend
    'improving': [59, 130, 246, 200],   # Blue - improving trend
}

# Switzerland destination color
SWITZERLAND_COLOR = [99, 102, 241, 255]  # Indigo

# Free basemap styles (no API key required)
# Options: 'dark', 'light', 'road', 'satellite'
BASEMAP_STYLES = {
    'dark': 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    'light': 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    'voyager': 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
}


def get_priority_color(priority: str) -> List[int]:
    """Get RGBA color for priority level."""
    return PRIORITY_COLORS.get(priority, PRIORITY_COLORS['NO_DATA'])


def prepare_arc_data(df: pd.DataFrame) -> List[dict]:
    """
    Prepare data for arc layer visualization.
    All routes go to Switzerland.
    """
    arc_data = []
    
    for _, row in df.iterrows():
        if not row.get('has_coordinates', False):
            continue
        
        priority = row.get('Priority', 'NO_DATA')
        color = get_priority_color(priority)
        
        # Arc width based on INAD count
        inad_count = row.get('INAD', 1)
        width = min(max(inad_count / 2, 2), 12)
        
        arc_data.append({
            'source_position': [float(row['origin_lon']), float(row['origin_lat'])],
            'target_position': [float(row['dest_lon']), float(row['dest_lat'])],
            'source_color': color,
            'target_color': SWITZERLAND_COLOR,
            'width': width,
            'airline': str(row.get('Airline', 'Unknown')),
            'last_stop': str(row.get('LastStop', 'Unknown')),
            'origin_city': str(row.get('origin_city', '')),
            'origin_country': str(row.get('origin_country', '')),
            'inad_count': int(inad_count),
            'pax': int(row.get('PAX', 0)),
            'density': round(float(row.get('Density_permille', 0)), 4),
            'priority': priority,
            'confidence': int(row.get('Confidence', 0)),
            'distance_km': int(row.get('distance_km', 0)) if row.get('distance_km') else 0,
        })
    
    return arc_data


def prepare_airport_markers(df: pd.DataFrame) -> Tuple[List[dict], dict]:
    """
    Prepare data for airport marker layers.
    """
    from geography import SWITZERLAND
    
    origin_markers = []
    seen_origins = set()
    
    for _, row in df.iterrows():
        if not row.get('has_coordinates', False):
            continue
        
        origin_key = row.get('LastStop', '')
        if origin_key in seen_origins:
            continue
        seen_origins.add(origin_key)
        
        # Aggregate stats for this origin
        origin_df = df[df['LastStop'] == origin_key]
        total_inad = int(origin_df['INAD'].sum()) if 'INAD' in origin_df.columns else 0
        
        # Get worst priority
        priorities = origin_df['Priority'].unique() if 'Priority' in origin_df.columns else []
        worst_priority = 'CLEAR'
        for p in ['HIGH_PRIORITY', 'WATCH_LIST', 'UNRELIABLE']:
            if p in priorities:
                worst_priority = p
                break
        
        color = get_priority_color(worst_priority)
        
        origin_markers.append({
            'position': [float(row['origin_lon']), float(row['origin_lat'])],
            'color': color,
            'radius': min(max(total_inad * 1000, 15000), 80000),
            'iata': origin_key,
            'city': str(row.get('origin_city', '')),
            'total_inad': total_inad,
            'priority': worst_priority,
        })
    
    # Switzerland marker
    switzerland_marker = {
        'position': [SWITZERLAND['lon'], SWITZERLAND['lat']],
        'color': SWITZERLAND_COLOR,
        'radius': 50000,
        'name': 'Switzerland',
    }
    
    return origin_markers, switzerland_marker


def create_globe_view(df: pd.DataFrame,
                      height: int = 600,
                      show_labels: bool = True,
                      show_animation: bool = True,
                      basemap: str = 'dark') -> pdk.Deck:
    """
    Create an interactive map visualization.
    
    Args:
        df: DataFrame with route data (must have coordinate columns)
        height: Height of the visualization in pixels
        show_labels: Whether to show airport labels
        show_animation: Not used (kept for compatibility)
        basemap: 'dark', 'light', or 'voyager'
    
    Returns:
        pydeck.Deck object for rendering
    """
    # Prepare data
    arc_data = prepare_arc_data(df)
    origin_markers, switzerland_marker = prepare_airport_markers(df)
    
    # View centered on Europe/Middle East to see routes to Switzerland
    view_state = pdk.ViewState(
        latitude=42.0,
        longitude=20.0,
        zoom=3,
        pitch=45,
        bearing=0,
    )
    
    layers = []
    
    # Arc layer for routes
    if arc_data:
        arc_layer = pdk.Layer(
            'ArcLayer',
            data=arc_data,
            get_source_position='source_position',
            get_target_position='target_position',
            get_source_color='source_color',
            get_target_color='target_color',
            get_width='width',
            pickable=True,
            auto_highlight=True,
            highlight_color=[255, 255, 0, 128],
            great_circle=True,
        )
        layers.append(arc_layer)
    
    # Origin airport markers
    if origin_markers:
        origin_layer = pdk.Layer(
            'ScatterplotLayer',
            data=origin_markers,
            get_position='position',
            get_fill_color='color',
            get_radius='radius',
            pickable=True,
            auto_highlight=True,
            opacity=0.8,
            stroked=True,
            get_line_color=[255, 255, 255, 200],
            line_width_min_pixels=1,
        )
        layers.append(origin_layer)
    
    # Switzerland destination marker
    dest_layer = pdk.Layer(
        'ScatterplotLayer',
        data=[switzerland_marker],
        get_position='position',
        get_fill_color='color',
        get_radius='radius',
        pickable=True,
        stroked=True,
        get_line_color=[255, 255, 255, 255],
        line_width_min_pixels=2,
    )
    layers.append(dest_layer)
    
    # Get basemap style
    map_style = BASEMAP_STYLES.get(basemap, BASEMAP_STYLES['dark'])
    
    # Tooltip
    tooltip = {
        'html': '''
            <div style="font-family: Arial, sans-serif; padding: 8px;">
                <b>{airline}</b> → <b>{last_stop}</b><br/>
                <span style="color: #888;">{origin_city}, {origin_country}</span><br/><br/>
                <b>INAD:</b> {inad_count}<br/>
                <b>PAX:</b> {pax}<br/>
                <b>Density:</b> {density}‰<br/>
                <b>Distance:</b> {distance_km} km<br/>
                <b>Confidence:</b> {confidence}%<br/><br/>
                <b>Priority:</b> {priority}
            </div>
        ''',
        'style': {
            'backgroundColor': 'rgba(30, 41, 59, 0.95)',
            'color': 'white',
            'borderRadius': '8px',
        }
    }
    
    # Create deck
    deck = pdk.Deck(
        layers=layers,
        initial_view_state=view_state,
        map_style=map_style,
        tooltip=tooltip,
        height=height,
    )
    
    return deck


def create_comparison_view(current_df: pd.DataFrame,
                           previous_df: pd.DataFrame,
                           height: int = 500) -> Tuple[pdk.Deck, dict]:
    """
    Create a comparison view showing changes between two semesters.
    """
    from geography import SWITZERLAND
    
    # Get flagged routes from each semester
    current_flagged = set()
    previous_flagged = set()
    
    current_df_flagged = current_df[current_df['Priority'].isin(['HIGH_PRIORITY', 'WATCH_LIST'])]
    previous_df_flagged = previous_df[previous_df['Priority'].isin(['HIGH_PRIORITY', 'WATCH_LIST'])]
    
    for _, row in current_df_flagged.iterrows():
        current_flagged.add((row['Airline'], row['LastStop']))
    
    for _, row in previous_df_flagged.iterrows():
        previous_flagged.add((row['Airline'], row['LastStop']))
    
    # Categorize routes
    new_routes = current_flagged - previous_flagged
    resolved_routes = previous_flagged - current_flagged
    persistent_routes = current_flagged & previous_flagged
    
    # Prepare arc data with comparison colors
    arc_data = []
    
    for _, row in current_df.iterrows():
        if not row.get('has_coordinates', False):
            continue
        
        route_key = (row['Airline'], row['LastStop'])
        
        if route_key in new_routes:
            color = COMPARISON_COLORS['new']
            status = 'NEW'
        elif route_key in persistent_routes:
            # Check trend
            prev_row = previous_df[(previous_df['Airline'] == row['Airline']) & 
                                   (previous_df['LastStop'] == row['LastStop'])]
            if len(prev_row) > 0:
                prev_density = prev_row.iloc[0].get('Density_permille', 0)
                curr_density = row.get('Density_permille', 0)
                if curr_density > prev_density * 1.1:
                    color = COMPARISON_COLORS['worsening']
                    status = 'WORSENING'
                elif curr_density < prev_density * 0.9:
                    color = COMPARISON_COLORS['improving']
                    status = 'IMPROVING'
                else:
                    color = COMPARISON_COLORS['persistent']
                    status = 'PERSISTENT'
            else:
                color = COMPARISON_COLORS['persistent']
                status = 'PERSISTENT'
        else:
            continue
        
        arc_data.append({
            'source_position': [float(row['origin_lon']), float(row['origin_lat'])],
            'target_position': [float(row['dest_lon']), float(row['dest_lat'])],
            'source_color': color,
            'target_color': SWITZERLAND_COLOR,
            'width': 4,
            'airline': str(row.get('Airline', 'Unknown')),
            'last_stop': str(row.get('LastStop', 'Unknown')),
            'origin_city': str(row.get('origin_city', '')),
            'status': status,
        })
    
    # Add resolved routes from previous semester
    for _, row in previous_df.iterrows():
        if not row.get('has_coordinates', False):
            continue
        
        route_key = (row['Airline'], row['LastStop'])
        if route_key in resolved_routes:
            arc_data.append({
                'source_position': [float(row['origin_lon']), float(row['origin_lat'])],
                'target_position': [float(row['dest_lon']), float(row['dest_lat'])],
                'source_color': COMPARISON_COLORS['resolved'],
                'target_color': [16, 185, 129, 100],
                'width': 3,
                'airline': str(row.get('Airline', 'Unknown')),
                'last_stop': str(row.get('LastStop', 'Unknown')),
                'origin_city': str(row.get('origin_city', '')),
                'status': 'RESOLVED',
            })
    
    layers = []
    
    if arc_data:
        arc_layer = pdk.Layer(
            'ArcLayer',
            data=arc_data,
            get_source_position='source_position',
            get_target_position='target_position',
            get_source_color='source_color',
            get_target_color='target_color',
            get_width='width',
            pickable=True,
            auto_highlight=True,
            great_circle=True,
        )
        layers.append(arc_layer)
    
    # Switzerland marker
    dest_layer = pdk.Layer(
        'ScatterplotLayer',
        data=[{
            'position': [SWITZERLAND['lon'], SWITZERLAND['lat']],
            'color': SWITZERLAND_COLOR,
            'radius': 50000,
        }],
        get_position='position',
        get_fill_color='color',
        get_radius='radius',
        stroked=True,
        get_line_color=[255, 255, 255, 255],
        line_width_min_pixels=2,
    )
    layers.append(dest_layer)
    
    view_state = pdk.ViewState(
        latitude=42.0,
        longitude=20.0,
        zoom=3,
        pitch=45,
        bearing=0,
    )
    
    tooltip = {
        'html': '<b>{airline}</b> → <b>{last_stop}</b><br/>{origin_city}<br/><b>{status}</b>',
        'style': {
            'backgroundColor': 'rgba(30, 41, 59, 0.95)',
            'color': 'white',
        }
    }
    
    deck = pdk.Deck(
        layers=layers,
        initial_view_state=view_state,
        map_style=BASEMAP_STYLES['dark'],
        tooltip=tooltip,
        height=height,
    )
    
    stats = {
        'new_count': len(new_routes),
        'resolved_count': len(resolved_routes),
        'persistent_count': len(persistent_routes),
        'new_routes': list(new_routes),
        'resolved_routes': list(resolved_routes),
        'persistent_routes': list(persistent_routes),
    }
    
    return deck, stats


def get_route_statistics(df: pd.DataFrame) -> dict:
    """Calculate summary statistics for globe view."""
    if df.empty:
        return {}
    
    stats = {
        'total_routes': len(df),
        'routes_with_coords': int(df['has_coordinates'].sum()) if 'has_coordinates' in df.columns else 0,
        'total_inad': int(df['INAD'].sum()) if 'INAD' in df.columns else 0,
        'unique_origins': df['LastStop'].nunique() if 'LastStop' in df.columns else 0,
    }
    
    if 'Priority' in df.columns:
        stats['priority_breakdown'] = df['Priority'].value_counts().to_dict()
    
    return stats
