#!/usr/bin/env python3
"""
stat_cards.py - Reusable Stat Card Components for CASA Dashboard

Provides modern, styled stat cards with icons, trends, and animations.
"""

import streamlit as st
from typing import Optional, Literal, List, Dict


def render_stat_card(
    title: str,
    value: str,
    icon: str = "📊",
    subtitle: Optional[str] = None,
    trend: Optional[str] = None,
    trend_direction: Literal["up", "down", "neutral"] = "neutral",
    color: Literal["primary", "danger", "warning", "success", "muted"] = "primary",
):
    """
    Render a styled stat card.
    
    Args:
        title: Card title/label
        value: Main value to display
        icon: Emoji or icon string
        subtitle: Optional subtitle text
        trend: Optional trend value (e.g., "+12%")
        trend_direction: Direction for trend coloring
        color: Color theme for the icon background
    """
    
    # Color mappings
    color_classes = {
        'primary': ('rgba(99, 102, 241, 0.1)', '#6366F1'),
        'danger': ('rgba(239, 68, 68, 0.1)', '#EF4444'),
        'warning': ('rgba(245, 158, 11, 0.1)', '#F59E0B'),
        'success': ('rgba(16, 185, 129, 0.1)', '#10B981'),
        'muted': ('rgba(148, 163, 184, 0.1)', '#94A3B8'),
    }
    
    trend_colors = {
        'up': '#10B981',
        'down': '#EF4444',
        'neutral': '#94A3B8',
    }
    
    bg_color, icon_color = color_classes.get(color, color_classes['primary'])
    trend_color = trend_colors.get(trend_direction, trend_colors['neutral'])
    
    # Build trend HTML if provided
    trend_html = ""
    if trend:
        trend_icon = "↑" if trend_direction == "up" else "↓" if trend_direction == "down" else "→"
        trend_html = f'''
            <div style="display: inline-flex; align-items: center; gap: 4px; 
                        padding: 2px 8px; border-radius: 12px; font-size: 0.75rem;
                        background: {trend_color}15; color: {trend_color}; font-weight: 500;">
                {trend_icon} {trend}
            </div>
        '''
    
    # Build subtitle HTML if provided
    subtitle_html = ""
    if subtitle:
        subtitle_html = f'''
            <div style="font-size: 0.75rem; color: #64748B; margin-top: 4px;">
                {subtitle}
            </div>
        '''
    
    card_html = f'''
        <div style="
            background: white;
            border: 1px solid #E2E8F0;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            transition: all 0.2s ease;
            height: 100%;
        ">
            <div style="display: flex; align-items: flex-start; justify-content: space-between;">
                <div>
                    <div style="font-size: 0.875rem; color: #64748B; font-weight: 500; 
                                text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
                        {title}
                    </div>
                    <div style="font-size: 1.75rem; font-weight: 700; color: #1E293B; line-height: 1.2;">
                        {value}
                    </div>
                    {subtitle_html}
                    <div style="margin-top: 8px;">
                        {trend_html}
                    </div>
                </div>
                <div style="
                    width: 48px; height: 48px; 
                    background: {bg_color}; 
                    border-radius: 10px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 1.5rem;
                ">
                    {icon}
                </div>
            </div>
        </div>
    '''
    
    st.markdown(card_html, unsafe_allow_html=True)


def render_priority_summary_cards(
    total_inad: int,
    high_priority: int,
    watch_list: int,
    unreliable: int,
    threshold: float,
    method: str,
    lang: str = 'en'
):
    """
    Render the row of priority summary cards.
    """
    labels = {
        'en': {
            'total': 'Total INAD',
            'high': 'High Priority',
            'watch': 'Watch List',
            'unreliable': 'Unreliable',
            'threshold': 'Threshold',
            'method': 'Method',
        },
        'de': {
            'total': 'Total INAD',
            'high': 'Hohe Priorität',
            'watch': 'Beobachtungsliste',
            'unreliable': 'Unzuverlässig',
            'threshold': 'Schwellenwert',
            'method': 'Methode',
        },
        'fr': {
            'total': 'Total INAD',
            'high': 'Haute Priorité',
            'watch': 'Surveillance',
            'unreliable': 'Non Fiable',
            'threshold': 'Seuil',
            'method': 'Méthode',
        }
    }
    
    l = labels.get(lang, labels['en'])
    
    col1, col2, col3, col4, col5, col6 = st.columns(6)
    
    with col1:
        render_stat_card(title=l['total'], value=f"{total_inad:,}", icon="✈️", color="primary")
    with col2:
        render_stat_card(title=l['high'], value=str(high_priority), icon="🔴", color="danger")
    with col3:
        render_stat_card(title=l['watch'], value=str(watch_list), icon="🟠", color="warning")
    with col4:
        render_stat_card(title=l['unreliable'], value=str(unreliable), icon="⚪", color="muted")
    with col5:
        render_stat_card(title=l['threshold'], value=f"{threshold:.4f}‰", icon="📏", color="primary")
    with col6:
        render_stat_card(title=l['method'], value=method.title(), icon="⚙️", color="primary")


