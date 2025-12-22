#!/usr/bin/env python3
"""
stat_cards.py - Reusable Stat Card Components for CASA Dashboard

Uses native Streamlit components for better compatibility.
"""

import streamlit as st
from typing import Optional, Literal, Dict


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
    Render the row of priority summary cards using native Streamlit metrics.
    """
    labels = {
        'en': {
            'total': 'Total INAD',
            'high': '🔴 High Priority',
            'watch': '🟠 Watch List',
            'unreliable': '⚪ Unreliable',
            'threshold': '📏 Threshold',
            'method': '⚙️ Method',
        },
        'de': {
            'total': 'Total INAD',
            'high': '🔴 Hohe Priorität',
            'watch': '🟠 Beobachtungsliste',
            'unreliable': '⚪ Unzuverlässig',
            'threshold': '📏 Schwellenwert',
            'method': '⚙️ Methode',
        },
        'fr': {
            'total': 'Total INAD',
            'high': '🔴 Haute Priorité',
            'watch': '🟠 Surveillance',
            'unreliable': '⚪ Non Fiable',
            'threshold': '📏 Seuil',
            'method': '⚙️ Méthode',
        }
    }
    
    l = labels.get(lang, labels['en'])
    
    col1, col2, col3, col4, col5, col6 = st.columns(6)
    
    with col1:
        st.metric(label=f"✈️ {l['total']}", value=f"{total_inad:,}")
    with col2:
        st.metric(label=l['high'], value=str(high_priority))
    with col3:
        st.metric(label=l['watch'], value=str(watch_list))
    with col4:
        st.metric(label=l['unreliable'], value=str(unreliable))
    with col5:
        st.metric(label=l['threshold'], value=f"{threshold:.4f}‰")
    with col6:
        st.metric(label=l['method'], value=method.title())


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
    Render a detailed route information card using native Streamlit.
    """
    # Priority styling
    priority_info = {
        'HIGH_PRIORITY': ('🔴', 'HIGH PRIORITY', '#EF4444'),
        'WATCH_LIST': ('🟠', 'WATCH LIST', '#F59E0B'),
        'CLEAR': ('🟢', 'CLEAR', '#10B981'),
        'UNRELIABLE': ('⚪', 'UNRELIABLE', '#94A3B8'),
    }
    
    icon, label, color = priority_info.get(priority, ('❓', priority, '#64748B'))
    
    # Header
    st.markdown(f"### {icon} {airline} → {last_stop}")
    st.caption(f"📍 {origin_city}")
    
    # Status badge
    st.markdown(f"**Status:** {icon} {label}")
    
    # Metrics row
    cols = st.columns(5 if distance_km else 4)
    
    with cols[0]:
        st.metric("INAD", inad)
    with cols[1]:
        st.metric("PAX", f"{pax:,}")
    with cols[2]:
        st.metric("Density", f"{density:.4f}‰")
    with cols[3]:
        st.metric("Confidence", f"{confidence}%")
    if distance_km:
        with cols[4]:
            st.metric("Distance", f"{distance_km:,.0f} km")


def render_globe_legend(lang: str = 'en'):
    """Render the legend for the globe view."""
    
    labels = {
        'en': {
            'high': 'High Priority',
            'watch': 'Watch List',
            'clear': 'Clear',
            'dest': 'Switzerland',
        },
        'de': {
            'high': 'Hohe Priorität',
            'watch': 'Beobachtungsliste',
            'clear': 'Unbedenklich',
            'dest': 'Schweiz',
        },
        'fr': {
            'high': 'Haute Priorité',
            'watch': 'Surveillance',
            'clear': 'Sans Problème',
            'dest': 'Suisse',
        }
    }
    
    l = labels.get(lang, labels['en'])
    
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.markdown(f"🔴 {l['high']}")
    with col2:
        st.markdown(f"🟠 {l['watch']}")
    with col3:
        st.markdown(f"🟢 {l['clear']}")
    with col4:
        st.markdown(f"🔵 🇨🇭 {l['dest']}")


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
    
    st.markdown(f"""
    🔴 {l['new']} · 🟢 {l['resolved']} · 🟣 {l['worsening']} · 🔵 {l['improving']} · 🟠 {l['persistent']}
    """)


def render_comparison_stats(stats: Dict, lang: str = 'en'):
    """Render comparison statistics cards."""
    
    labels = {
        'en': {
            'new': '🆕 New Flagged',
            'resolved': '✅ Resolved',
            'persistent': '⚠️ Persistent',
        },
        'de': {
            'new': '🆕 Neu Markiert',
            'resolved': '✅ Gelöst',
            'persistent': '⚠️ Persistent',
        },
        'fr': {
            'new': '🆕 Nouveaux',
            'resolved': '✅ Résolus',
            'persistent': '⚠️ Persistants',
        }
    }
    
    l = labels.get(lang, labels['en'])
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.metric(label=l['new'], value=stats.get('new_count', 0))
    with col2:
        st.metric(label=l['resolved'], value=stats.get('resolved_count', 0))
    with col3:
        st.metric(label=l['persistent'], value=stats.get('persistent_count', 0))
