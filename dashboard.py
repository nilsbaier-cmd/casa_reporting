#!/usr/bin/env python3
"""
CASA Reporting Dashboard - Enhanced Version with Globe View

Interactive Streamlit dashboard for analyzing INAD (inadmissible passenger) data.
Features:
- Interactive 3D globe visualization of routes to Switzerland
- Animated route flows with pulsing dots
- Historical comparison view between semesters
- Priority classification and systemic case detection
- Multi-language support (EN, DE, FR)
- Modern Orion-inspired design

Run with: streamlit run app.py
"""

import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from pathlib import Path
import sys

# Add current directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

# Import analysis modules
try:
    import inad_analysis as ia
    ANALYSIS_AVAILABLE = True
except ImportError:
    ANALYSIS_AVAILABLE = False
    print("Warning: inad_analysis module not found")

# Import translations
try:
    from translations import t, TRANSLATIONS
except ImportError:
    # Fallback translation function
    def t(key, lang='en'):
        return key
    TRANSLATIONS = {'en': {}, 'de': {}, 'fr': {}}

# Import geography module
try:
    from geography import enrich_routes_with_coordinates, get_coverage_stats, SWITZERLAND
    GEOGRAPHY_AVAILABLE = True
except ImportError:
    GEOGRAPHY_AVAILABLE = False
    print("Warning: geography module not found")

# Import components
try:
    from components.globe import create_globe_view, create_comparison_view, get_route_statistics
    from components.stat_cards import (
        render_stat_card,
        render_priority_summary_cards,
        render_route_detail_card,
        render_globe_legend,
        render_comparison_legend,
        render_comparison_stats
    )
    COMPONENTS_AVAILABLE = True
except ImportError as e:
    COMPONENTS_AVAILABLE = False
    print(f"Warning: components not available: {e}")

# Check for pydeck
try:
    import pydeck
    PYDECK_AVAILABLE = True
except ImportError:
    PYDECK_AVAILABLE = False

# Page configuration
st.set_page_config(
    page_title="CASA Reporting Dashboard",
    page_icon="✈️",
    layout="wide",
    initial_sidebar_state="expanded"
)


def load_custom_css():
    """Load custom CSS styling."""
    css_path = Path(__file__).parent / "styles" / "main.css"
    
    if css_path.exists():
        with open(css_path) as f:
            st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)
    else:
        # Inline fallback CSS
        st.markdown("""
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            
            .stApp { font-family: 'Inter', sans-serif; }
            
            .main-header {
                font-size: 2.25rem;
                font-weight: 700;
                color: #1E293B;
                margin-bottom: 0.5rem;
            }
            .sub-header {
                font-size: 1rem;
                color: #64748B;
                margin-bottom: 2rem;
            }
            .section-header {
                font-size: 1.25rem;
                font-weight: 600;
                color: #1E293B;
                margin-bottom: 1rem;
                padding-bottom: 0.5rem;
                border-bottom: 2px solid #6366F1;
            }
            
            [data-testid="stSidebar"] {
                background: #1E293B;
            }
            [data-testid="stSidebar"] .stMarkdown,
            [data-testid="stSidebar"] label {
                color: #F8FAFC !important;
            }
            
            .stTabs [data-baseweb="tab-list"] {
                gap: 0.5rem;
                background: #F1F5F9;
                padding: 0.5rem;
                border-radius: 12px;
            }
            .stTabs [data-baseweb="tab"] {
                background: transparent !important;
                border-radius: 8px !important;
                padding: 0.75rem 1.25rem !important;
            }
            .stTabs [aria-selected="true"] {
                background: white !important;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
            }
        </style>
        """, unsafe_allow_html=True)


