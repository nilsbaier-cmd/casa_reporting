#!/usr/bin/env python3
"""
globe.py - Interactive Globe Visualization Component for CASA Dashboard

Creates an interactive 3D globe view showing flight routes with:
- Priority-based coloring
- Animated pulsing dots along arcs
- Detailed tooltips
- Historical comparison view

Uses PyDeck (deck.gl wrapper) for Streamlit integration.
"""

import pandas as pd
import pydeck as pdk
from typing import Dict, List, Optional, Tuple
import math
import time

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

# Arc layer configuration
ARC_CONFIG = {
    'width_scale': 2,
    'width_min_pixels': 1,
    'width_max_pixels': 8,
}


def get_priority_color(priority: str) -> List[int]:
    """Get RGBA color for priority level."""
    return PRIORITY_COLORS.get(priority, PRIORITY_COLORS['NO_DATA'])


def prepare_arc_data(df: pd.DataFrame) -> List[dict]:
    """
    Prepare data for arc layer visualization.
    All routes go to Switzerland.
    
    Args:
        df: DataFrame with route data including coordinates
    
    Returns:
        List of dicts for pydeck ArcLayer
    """
    arc_data = []
    
    for _, row in df.iterrows():
        if not row.get('has_coordinates', False):
            continue
        
        # Get priority color
        priority = row.get('Priority', 'NO_DATA')
        color = get_priority_color(priority)
        
        # Calculate arc width based on INAD count (scaled)
        inad_count = row.get('INAD', 1)
        width = min(max(inad_count / 3, 1), 10)  # Scale between 1-10
        
        arc_data.append({
            'source_position': [row['origin_lon'], row['origin_lat']],
            'target_position': [row['dest_lon'], row['dest_lat']],
            'source_color': color,
            'target_color': SWITZERLAND_COLOR,
            'width': width,
            'airline': row.get('Airline', 'Unknown'),
            'last_stop': row.get('LastStop', 'Unknown'),
            'origin_city': row.get('origin_city', ''),
            'origin_country': row.get('origin_country', ''),
            'inad_count': inad_count,
            'pax': row.get('PAX', 0),
            'density': round(row.get('Density_permille', 0), 4),
            'priority': priority,
            'confidence': row.get('Confidence', 0),
            'distance_km': round(row.get('distance_km', 0), 0) if row.get('distance_km') else 0,
        })
    
    return arc_data


def generate_animated_points(arc_data: List[dict], num_points_per_arc: int = 3) -> List[dict]:
    """
    Generate animated points along arcs for pulsing effect.
    
    Args:
        arc_data: List of arc dictionaries
        num_points_per_arc: Number of animated points per arc
    
    Returns:
        List of point dictionaries for ScatterplotLayer
    """
    points = []
    current_time = time.time()
    
    for arc in arc_data:
        src = arc['source_position']
        tgt = arc['target_position']
        color = arc['source_color']
        
        # Generate points along the arc at different positions
        for i in range(num_points_per_arc):
            # Calculate position along arc (0 to 1)
            # Use time-based offset for animation effect
            base_t = (i + 1) / (num_points_per_arc + 1)
            
            # Simple linear interpolation (great circle handled by deck.gl)
            lon = src[0] + base_t * (tgt[0] - src[0])
            lat = src[1] + base_t * (tgt[1] - src[1])
            
            # Pulse size based on position (larger in middle)
            pulse_factor = math.sin(base_t * math.pi)
            
            points.append({
                'position': [lon, lat],
                'color': color[:3] + [int(200 * pulse_factor)],  # Vary alpha
                'radius': 3000 + 5000 * pulse_factor,  # Vary size
                'airline': arc['airline'],
                'last_stop': arc['last_stop'],
            })
    
    return points