def render_route_detail_card(
    airline: str,
    last_stop: str,
    origin_city: str,
    inad: int,
    pax: int,
    density: float,
    confidence: int,
    priority: str,
    distance_km: Optional[float] = None,
):
    """
    Render a detailed route information card.
    """
    priority_colors = {
        'HIGH_PRIORITY': ('#EF4444', 'rgba(239, 68, 68, 0.1)', '🔴 HIGH PRIORITY'),
        'WATCH_LIST': ('#F59E0B', 'rgba(245, 158, 11, 0.1)', '🟠 WATCH LIST'),
        'CLEAR': ('#10B981', 'rgba(16, 185, 129, 0.1)', '🟢 CLEAR'),
        'UNRELIABLE': ('#94A3B8', 'rgba(148, 163, 184, 0.1)', '⚪ UNRELIABLE'),
    }
    
    color, bg, label = priority_colors.get(priority, priority_colors['UNRELIABLE'])
    
    distance_html = ""
    if distance_km:
        distance_html = f'''
            <div style="text-align: center;">
                <div style="font-size: 1.25rem; font-weight: 700; color: #1E293B;">
                    {distance_km:,.0f} km
                </div>
                <div style="font-size: 0.75rem; color: #64748B; text-transform: uppercase;">
                    Distance
                </div>
            </div>
        '''
    
    card_html = f'''
        <div style="
            background: white;
            border: 1px solid #E2E8F0;
            border-radius: 16px;
            padding: 24px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            margin-top: 16px;
        ">
            <!-- Header -->
            <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px; 
                        padding-bottom: 16px; border-bottom: 1px solid #E2E8F0;">
                <div style="font-size: 1.5rem; font-weight: 700; color: #1E293B;">
                    {airline}
                </div>
                <div style="font-size: 1.25rem; color: #6366F1;">→</div>
                <div>
                    <div style="font-size: 1.25rem; font-weight: 600; color: #1E293B;">
                        {last_stop}
                    </div>
                    <div style="font-size: 0.875rem; color: #64748B;">
                        {origin_city}
                    </div>
                </div>
                <div style="margin-left: auto;">
                    <span style="
                        padding: 6px 12px; 
                        border-radius: 20px; 
                        font-size: 0.75rem; 
                        font-weight: 600;
                        background: {bg}; 
                        color: {color};
                        text-transform: uppercase;
                    ">
                        {label}
                    </span>
                </div>
            </div>
            
            <!-- Metrics Grid -->
            <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; text-align: center;">
                <div>
                    <div style="font-size: 1.5rem; font-weight: 700; color: #1E293B;">{inad}</div>
                    <div style="font-size: 0.75rem; color: #64748B; text-transform: uppercase;">INAD</div>
                </div>
                <div>
                    <div style="font-size: 1.5rem; font-weight: 700; color: #1E293B;">{pax:,}</div>
                    <div style="font-size: 0.75rem; color: #64748B; text-transform: uppercase;">PAX</div>
                </div>
                <div>
                    <div style="font-size: 1.5rem; font-weight: 700; color: #1E293B;">{density:.4f}‰</div>
                    <div style="font-size: 0.75rem; color: #64748B; text-transform: uppercase;">Density</div>
                </div>
                <div>
                    <div style="font-size: 1.5rem; font-weight: 700; color: #1E293B;">{confidence}%</div>
                    <div style="font-size: 0.75rem; color: #64748B; text-transform: uppercase;">Confidence</div>
                </div>
                {distance_html}
            </div>
        </div>
    '''
    
    st.markdown(card_html, unsafe_allow_html=True)


def render_globe_legend(lang: str = 'en'):
    """Render the legend for the globe view."""
    
    labels = {
        'en': {
            'high': 'High Priority',
            'watch': 'Watch List',
            'clear': 'Clear',
            'dest': 'Switzerland',
            'arc': 'Route Arc',
        },
        'de': {
            'high': 'Hohe Priorität',
            'watch': 'Beobachtungsliste',
            'clear': 'Unbedenklich',
            'dest': 'Schweiz',
            'arc': 'Routenbogen',
        },
        'fr': {
            'high': 'Haute Priorité',
            'watch': 'Surveillance',
            'clear': 'Sans Problème',
            'dest': 'Suisse',
            'arc': 'Arc de Route',
        }
    }
    
    l = labels.get(lang, labels['en'])
    
    legend_html = f'''
        <div style="
            display: flex; 
            gap: 24px; 
            flex-wrap: wrap; 
            padding: 16px 20px;
            background: white;
            border-radius: 12px;
            border: 1px solid #E2E8F0;
            margin-top: 16px;
        ">
            <div style="display: flex; align-items: center; gap: 8px; font-size: 0.875rem; color: #64748B;">
                <div style="width: 12px; height: 12px; border-radius: 50%; background: #EF4444;"></div>
                {l['high']}
            </div>
            <div style="display: flex; align-items: center; gap: 8px; font-size: 0.875rem; color: #64748B;">
                <div style="width: 12px; height: 12px; border-radius: 50%; background: #F59E0B;"></div>
                {l['watch']}
            </div>
            <div style="display: flex; align-items: center; gap: 8px; font-size: 0.875rem; color: #64748B;">
                <div style="width: 12px; height: 12px; border-radius: 50%; background: #10B981;"></div>
                {l['clear']}
            </div>
            <div style="display: flex; align-items: center; gap: 8px; font-size: 0.875rem; color: #64748B;">
                <div style="width: 12px; height: 12px; border-radius: 50%; background: #6366F1;"></div>
                🇨🇭 {l['dest']}
            </div>
            <div style="display: flex; align-items: center; gap: 8px; font-size: 0.875rem; color: #64748B;">
                <div style="width: 24px; height: 3px; background: linear-gradient(90deg, #EF4444, #6366F1);"></div>
                {l['arc']}
            </div>
        </div>
    '''
    
    st.markdown(legend_html, unsafe_allow_html=True)