def get_priority_labels(lang):
    """Get translated priority labels."""
    labels = {
        'en': {
            'HIGH_PRIORITY': '🔴 HIGH PRIORITY',
            'WATCH_LIST': '🟠 WATCH LIST',
            'CLEAR': '🟢 CLEAR',
            'UNRELIABLE': '⚪ UNRELIABLE',
            'NO_DATA': '❓ NO DATA'
        },
        'de': {
            'HIGH_PRIORITY': '🔴 HOHE PRIORITÄT',
            'WATCH_LIST': '🟠 BEOBACHTUNGSLISTE',
            'CLEAR': '🟢 UNBEDENKLICH',
            'UNRELIABLE': '⚪ UNZUVERLÄSSIG',
            'NO_DATA': '❓ KEINE DATEN'
        },
        'fr': {
            'HIGH_PRIORITY': '🔴 HAUTE PRIORITÉ',
            'WATCH_LIST': '🟠 SURVEILLANCE',
            'CLEAR': '🟢 SANS PROBLÈME',
            'UNRELIABLE': '⚪ NON FIABLE',
            'NO_DATA': '❓ PAS DE DONNÉES'
        }
    }
    return labels.get(lang, labels['en'])


def style_priority_table(df):
    """Apply styling to priority table."""
    def highlight_priority(row):
        priority = row.get('Priority', row.get('Status', ''))
        priority_str = str(priority).upper()
        
        if 'HIGH' in priority_str:
            return ['background-color: rgba(239, 68, 68, 0.1); color: #1E293B'] * len(row)
        elif 'WATCH' in priority_str or 'BEOBACHTUNG' in priority_str or 'SURVEILLANCE' in priority_str:
            return ['background-color: rgba(245, 158, 11, 0.1); color: #1E293B'] * len(row)
        elif 'UNRELIABLE' in priority_str or 'UNZUVERLÄSSIG' in priority_str or 'FIABLE' in priority_str:
            return ['background-color: rgba(148, 163, 184, 0.1); color: #1E293B'] * len(row)
        elif 'CLEAR' in priority_str or 'OK' in priority_str or 'UNBEDENKLICH' in priority_str:
            return ['background-color: rgba(16, 185, 129, 0.1); color: #1E293B'] * len(row)
        return ['color: #1E293B'] * len(row)
    
    return df.style.apply(highlight_priority, axis=1)


def render_globe_tab(step3_df, lang, semesters=None, inad_path=None, bazl_path=None, config_tuple=None):
    """Render the globe visualization tab with filters and details."""
    
    st.markdown(f'<p class="section-header">🌍 {t("globe_title", lang)}</p>', unsafe_allow_html=True)
    
    if not GEOGRAPHY_AVAILABLE or not PYDECK_AVAILABLE:
        st.warning(t('globe_not_available', lang))
        st.info("Install required packages: `pip install pydeck airportsdata`")
        return
    
    # Enrich data with coordinates
    with st.spinner(t('loading_geo_data', lang)):
        geo_df = enrich_routes_with_coordinates(step3_df, 'LastStop')
    
    coverage = get_coverage_stats(geo_df)
    
    # Globe controls
    with st.expander(f"🎛️ {t('globe_controls', lang)}", expanded=True):
        col1, col2, col3 = st.columns(3)
        
        with col1:
            show_priorities = st.multiselect(
                t('show_priorities', lang),
                options=['HIGH_PRIORITY', 'WATCH_LIST', 'CLEAR', 'UNRELIABLE'],
                default=['HIGH_PRIORITY', 'WATCH_LIST', 'CLEAR'],
                format_func=lambda x: get_priority_labels(lang).get(x, x)
            )
        
        with col2:
            min_inad_display = st.slider(
                t('min_inad_display', lang),
                min_value=1,
                max_value=20,
                value=1
            )
        
        with col3:
            show_animation = st.checkbox("Show animated dots", value=True)
    
    # Filter data
    display_df = geo_df[
        (geo_df['Priority'].isin(show_priorities)) &
        (geo_df['INAD'] >= min_inad_display) &
        (geo_df['has_coordinates'] == True)
    ]
    
    # Stats row
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric(t('routes_displayed', lang), len(display_df))
    with col2:
        st.metric(t('unique_origins', lang), display_df['LastStop'].nunique() if len(display_df) > 0 else 0)
    with col3:
        st.metric(t('total_inad', lang), display_df['INAD'].sum() if len(display_df) > 0 else 0)
    with col4:
        st.metric(t('coverage', lang), f"{coverage['coverage_rate']:.0f}%")
    
    # Globe visualization
    if len(display_df) > 0 and COMPONENTS_AVAILABLE:
        try:
            deck = create_globe_view(display_df, height=550, show_animation=show_animation)
            st.pydeck_chart(deck)
            render_globe_legend(lang)
        except Exception as e:
            st.error(f"Error rendering globe: {e}")
            st.dataframe(display_df[['Airline', 'LastStop', 'INAD', 'PAX', 'Priority']])
    else:
        st.info(t('no_routes_match', lang))
    
    # Route details section
    st.markdown("---")
    st.markdown(f"### 📋 {t('route_details', lang)}")
    
    if len(display_df) > 0:
        route_options = [
            f"{row['Airline']} → {row['LastStop']} ({row.get('origin_city', 'Unknown')})"
            for _, row in display_df.iterrows()
        ]
        
        selected_route = st.selectbox(t('select_route', lang), options=route_options)
        
        if selected_route:
            idx = route_options.index(selected_route)
            route_data = display_df.iloc[idx]
            
            render_route_detail_card(
                airline=route_data['Airline'],
                last_stop=route_data['LastStop'],
                origin_city=route_data.get('origin_city', 'Unknown'),
                inad=int(route_data['INAD']),
                pax=int(route_data['PAX']),
                density=route_data.get('Density_permille', 0),
                confidence=int(route_data.get('Confidence', 0)),
                priority=route_data['Priority'],
                distance_km=route_data.get('distance_km')
            )
    
    # Missing airports
    if coverage['missing_airports']:
        with st.expander(f"⚠️ {len(coverage['missing_airports'])} {t('airports_without_coords', lang)}"):
            st.write(", ".join(coverage['missing_airports'][:30]))
            if len(coverage['missing_airports']) > 30:
                st.write(f"... and {len(coverage['missing_airports']) - 30} more")