def prepare_airport_markers(df: pd.DataFrame) -> Tuple[List[dict], dict]:
    """
    Prepare data for airport marker layers.
    
    Returns:
        Tuple of (origin_markers, switzerland_marker)
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
        
        # Aggregate stats for this origin across all airlines
        origin_df = df[df['LastStop'] == origin_key]
        total_inad = origin_df['INAD'].sum() if 'INAD' in origin_df.columns else 0
        total_pax = origin_df['PAX'].sum() if 'PAX' in origin_df.columns else 0
        
        # Get worst priority for this origin
        priorities = origin_df['Priority'].unique() if 'Priority' in origin_df.columns else []
        worst_priority = 'CLEAR'
        for p in ['HIGH_PRIORITY', 'WATCH_LIST', 'UNRELIABLE']:
            if p in priorities:
                worst_priority = p
                break
        
        color = get_priority_color(worst_priority)
        
        # Size based on total INAD (scaled)
        size = min(max(total_inad * 800, 8000), 50000)
        
        origin_markers.append({
            'position': [row['origin_lon'], row['origin_lat']],
            'color': color,
            'radius': size,
            'iata': origin_key,
            'city': row.get('origin_city', ''),
            'country': row.get('origin_country', ''),
            'total_inad': int(total_inad),
            'total_pax': int(total_pax),
            'priority': worst_priority,
            'airlines': list(origin_df['Airline'].unique()) if 'Airline' in origin_df.columns else [],
        })
    
    # Switzerland destination marker
    switzerland_marker = {
        'position': [SWITZERLAND['lon'], SWITZERLAND['lat']],
        'color': SWITZERLAND_COLOR,
        'radius': 40000,
        'name': 'Switzerland',
        'is_destination': True,
    }
    
    return origin_markers, switzerland_marker


def create_globe_view(df: pd.DataFrame,
                      height: int = 600,
                      show_labels: bool = True,
                      show_animation: bool = True) -> pdk.Deck:
    """
    Create an interactive globe visualization.
    
    Args:
        df: DataFrame with route data (must have coordinate columns)
        height: Height of the visualization in pixels
        show_labels: Whether to show airport labels
        show_animation: Whether to show animated points along arcs
    
    Returns:
        pydeck.Deck object for rendering
    """
    # Prepare data
    arc_data = prepare_arc_data(df)
    origin_markers, switzerland_marker = prepare_airport_markers(df)
    
    # View centered on Europe/Switzerland with good coverage of routes
    view_state = pdk.ViewState(
        latitude=40.0,
        longitude=15.0,
        zoom=2.0,
        pitch=40,
        bearing=0,
    )
    
    # Layers
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
            width_scale=ARC_CONFIG['width_scale'],
            width_min_pixels=ARC_CONFIG['width_min_pixels'],
            width_max_pixels=ARC_CONFIG['width_max_pixels'],
            pickable=True,
            auto_highlight=True,
            get_tilt=15,  # Arc curvature
        )
        layers.append(arc_layer)
    
    # Animated points along arcs (pulsing effect)
    if show_animation and arc_data:
        animated_points = generate_animated_points(arc_data, num_points_per_arc=2)
        if animated_points:
            pulse_layer = pdk.Layer(
                'ScatterplotLayer',
                data=animated_points,
                get_position='position',
                get_fill_color='color',
                get_radius='radius',
                radius_min_pixels=2,
                radius_max_pixels=6,
                pickable=False,
                opacity=0.8,
            )
            layers.append(pulse_layer)
    
    # Origin airport markers
    if origin_markers:
        origin_layer = pdk.Layer(
            'ScatterplotLayer',
            data=origin_markers,
            get_position='position',
            get_fill_color='color',
            get_radius='radius',
            radius_scale=1,
            radius_min_pixels=4,
            radius_max_pixels=15,
            pickable=True,
            auto_highlight=True,
            stroked=True,
            get_line_color=[255, 255, 255, 180],
            line_width_min_pixels=1,
        )
        layers.append(origin_layer)
    
    # Switzerland destination marker (larger, highlighted)
    dest_layer = pdk.Layer(
        'ScatterplotLayer',
        data=[switzerland_marker],
        get_position='position',
        get_fill_color='color',
        get_radius='radius',
        radius_scale=1,
        radius_min_pixels=10,
        radius_max_pixels=25,
        pickable=True,
        stroked=True,
        get_line_color=[255, 255, 255, 255],
        line_width_min_pixels=2,
    )
    layers.append(dest_layer)
    
    # Text label for Switzerland
    if show_labels:
        text_layer = pdk.Layer(
            'TextLayer',
            data=[{'position': [switzerland_marker['position'][0], switzerland_marker['position'][1] + 1.5],
                   'text': '🇨🇭 Switzerland'}],
            get_position='position',
            get_text='text',
            get_size=14,
            get_color=[255, 255, 255, 255],
            get_angle=0,
            get_text_anchor='"middle"',
            get_alignment_baseline='"center"',
            billboard=True,
        )
        layers.append(text_layer)
    
    # Tooltip HTML template
    tooltip_html = '''
        <div style="
            background: rgba(30, 41, 59, 0.95); 
            padding: 12px 16px; 
            border-radius: 10px; 
            font-family: 'Inter', system-ui, -apple-system, sans-serif; 
            min-width: 220px;
            border: 1px solid rgba(99, 102, 241, 0.3);
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        ">
            <div style="font-size: 15px; font-weight: 600; color: #f1f5f9; margin-bottom: 10px; 
                        display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 18px;">✈️</span>
                {airline} → {last_stop}
            </div>
            <div style="font-size: 12px; color: #94a3b8; margin-bottom: 8px;">
                {origin_city}, {origin_country}
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 13px;">
                <div style="color: #94a3b8;">INAD:</div>
                <div style="color: #f1f5f9; font-weight: 600;">{inad_count}</div>
                <div style="color: #94a3b8;">PAX:</div>
                <div style="color: #f1f5f9;">{pax:,}</div>
                <div style="color: #94a3b8;">Density:</div>
                <div style="color: #f1f5f9;">{density}‰</div>
                <div style="color: #94a3b8;">Distance:</div>
                <div style="color: #f1f5f9;">{distance_km:,} km</div>
                <div style="color: #94a3b8;">Confidence:</div>
                <div style="color: #f1f5f9;">{confidence}%</div>
            </div>
            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(148, 163, 184, 0.2);">
                <span style="
                    padding: 4px 10px; 
                    border-radius: 12px; 
                    font-size: 11px; 
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                ">
                    {priority}
                </span>
            </div>
        </div>
    '''
    
    # Create deck
    deck = pdk.Deck(
        layers=layers,
        initial_view_state=view_state,
        map_style='mapbox://styles/mapbox/dark-v10',
        tooltip={
            'html': tooltip_html,
            'style': {
                'backgroundColor': 'transparent',
                'border': 'none',
            }
        },
        height=height,
    )
    
    return deck


def create_comparison_view(current_df: pd.DataFrame,
                           previous_df: pd.DataFrame,
                           height: int = 500) -> Tuple[pdk.Deck, dict]:
    """
    Create a comparison view showing changes between two semesters.
    
    Args:
        current_df: Current semester data with coordinates
        previous_df: Previous semester data with coordinates
        height: Visualization height
    
    Returns:
        Tuple of (pydeck.Deck, comparison_stats dict)
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
        
        # Determine comparison status
        if route_key in new_routes:
            color = COMPARISON_COLORS['new']
            status = 'NEW'
        elif route_key in persistent_routes:
            # Check if worsening or improving
            prev_row = previous_df[(previous_df['Airline'] == row['Airline']) & 
                                   (previous_df['LastStop'] == row['LastStop'])]
            if len(prev_row) > 0:
                prev_density = prev_row.iloc[0].get('Density_permille', 0)
                curr_density = row.get('Density_permille', 0)
                if curr_density > prev_density * 1.1:  # >10% worse
                    color = COMPARISON_COLORS['worsening']
                    status = 'WORSENING'
                elif curr_density < prev_density * 0.9:  # >10% better
                    color = COMPARISON_COLORS['improving']
                    status = 'IMPROVING'
                else:
                    color = COMPARISON_COLORS['persistent']
                    status = 'PERSISTENT'
            else:
                color = COMPARISON_COLORS['persistent']
                status = 'PERSISTENT'
        else:
            continue  # Skip non-flagged routes in comparison view
        
        arc_data.append({
            'source_position': [row['origin_lon'], row['origin_lat']],
            'target_position': [row['dest_lon'], row['dest_lat']],
            'source_color': color,
            'target_color': SWITZERLAND_COLOR,
            'width': 3,
            'airline': row.get('Airline', 'Unknown'),
            'last_stop': row.get('LastStop', 'Unknown'),
            'origin_city': row.get('origin_city', ''),
            'status': status,
            'inad_count': row.get('INAD', 0),
            'density': round(row.get('Density_permille', 0), 4),
        })
    
    # Add resolved routes (from previous semester)
    for _, row in previous_df.iterrows():
        if not row.get('has_coordinates', False):
            continue
        
        route_key = (row['Airline'], row['LastStop'])
        if route_key in resolved_routes:
            arc_data.append({
                'source_position': [row['origin_lon'], row['origin_lat']],
                'target_position': [row['dest_lon'], row['dest_lat']],
                'source_color': COMPARISON_COLORS['resolved'],
                'target_color': [16, 185, 129, 100],  # Faded green
                'width': 2,
                'airline': row.get('Airline', 'Unknown'),
                'last_stop': row.get('LastStop', 'Unknown'),
                'origin_city': row.get('origin_city', ''),
                'status': 'RESOLVED',
                'inad_count': row.get('INAD', 0),
                'density': round(row.get('Density_permille', 0), 4),
            })
    
    # Create layers
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
            width_scale=2,
            pickable=True,
            auto_highlight=True,
            get_tilt=15,
        )
        layers.append(arc_layer)
    
    # Switzerland marker
    dest_layer = pdk.Layer(
        'ScatterplotLayer',
        data=[{
            'position': [SWITZERLAND['lon'], SWITZERLAND['lat']],
            'color': SWITZERLAND_COLOR,
            'radius': 40000,
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
        latitude=40.0,
        longitude=15.0,
        zoom=2.0,
        pitch=40,
        bearing=0,
    )
    
    tooltip_html = '''
        <div style="background: rgba(30,41,59,0.95); padding: 12px; border-radius: 8px; font-family: sans-serif;">
            <div style="font-weight: 600; color: #f1f5f9; margin-bottom: 8px;">
                {airline} → {last_stop}
            </div>
            <div style="color: #94a3b8; margin-bottom: 4px;">{origin_city}</div>
            <div style="margin-top: 8px; padding: 4px 8px; border-radius: 4px; display: inline-block;
                        font-size: 12px; font-weight: 600;">
                {status}
            </div>
        </div>
    '''
    
    deck = pdk.Deck(
        layers=layers,
        initial_view_state=view_state,
        map_style='mapbox://styles/mapbox/dark-v10',
        tooltip={'html': tooltip_html},
        height=height,
    )
    
    # Comparison stats
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
    """
    Calculate summary statistics for globe view sidebar.
    """
    if df.empty:
        return {}
    
    stats = {
        'total_routes': len(df),
        'routes_with_coords': df['has_coordinates'].sum() if 'has_coordinates' in df.columns else 0,
        'total_inad': df['INAD'].sum() if 'INAD' in df.columns else 0,
        'total_pax': df['PAX'].sum() if 'PAX' in df.columns else 0,
        'unique_origins': df['LastStop'].nunique() if 'LastStop' in df.columns else 0,
        'unique_airlines': df['Airline'].nunique() if 'Airline' in df.columns else 0,
    }
    
    # Priority breakdown
    if 'Priority' in df.columns:
        priority_counts = df['Priority'].value_counts().to_dict()
        stats['priority_breakdown'] = priority_counts
    
    # Top origins by INAD
    if 'LastStop' in df.columns and 'INAD' in df.columns:
        top_origins = df.groupby('LastStop')['INAD'].sum().nlargest(5).to_dict()
        stats['top_origins'] = top_origins
    
    # Top countries
    if 'origin_country' in df.columns:
        country_counts = df.groupby('origin_country')['INAD'].sum().nlargest(10).to_dict()
        stats['top_countries'] = country_counts
    
    return stats


if __name__ == "__main__":
    # Test with sample data
    test_data = pd.DataFrame([
        {'Airline': 'TK', 'LastStop': 'IST', 'INAD': 15, 'PAX': 50000, 'Priority': 'HIGH_PRIORITY',
         'Density_permille': 0.30, 'Confidence': 75, 'origin_lat': 41.28, 'origin_lon': 28.75,
         'dest_lat': 46.82, 'dest_lon': 8.23, 'origin_city': 'Istanbul', 'origin_country': 'TR',
         'has_coordinates': True, 'distance_km': 1740},
        {'Airline': 'EK', 'LastStop': 'DXB', 'INAD': 8, 'PAX': 80000, 'Priority': 'WATCH_LIST',
         'Density_permille': 0.10, 'Confidence': 85, 'origin_lat': 25.25, 'origin_lon': 55.37,
         'dest_lat': 46.82, 'dest_lon': 8.23, 'origin_city': 'Dubai', 'origin_country': 'AE',
         'has_coordinates': True, 'distance_km': 4800},
    ])
    
    deck = create_globe_view(test_data)
    print("Globe view created successfully")
    print(f"Layers: {len(deck.layers)}")
    
    stats = get_route_statistics(test_data)
    print(f"Stats: {stats}")