def render_comparison_legend(lang: str = 'en'):
    """Render the legend for the historical comparison view."""
    
    labels = {
        'en': {
            'new': 'New (flagged this semester)',
            'resolved': 'Resolved (no longer flagged)',
            'worsening': 'Worsening (>10% increase)',
            'improving': 'Improving (>10% decrease)',
            'persistent': 'Persistent (still flagged)',
        },
        'de': {
            'new': 'Neu (dieses Semester markiert)',
            'resolved': 'Gelöst (nicht mehr markiert)',
            'worsening': 'Verschlechternd (>10% Zunahme)',
            'improving': 'Verbessernd (>10% Abnahme)',
            'persistent': 'Persistent (weiterhin markiert)',
        },
        'fr': {
            'new': 'Nouveau (signalé ce semestre)',
            'resolved': 'Résolu (plus signalé)',
            'worsening': 'En dégradation (>10% augmentation)',
            'improving': 'En amélioration (>10% diminution)',
            'persistent': 'Persistant (toujours signalé)',
        }
    }
    
    l = labels.get(lang, labels['en'])
    
    legend_html = f'''
        <div style="
            display: flex; 
            gap: 20px; 
            flex-wrap: wrap; 
            padding: 16px 20px;
            background: white;
            border-radius: 12px;
            border: 1px solid #E2E8F0;
            margin-top: 16px;
        ">
            <div style="display: flex; align-items: center; gap: 8px; font-size: 0.813rem; color: #64748B;">
                <div style="width: 12px; height: 12px; border-radius: 50%; background: #EF4444;"></div>
                {l['new']}
            </div>
            <div style="display: flex; align-items: center; gap: 8px; font-size: 0.813rem; color: #64748B;">
                <div style="width: 12px; height: 12px; border-radius: 50%; background: #10B981;"></div>
                {l['resolved']}
            </div>
            <div style="display: flex; align-items: center; gap: 8px; font-size: 0.813rem; color: #64748B;">
                <div style="width: 12px; height: 12px; border-radius: 50%; background: #DC267F;"></div>
                {l['worsening']}
            </div>
            <div style="display: flex; align-items: center; gap: 8px; font-size: 0.813rem; color: #64748B;">
                <div style="width: 12px; height: 12px; border-radius: 50%; background: #3B82F6;"></div>
                {l['improving']}
            </div>
            <div style="display: flex; align-items: center; gap: 8px; font-size: 0.813rem; color: #64748B;">
                <div style="width: 12px; height: 12px; border-radius: 50%; background: #F59E0B;"></div>
                {l['persistent']}
            </div>
        </div>
    '''
    
    st.markdown(legend_html, unsafe_allow_html=True)


def render_comparison_stats(stats: Dict, lang: str = 'en'):
    """Render comparison statistics cards."""
    
    labels = {
        'en': {
            'new': 'New Flagged',
            'resolved': 'Resolved',
            'persistent': 'Persistent',
        },
        'de': {
            'new': 'Neu Markiert',
            'resolved': 'Gelöst',
            'persistent': 'Persistent',
        },
        'fr': {
            'new': 'Nouveaux Signalés',
            'resolved': 'Résolus',
            'persistent': 'Persistants',
        }
    }
    
    l = labels.get(lang, labels['en'])
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        render_stat_card(
            title=l['new'],
            value=str(stats.get('new_count', 0)),
            icon="🆕",
            color="danger"
        )
    
    with col2:
        render_stat_card(
            title=l['resolved'],
            value=str(stats.get('resolved_count', 0)),
            icon="✅",
            color="success"
        )
    
    with col3:
        render_stat_card(
            title=l['persistent'],
            value=str(stats.get('persistent_count', 0)),
            icon="⚠️",
            color="warning"
        )