def render_historical_tab(step3_df, semesters, inad_path, bazl_path, config_tuple, current_semester, lang):
    """Render the historical comparison tab."""
    
    st.markdown(f'<p class="section-header">📊 {t("historical_comparison", lang)}</p>', unsafe_allow_html=True)
    
    if not GEOGRAPHY_AVAILABLE or not PYDECK_AVAILABLE or not COMPONENTS_AVAILABLE:
        st.warning("Historical comparison requires all components to be available.")
        return
    
    # Find other semesters for comparison
    other_semesters = [s for s in semesters if f"{s[0]} H{s[1]}" != current_semester]
    
    if not other_semesters:
        st.info("No other semesters available for comparison.")
        return
    
    # Semester selector
    col1, col2 = st.columns([1, 2])
    
    with col1:
        def format_sem(s):
            return f"{s[0]} H{s[1]} ({'Jan-Jun' if s[1] == 1 else 'Jul-Dec'})"
        
        compare_semester = st.selectbox(
            t('select_comparison_semester', lang),
            options=other_semesters,
            format_func=format_sem
        )
    
    if compare_semester:
        # Load comparison data
        config = dict(config_tuple)
        
        with st.spinner(t('analyzing_historical', lang)):
            try:
                compare_results = ia.run_full_analysis(
                    inad_path, bazl_path, 
                    compare_semester[2], compare_semester[3],
                    min_inad=config.get('min_inad', 6), 
                    config=config
                )
                compare_step3 = compare_results['step3']
                
                # Enrich both datasets
                current_geo = enrich_routes_with_coordinates(step3_df, 'LastStop')
                previous_geo = enrich_routes_with_coordinates(compare_step3, 'LastStop')
                
                # Create comparison view
                deck, stats = create_comparison_view(current_geo, previous_geo, height=500)
                
                # Show stats
                with col2:
                    render_comparison_stats(stats, lang)
                
                # Display comparison globe
                st.pydeck_chart(deck)
                render_comparison_legend(lang)
                
                # Details tables
                st.markdown("---")
                
                col1, col2 = st.columns(2)
                
                with col1:
                    st.markdown(f"### 🆕 {t('new_routes', lang)}")
                    if stats['new_routes']:
                        new_df = current_geo[
                            current_geo.apply(
                                lambda r: (r['Airline'], r['LastStop']) in stats['new_routes'], 
                                axis=1
                            )
                        ][['Airline', 'LastStop', 'INAD', 'Density_permille', 'Priority']]
                        st.dataframe(new_df, use_container_width=True)
                    else:
                        st.success("No new flagged routes!")
                
                with col2:
                    st.markdown(f"### ✅ {t('resolved_routes', lang)}")
                    if stats['resolved_routes']:
                        resolved_df = previous_geo[
                            previous_geo.apply(
                                lambda r: (r['Airline'], r['LastStop']) in stats['resolved_routes'],
                                axis=1
                            )
                        ][['Airline', 'LastStop', 'INAD', 'Density_permille', 'Priority']]
                        st.dataframe(resolved_df, use_container_width=True)
                    else:
                        st.info("No resolved routes (all previously flagged routes remain flagged).")
                
            except Exception as e:
                st.error(f"Error loading comparison data: {e}")


def main():
    """Main application entry point."""
    
    load_custom_css()
    
    # Initialize language
    if 'lang' not in st.session_state:
        st.session_state.lang = 'en'
    
    # Language selector
    st.sidebar.markdown("### 🌐 Language")
    lang_options = {'en': '🇬🇧 English', 'de': '🇩🇪 Deutsch', 'fr': '🇫🇷 Français'}
    selected_lang = st.sidebar.selectbox(
        "Language",
        options=list(lang_options.keys()),
        format_func=lambda x: lang_options[x],
        index=list(lang_options.keys()).index(st.session_state.lang),
        label_visibility="collapsed"
    )
    
    if selected_lang != st.session_state.lang:
        st.session_state.lang = selected_lang
        st.rerun()
    
    lang = st.session_state.lang
    
    # Header
    st.markdown(f'<p class="main-header">✈️ {t("main_header", lang)}</p>', unsafe_allow_html=True)
    st.markdown(f'<p class="sub-header">{t("sub_header", lang)}</p>', unsafe_allow_html=True)
    
    # Check if analysis module is available
    if not ANALYSIS_AVAILABLE:
        st.error("Analysis module not available. Please ensure inad_analysis.py is in the same directory.")
        return
    
    # Sidebar configuration
    st.sidebar.markdown("---")
    st.sidebar.header(f"📁 {t('data_configuration', lang)}")
    
    # File upload
    upload_mode = st.sidebar.radio(
        t('data_source', lang),
        [t('upload_files', lang), t('use_server_files', lang)]
    )
    
    base_path = Path(__file__).parent
    default_inad = base_path / "INAD Tabelle .xlsm"
    default_bazl = base_path / "BAZL-Daten.xlsx"
    
    if upload_mode == t('upload_files', lang):
        inad_file = st.sidebar.file_uploader(t('inad_file', lang), type=['xlsm'])
        bazl_file = st.sidebar.file_uploader(t('bazl_file', lang), type=['xlsx'])
        
        if not inad_file or not bazl_file:
            st.warning(f"⚠️ {t('upload_warning', lang)}")
            st.stop()
        
        import tempfile
        temp_dir = Path(tempfile.gettempdir()) / "inad_analysis"
        temp_dir.mkdir(exist_ok=True)
        
        inad_path = str(temp_dir / inad_file.name)
        bazl_path = str(temp_dir / bazl_file.name)
        
        with open(inad_path, 'wb') as f:
            f.write(inad_file.getbuffer())
        with open(bazl_path, 'wb') as f:
            f.write(bazl_file.getbuffer())
        
        st.sidebar.success(f"✅ {t('files_uploaded', lang)}")
    else:
        inad_path = st.sidebar.text_input(
            t('inad_file_path', lang),
            value=str(default_inad) if default_inad.exists() else ""
        )
        bazl_path = st.sidebar.text_input(
            t('bazl_file_path', lang),
            value=str(default_bazl) if default_bazl.exists() else ""
        )
        
        if not inad_path or not bazl_path:
            st.warning(f"⚠️ {t('enter_paths_warning', lang)}")
            st.stop()
        
        if not Path(inad_path).exists() or not Path(bazl_path).exists():
            st.error(f"❌ {t('files_not_found', lang)}")
            st.stop()
    
    # Load semesters
    try:
        with st.spinner(t('loading_semesters', lang)):
            semesters = ia.get_available_semesters(inad_path)
    except Exception as e:
        st.error(f"❌ {t('error_loading_inad', lang)} {e}")
        st.stop()
    
    if not semesters:
        st.warning(f"⚠️ {t('no_data_found', lang)}")
        st.stop()
    
    # Semester selection
    st.sidebar.header(f"📅 {t('time_period', lang)}")
    
    def format_semester(yr, sem):
        return f"{yr} H{sem} ({'Jan-Jun' if sem == 1 else 'Jul-Dec'})"
    
    semester_options = {format_semester(yr, sem): (yr, sem, start, end) for yr, sem, start, end in semesters}
    selected_semester = st.sidebar.selectbox(t('select_semester', lang), options=list(semester_options.keys()))
    year, sem, start_date, end_date = semester_options[selected_semester]
    
    # Analysis parameters
    st.sidebar.header(f"⚙️ {t('analysis_parameters', lang)}")
    
    min_inad = st.sidebar.slider(t('min_inad_threshold', lang), 1, 20, 6)
    min_pax = st.sidebar.slider(t('min_pax_reliable', lang), 1000, 20000, 5000, step=1000)
    threshold_method = st.sidebar.selectbox(t('threshold_method', lang), ['median', 'trimmed_mean', 'mean'])
    min_density = st.sidebar.slider(t('min_density_high', lang), 0.05, 0.30, 0.10, step=0.01)
    high_multiplier = st.sidebar.slider(t('high_priority_multiplier', lang), 1.0, 3.0, 1.5, step=0.1)
    
    config = {
        'min_inad': min_inad,
        'min_pax': min_pax,
        'min_density': min_density,
        'high_priority_multiplier': high_multiplier,
        'high_priority_min_inad': 10,
        'threshold_method': threshold_method,
        'trimmed_percent': 0.1,
        'systemic_semesters': 2,
        'pax_completeness_months': 4
    }
    config_tuple = tuple(sorted(config.items()))
    
    # Run analysis
    @st.cache_data
    def load_analysis(inad_path, bazl_path, start, end, min_inad, config_tuple):
        config = dict(config_tuple)
        return ia.run_full_analysis(inad_path, bazl_path, start, end, min_inad=min_inad, config=config)
    
    try:
        with st.spinner(t('running_analysis', lang)):
            results = load_analysis(inad_path, bazl_path, start_date, end_date, min_inad, config_tuple)
    except Exception as e:
        st.error(f"❌ {t('analysis_error', lang)} {e}")
        st.stop()
    
    step3 = results['step3'].copy()
    threshold = results['threshold'] if results['threshold'] else 0
    
    # Filters
    st.sidebar.header(f"🔍 {t('filters', lang)}")
    all_airlines = sorted(results['inad_raw']['Airline'].unique())
    all_airports = sorted(results['inad_raw']['LastStop'].unique())
    
    selected_airlines = st.sidebar.multiselect(t('airlines', lang), options=all_airlines, default=[])
    selected_airports = st.sidebar.multiselect(t('airports_last_stop', lang), options=all_airports, default=[])
    
    if selected_airlines:
        step3 = step3[step3['Airline'].isin(selected_airlines)]
    if selected_airports:
        step3 = step3[step3['LastStop'].isin(selected_airports)]
    
    # Summary metrics
    st.markdown("---")
    
    total_inad = len(results['inad_raw'][results['inad_raw']['Included']])
    high_priority = len(step3[step3['Priority'] == 'HIGH_PRIORITY'])
    watch_list = len(step3[step3['Priority'] == 'WATCH_LIST'])
    unreliable = len(step3[step3['Priority'] == 'UNRELIABLE'])
    
    if COMPONENTS_AVAILABLE:
        render_priority_summary_cards(total_inad, high_priority, watch_list, unreliable, threshold, threshold_method, lang)
    else:
        col1, col2, col3, col4, col5, col6 = st.columns(6)
        col1.metric(t('total_inad', lang), f"{total_inad:,}")
        col2.metric(f"🔴 {t('high_priority', lang)}", high_priority)
        col3.metric(f"🟠 {t('watch_list', lang)}", watch_list)
        col4.metric(f"⚪ {t('unreliable', lang)}", unreliable)
        col5.metric(t('threshold', lang), f"{threshold:.4f}‰")
        col6.metric(t('method', lang), threshold_method.title())
    
    # Tabs
    tabs = st.tabs([
        f"🌍 {t('tab_globe', lang)}",
        f"📊 {t('tab_overview', lang)}",
        f"🛫 {t('tab_step1', lang)}",
        f"🛤️ {t('tab_step2', lang)}",
        f"📈 {t('tab_step3', lang)}",
        f"📅 {t('tab_history', lang)}",
        f"🔄 {t('tab_systemic', lang)}",
        f"📋 {t('tab_legal', lang)}"
    ])
    
    # Tab 0: Globe View
    with tabs[0]:
        render_globe_tab(step3, lang, semesters, inad_path, bazl_path, config_tuple)
    
    # Tab 1: Overview
    with tabs[1]:
        st.markdown(f'<p class="section-header">{t("analysis_overview", lang)}</p>', unsafe_allow_html=True)
        
        col1, col2 = st.columns(2)
        
        with col1:
            priority_labels = get_priority_labels(lang)
            priority_counts = step3['Priority'].value_counts()
            
            fig = px.pie(
                values=priority_counts.values,
                names=[priority_labels.get(p, p) for p in priority_counts.index],
                title=t('priority_distribution', lang),
                color_discrete_sequence=['#EF4444', '#F59E0B', '#10B981', '#94A3B8', '#64748B']
            )
            fig.update_layout(paper_bgcolor='rgba(0,0,0,0)', font=dict(family="Inter"))
            st.plotly_chart(fig, use_container_width=True)
        
        with col2:
            if 'Confidence' in step3.columns:
                fig = px.histogram(
                    step3[step3['Confidence'] > 0], x='Confidence', nbins=20,
                    title=t('confidence_distribution', lang),
                    color_discrete_sequence=['#6366F1']
                )
                fig.add_vline(x=50, line_dash="dash", line_color="#F59E0B")
                fig.update_layout(paper_bgcolor='rgba(0,0,0,0)', font=dict(family="Inter"))
                st.plotly_chart(fig, use_container_width=True)
        
        # Top routes chart
        reliable = step3[step3['Reliable'] == True].head(10)
        if len(reliable) > 0:
            reliable_display = reliable.copy()
            reliable_display['Route'] = reliable_display['Airline'] + ' → ' + reliable_display['LastStop']
            fig = px.bar(
                reliable_display, x='Route', y='Density_permille', color='Priority',
                title=t('top_routes_density', lang),
                color_discrete_map={'HIGH_PRIORITY': '#EF4444', 'WATCH_LIST': '#F59E0B', 'CLEAR': '#10B981'}
            )
            fig.add_hline(y=threshold, line_dash="dash", line_color="#6366F1",
                         annotation_text=f"{t('threshold', lang)}: {threshold:.4f}‰")
            fig.update_layout(xaxis_tickangle=-45, paper_bgcolor='rgba(0,0,0,0)')
            st.plotly_chart(fig, use_container_width=True)
    
    # Tab 2: Step 1
    with tabs[2]:
        st.markdown(f'<p class="section-header">{t("step1_header", lang).format(min_inad)}</p>', unsafe_allow_html=True)
        step1 = results['step1']
        st.dataframe(step1, use_container_width=True, height=400)
    
    # Tab 3: Step 2
    with tabs[3]:
        st.markdown(f'<p class="section-header">{t("step2_header", lang).format(min_inad)}</p>', unsafe_allow_html=True)
        step2 = results['step2']
        st.dataframe(step2, use_container_width=True, height=400)
    
    # Tab 4: Step 3
    with tabs[4]:
        st.markdown(f'<p class="section-header">{t("step3_header", lang)}</p>', unsafe_allow_html=True)
        
        display_df = step3.copy()
        display_df['Priority_Display'] = display_df['Priority'].map(get_priority_labels(lang))
        display_df['Density_Display'] = display_df['Density_permille'].apply(lambda x: f"{x:.4f}‰" if pd.notna(x) else "N/A")
        
        show_cols = ['Airline', 'LastStop', 'INAD', 'PAX', 'Density_Display', 'Confidence', 'Priority_Display']
        display_df = display_df[[c for c in show_cols if c in display_df.columns]]
        
        st.dataframe(style_priority_table(display_df), use_container_width=True, height=500)
    
    # Tab 5: Historical Comparison
    with tabs[5]:
        render_historical_tab(step3, semesters, inad_path, bazl_path, config_tuple, selected_semester, lang)
    
    # Tab 6: Systemic
    with tabs[6]:
        st.markdown(f'<p class="section-header">{t("systemic_header", lang)}</p>', unsafe_allow_html=True)
        st.info(t('systemic_info', lang))
        
        @st.cache_data
        def load_multi_semester(inad_path, bazl_path, semesters_tuple, config_tuple):
            config = dict(config_tuple)
            semesters = [tuple(s) for s in semesters_tuple]
            return ia.run_multi_semester_analysis(inad_path, bazl_path, semesters, config)
        
        try:
            with st.spinner(t('analyzing_historical', lang)):
                multi_results = load_multi_semester(
                    inad_path, bazl_path,
                    tuple(tuple(s) for s in semesters),
                    config_tuple
                )
                systemic = multi_results['systemic_cases']
            
            if len(systemic) == 0:
                st.info(t('no_systemic_routes', lang))
            else:
                truly_systemic = systemic[systemic['IsSystemic'] == True]
                
                col1, col2, col3 = st.columns(3)
                col1.metric(f"🔴 {t('systemic_cases', lang)}", len(truly_systemic))
                col2.metric(t('routes_flagged_multiple', lang), len(systemic))
                col3.metric(t('worsening_trends', lang), len(systemic[systemic['Trend'] == 'WORSENING']))
                
                if len(truly_systemic) > 0:
                    st.markdown(f"### 🔴 {t('confirmed_systemic', lang)}")
                    st.dataframe(truly_systemic[['Airline', 'LastStop', 'TotalAppearances', 'MaxConsecutive', 'Trend', 'LatestPriority']])
        except Exception as e:
            st.error(f"{t('systemic_analysis_error', lang)} {e}")
    
    # Tab 7: Legal
    with tabs[7]:
        st.markdown(f'<p class="section-header">{t("legal_header", lang)}</p>', unsafe_allow_html=True)
        
        st.markdown(f"""
        ### {t('analysis_params', lang)}
        - **{t('period', lang)}** {selected_semester}
        - **{t('threshold_method_label', lang)}** {threshold_method.title()}
        - **{t('threshold_value', lang)}** {threshold:.4f}‰
        - **{t('minimum_inad', lang)}** {min_inad}
        - **{t('minimum_pax', lang)}** {min_pax:,}
        """)
        
        col1, col2, col3 = st.columns(3)
        
        with col1:
            high_df = step3[step3['Priority'] == 'HIGH_PRIORITY']
            if len(high_df) > 0:
                csv = high_df.to_csv(index=False).encode('utf-8')
                st.download_button(f"📥 {t('export_high_priority', lang)}", data=csv,
                                 file_name=f"HIGH_PRIORITY_{year}_H{sem}.csv", mime="text/csv")
        
        with col2:
            watch_df = step3[step3['Priority'] == 'WATCH_LIST']
            if len(watch_df) > 0:
                csv = watch_df.to_csv(index=False).encode('utf-8')
                st.download_button(f"📥 {t('export_watch_list', lang)}", data=csv,
                                 file_name=f"WATCH_LIST_{year}_H{sem}.csv", mime="text/csv")
        
        with col3:
            csv = step3.to_csv(index=False).encode('utf-8')
            st.download_button(f"📥 {t('export_full', lang)}", data=csv,
                             file_name=f"INAD_Analysis_{year}_H{sem}.csv", mime="text/csv")
    
    # Footer
    st.markdown("---")
    st.caption(f"{t('analysis_label', lang)} {selected_semester} | {t('threshold_label', lang)} {threshold:.4f}‰ | "
               f"{t('generated', lang)} {pd.Timestamp.now().strftime('%Y-%m-%d %H:%M')}")


if __name__ == "__main__":
    main()
