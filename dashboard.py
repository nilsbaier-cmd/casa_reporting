#!/usr/bin/env python3
"""
INAD Analysis Dashboard - Enhanced Version

Interactive Streamlit dashboard for analyzing INAD (inadmissible passenger) data.
Includes priority classification, systemic case detection, and legal review support.
Supports English, German, and French languages.

Run with: streamlit run dashboard.py
"""

import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from pathlib import Path
import inad_analysis as ia
from translations import t, TRANSLATIONS

# Page configuration
st.set_page_config(
    page_title="INAD Analysis Dashboard",
    page_icon="✈️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
<style>
    .main-header {
        font-size: 2.5rem;
        font-weight: 700;
        color: #1E3A5F;
        margin-bottom: 0.5rem;
    }
    .sub-header {
        font-size: 1.1rem;
        color: #666;
        margin-bottom: 2rem;
    }
    .step-header {
        font-size: 1.5rem;
        font-weight: 600;
        color: #2C5282;
        border-bottom: 2px solid #3182CE;
        padding-bottom: 0.5rem;
        margin-bottom: 1rem;
    }
    .priority-high {
        background-color: #FED7D7;
        color: black;
        padding: 2px 8px;
        border-radius: 4px;
        font-weight: bold;
    }
    .priority-watch {
        background-color: #FEEBC8;
        color: black;
        padding: 2px 8px;
        border-radius: 4px;
    }
    .priority-clear {
        background-color: #C6F6D5;
        color: black;
        padding: 2px 8px;
        border-radius: 4px;
    }
    .data-warning {
        background-color: #FEF3C7;
        color: #92400E;
        padding: 8px;
        border-radius: 4px;
        margin: 4px 0;
    }
</style>
""", unsafe_allow_html=True)


@st.cache_data
def load_analysis(inad_path, bazl_path, start, end, min_inad, config_tuple):
    """Cache the analysis results for performance."""
    config = dict(config_tuple)
    return ia.run_full_analysis(inad_path, bazl_path, start, end, min_inad=min_inad, config=config)


@st.cache_data
def load_multi_semester_analysis(inad_path, bazl_path, semesters_tuple, config_tuple):
    """Cache multi-semester analysis for systemic detection."""
    config = dict(config_tuple)
    semesters = [tuple(s) for s in semesters_tuple]
    return ia.run_multi_semester_analysis(inad_path, bazl_path, semesters, config)


def format_semester(year, sem):
    """Format semester for display."""
    return f"{year} H{sem} ({'Jan-Jun' if sem == 1 else 'Jul-Dec'})"


def get_priority_color(priority):
    """Get color for priority level."""
    colors = {
        'HIGH_PRIORITY': '#E53E3E',
        'WATCH_LIST': '#DD6B20',
        'CLEAR': '#38A169',
        'UNRELIABLE': '#A0AEC0',
        'NO_DATA': '#718096'
    }
    return colors.get(priority, '#718096')


def get_priority_labels(lang):
    """Get translated priority labels."""
    return {
        'HIGH_PRIORITY': f"🔴 {t('high_priority', lang).upper()}",
        'WATCH_LIST': f"🟠 {t('watch_list', lang).upper()}",
        'CLEAR': f"🟢 {t('clear_desc', lang).split(' -')[0].upper()}",
        'UNRELIABLE': f"⚪ {t('unreliable', lang).upper()}",
        'NO_DATA': "❓ NO DATA"
    }


def style_priority_table(df):
    """Apply styling to priority table with black text."""
    def highlight_priority(row):
        priority = row.get('Priority', row.get('Status', ''))
        if 'HIGH' in str(priority).upper() or priority == 'HIGH_PRIORITY':
            return ['background-color: #FED7D7; color: black'] * len(row)
        elif 'WATCH' in str(priority).upper() or 'SURVEILLANCE' in str(priority).upper() or 'BEOBACHTUNG' in str(priority).upper() or priority == 'WATCH_LIST':
            return ['background-color: #FEEBC8; color: black'] * len(row)
        elif 'UNRELIABLE' in str(priority).upper() or 'UNZUVERLÄSSIG' in str(priority).upper() or 'FIABLE' in str(priority).upper() or priority == 'UNRELIABLE':
            return ['background-color: #E2E8F0; color: black'] * len(row)
        elif 'CLEAR' in str(priority).upper() or 'OK' in str(priority).upper() or 'UNBEDENKLICH' in str(priority).upper() or 'PROBLÈME' in str(priority).upper() or priority == 'CLEAR':
            return ['background-color: #C6F6D5; color: black'] * len(row)
        return ['color: black'] * len(row)
    return df.style.apply(highlight_priority, axis=1)


def main():
    # Initialize language in session state
    if 'lang' not in st.session_state:
        st.session_state.lang = 'en'

    # Language selector at top of sidebar
    st.sidebar.markdown("### 🌐 " + t('language', st.session_state.lang))
    lang_options = {
        'en': '🇬🇧 English',
        'de': '🇩🇪 Deutsch',
        'fr': '🇫🇷 Français'
    }
    selected_lang = st.sidebar.selectbox(
        t('language', st.session_state.lang),
        options=list(lang_options.keys()),
        format_func=lambda x: lang_options[x],
        index=list(lang_options.keys()).index(st.session_state.lang),
        label_visibility="collapsed"
    )

    # Update language if changed
    if selected_lang != st.session_state.lang:
        st.session_state.lang = selected_lang
        st.rerun()

    lang = st.session_state.lang

    # Documentation Links
    st.sidebar.markdown("---")
    st.sidebar.markdown(f"### 📚 {t('documentation', lang)}")

    # Determine which PDF to show based on language
    doc_files = {
        'en': 'INAD_Analysis_User_Documentation_v2.1.pdf',
        'de': 'INAD_Analysis_User_Documentation_v2.1_DE.pdf',
        'fr': 'INAD_Analysis_User_Documentation_v2.1_FR.pdf'
    }

    doc_file = doc_files.get(lang, doc_files['en'])
    doc_url = f"https://github.com/nilsbaier-cmd/casa_reporting/raw/main/{doc_file}"

    st.sidebar.markdown(
        f'<a href="{doc_url}" target="_blank" style="text-decoration: none;">'
        f'<div style="background-color: #3182CE; color: white; padding: 10px; '
        f'border-radius: 5px; text-align: center; margin: 5px 0;">'
        f'📄 {t("view_documentation", lang)}</div></a>',
        unsafe_allow_html=True
    )

    # Header
    st.markdown(f'<p class="main-header">✈️ {t("main_header", lang)}</p>', unsafe_allow_html=True)
    st.markdown(f'<p class="sub-header">{t("sub_header", lang)}</p>', unsafe_allow_html=True)

    # Sidebar configuration
    st.sidebar.markdown("---")
    st.sidebar.header(f"📁 {t('data_configuration', lang)}")

    # File upload option
    upload_mode = st.sidebar.radio(
        t('data_source', lang),
        [t('upload_files', lang), t('use_server_files', lang)],
        help=t('upload_help', lang)
    )

    base_path = Path(__file__).parent
    default_inad = base_path / "INAD Tabelle .xlsm"
    default_bazl = base_path / "BAZL-Daten.xlsx"

    if upload_mode == t('upload_files', lang):
        st.sidebar.markdown(f"### {t('upload_data_files', lang)}")

        inad_file = st.sidebar.file_uploader(
            t('inad_file', lang),
            type=['xlsm'],
            help=t('inad_file_help', lang)
        )

        bazl_file = st.sidebar.file_uploader(
            t('bazl_file', lang),
            type=['xlsx'],
            help=t('bazl_file_help', lang)
        )

        if not inad_file or not bazl_file:
            st.warning(f"⚠️ {t('upload_warning', lang)}")
            st.info(f"""
            **{t('required_files', lang)}**
            - **{t('inad_description', lang)}**
            - **{t('bazl_description', lang)}**
            """)
            st.stop()

        # Save uploaded files to temporary location
        import tempfile
        import shutil

        temp_dir = Path(tempfile.gettempdir()) / "inad_analysis"
        temp_dir.mkdir(exist_ok=True)

        inad_path = temp_dir / inad_file.name
        bazl_path = temp_dir / bazl_file.name

        with open(inad_path, 'wb') as f:
            f.write(inad_file.getbuffer())
        with open(bazl_path, 'wb') as f:
            f.write(bazl_file.getbuffer())

        st.sidebar.success(f"✅ {t('files_uploaded', lang)}")
        inad_path = str(inad_path)
        bazl_path = str(bazl_path)

    else:  # Use Server Files
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

    # Load available semesters
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
    semester_options = {format_semester(yr, sem): (yr, sem, start, end) for yr, sem, start, end in semesters}
    selected_semester = st.sidebar.selectbox(t('select_semester', lang), options=list(semester_options.keys()))
    year, sem, start_date, end_date = semester_options[selected_semester]

    # Analysis parameters
    st.sidebar.header(f"⚙️ {t('analysis_parameters', lang)}")

    min_inad = st.sidebar.slider(t('min_inad_threshold', lang), 1, 20, 6,
                                  help=t('min_inad_help', lang))

    min_pax = st.sidebar.slider(t('min_pax_reliable', lang), 1000, 20000, 5000, step=1000,
                                 help=t('min_pax_help', lang))

    threshold_method = st.sidebar.selectbox(t('threshold_method', lang),
                                            ['median', 'trimmed_mean', 'mean'],
                                            help=t('threshold_method_help', lang))

    min_density = st.sidebar.slider(t('min_density_high', lang), 0.05, 0.30, 0.10, step=0.01,
                                     help=t('min_density_help', lang))

    high_multiplier = st.sidebar.slider(t('high_priority_multiplier', lang), 1.0, 3.0, 1.5, step=0.1,
                                         help=t('multiplier_help', lang))

    # Build config
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
    try:
        with st.spinner(t('running_analysis', lang)):
            results = load_analysis(inad_path, bazl_path, start_date, end_date, min_inad, config_tuple)
    except Exception as e:
        st.error(f"❌ {t('analysis_error', lang)} {e}")
        st.stop()

    # Filters
    st.sidebar.header(f"🔍 {t('filters', lang)}")
    all_airlines = sorted(results['inad_raw']['Airline'].unique())
    all_airports = sorted(results['inad_raw']['LastStop'].unique())

    selected_airlines = st.sidebar.multiselect(t('airlines', lang), options=all_airlines, default=[])
    selected_airports = st.sidebar.multiselect(t('airports_last_stop', lang), options=all_airports, default=[])

    # Apply filters
    step3 = results['step3'].copy()
    if selected_airlines:
        step3 = step3[step3['Airline'].isin(selected_airlines)]
    if selected_airports:
        step3 = step3[step3['LastStop'].isin(selected_airports)]

    # Summary metrics
    st.markdown("---")

    col1, col2, col3, col4, col5, col6 = st.columns(6)

    total_inad = len(results['inad_raw'][results['inad_raw']['Included']])
    high_priority = len(step3[step3['Priority'] == 'HIGH_PRIORITY'])
    watch_list = len(step3[step3['Priority'] == 'WATCH_LIST'])
    unreliable = len(step3[step3['Priority'] == 'UNRELIABLE'])
    threshold = results['threshold'] if results['threshold'] else 0

    with col1:
        st.metric(t('total_inad', lang), f"{total_inad:,}")
    with col2:
        st.metric(f"🔴 {t('high_priority', lang)}", high_priority)
    with col3:
        st.metric(f"🟠 {t('watch_list', lang)}", watch_list)
    with col4:
        st.metric(f"⚪ {t('unreliable', lang)}", unreliable)
    with col5:
        st.metric(t('threshold', lang), f"{threshold:.4f}‰")
    with col6:
        st.metric(t('method', lang), threshold_method.title())

    # Tabs
    tab1, tab2, tab3, tab4, tab5, tab6 = st.tabs([
        f"📊 {t('tab_overview', lang)}",
        f"🛫 {t('tab_step1', lang)}",
        f"🛤️ {t('tab_step2', lang)}",
        f"📈 {t('tab_step3', lang)}",
        f"🔄 {t('tab_systemic', lang)}",
        f"📋 {t('tab_legal', lang)}"
    ])

    # Priority labels for charts
    priority_labels = get_priority_labels(lang)

    # Tab 1: Overview
    with tab1:
        st.markdown(f'<p class="step-header">{t("analysis_overview", lang)}</p>', unsafe_allow_html=True)

        col1, col2 = st.columns(2)

        with col1:
            # Priority distribution
            priority_counts = step3['Priority'].value_counts()
            # Translate priority names for display
            translated_names = [priority_labels.get(p, p) for p in priority_counts.index]
            fig = px.pie(
                values=priority_counts.values,
                names=translated_names,
                title=t('priority_distribution', lang),
                color=priority_counts.index,
                color_discrete_map={
                    'HIGH_PRIORITY': '#E53E3E',
                    'WATCH_LIST': '#DD6B20',
                    'CLEAR': '#38A169',
                    'UNRELIABLE': '#A0AEC0',
                    'NO_DATA': '#718096'
                }
            )
            st.plotly_chart(fig, use_container_width=True)

        with col2:
            # Confidence distribution
            if 'Confidence' in step3.columns:
                fig = px.histogram(
                    step3[step3['Confidence'] > 0],
                    x='Confidence',
                    nbins=20,
                    title=t('confidence_distribution', lang),
                    labels={'Confidence': t('confidence_label', lang)},
                    color_discrete_sequence=['#3182CE']
                )
                fig.add_vline(x=50, line_dash="dash", line_color="orange",
                             annotation_text=t('medium_confidence', lang))
                st.plotly_chart(fig, use_container_width=True)

        # Data quality warnings
        if 'DataQuality' in step3.columns:
            quality_issues = step3[step3['DataQuality'].notna()]
            if len(quality_issues) > 0:
                st.markdown(f"### ⚠️ {t('data_quality_warnings', lang)}")
                for _, row in quality_issues.iterrows():
                    st.markdown(f"""
                    <div class="data-warning">
                        <strong>{row['Airline']} → {row['LastStop']}</strong>: {row['DataQuality']}
                    </div>
                    """, unsafe_allow_html=True)

        # Top routes by density
        col1, col2 = st.columns(2)

        with col1:
            reliable = step3[step3['Reliable'] == True].head(10)
            if len(reliable) > 0:
                reliable_display = reliable.copy()
                reliable_display['Route'] = reliable_display['Airline'] + ' → ' + reliable_display['LastStop']
                fig = px.bar(
                    reliable_display,
                    x='Route',
                    y='Density_permille',
                    color='Priority',
                    title=t('top_routes_density', lang),
                    labels={'Density_permille': t('density_label', lang)},
                    color_discrete_map={
                        'HIGH_PRIORITY': '#E53E3E',
                        'WATCH_LIST': '#DD6B20',
                        'CLEAR': '#38A169'
                    }
                )
                fig.add_hline(y=threshold, line_dash="dash", line_color="blue",
                             annotation_text=f"{t('threshold', lang)}: {threshold:.4f}‰")
                fig.update_layout(xaxis_tickangle=-45)
                st.plotly_chart(fig, use_container_width=True)

        with col2:
            # Refusal category breakdown for flagged routes
            flagged = step3[step3['Priority'].isin(['HIGH_PRIORITY', 'WATCH_LIST'])]
            if len(flagged) > 0 and 'CodeBreakdown' in flagged.columns:
                category_totals = {}
                for breakdown in flagged['CodeBreakdown']:
                    if isinstance(breakdown, dict):
                        for cat, count in breakdown.items():
                            category_totals[cat] = category_totals.get(cat, 0) + count

                if category_totals:
                    fig = px.pie(
                        values=list(category_totals.values()),
                        names=list(category_totals.keys()),
                        title=t('refusal_categories_flagged', lang),
                        color_discrete_sequence=px.colors.qualitative.Set2
                    )
                    st.plotly_chart(fig, use_container_width=True)

    # Tab 2: Step 1 - Airlines
    with tab2:
        st.markdown(f'<p class="step-header">{t("step1_header", lang).format(min_inad)}</p>', unsafe_allow_html=True)

        step1 = results['step1']

        col1, col2 = st.columns([2, 1])

        with col1:
            display_df = step1.copy()
            display_df['Status'] = display_df['PassesThreshold'].map({
                True: f'⚠️ {t("review", lang)}',
                False: f'✅ {t("ok", lang)}'
            })
            display_df = display_df[['Airline', 'INAD_Count', 'Status']]
            display_df.columns = [t('airline', lang), t('inad_count', lang), t('status', lang)]

            def highlight_step1(row):
                if t('review', lang) in str(row[t('status', lang)]):
                    return ['background-color: #FED7D7; color: black'] * len(row)
                return ['background-color: #C6F6D5; color: black'] * len(row)

            st.dataframe(display_df.style.apply(highlight_step1, axis=1),
                        use_container_width=True, height=400)

        with col2:
            passing = step1[step1['PassesThreshold']]
            st.info(f"""
            **{t('step1_summary', lang)}**
            - {t('airlines_above_threshold', lang).format(len(passing), min_inad)}
            - {t('airlines_below_threshold', lang).format(len(step1) - len(passing))}
            - {t('total_inads_flagged', lang).format(passing['INAD_Count'].sum() if len(passing) > 0 else 0)}
            """)

            fig = px.histogram(step1, x='INAD_Count', nbins=20,
                              title=t('inad_distribution_airline', lang),
                              color_discrete_sequence=['#3182CE'])
            fig.add_vline(x=min_inad, line_dash="dash", line_color="red",
                         annotation_text=f"{t('threshold', lang)} ({min_inad})")
            st.plotly_chart(fig, use_container_width=True)

    # Tab 3: Step 2 - Routes
    with tab3:
        st.markdown(f'<p class="step-header">{t("step2_header", lang).format(min_inad)}</p>', unsafe_allow_html=True)

        step2 = results['step2']

        col1, col2 = st.columns([2, 1])

        with col1:
            display_df = step2.copy()
            display_df['Status'] = display_df['PassesThreshold'].map({
                True: f'⚠️ {t("review", lang)}',
                False: f'✅ {t("ok", lang)}'
            })
            display_df = display_df[['Airline', 'LastStop', 'INAD_Count', 'Status']]
            display_df.columns = [t('airline', lang), t('last_stop', lang), t('inad_count', lang), t('status', lang)]

            def highlight_step2(row):
                if t('review', lang) in str(row[t('status', lang)]):
                    return ['background-color: #FED7D7; color: black'] * len(row)
                return ['background-color: #C6F6D5; color: black'] * len(row)

            st.dataframe(display_df.style.apply(highlight_step2, axis=1),
                        use_container_width=True, height=400)

        with col2:
            passing = step2[step2['PassesThreshold']]
            st.info(f"""
            **{t('step2_summary', lang)}**
            - {t('routes_above_threshold', lang).format(len(passing), min_inad)}
            - {t('airlines_affected', lang).format(len(passing['Airline'].unique()) if len(passing) > 0 else 0)}
            """)

            if len(step2) > 0:
                airport_counts = step2.groupby('LastStop')['INAD_Count'].sum().sort_values(ascending=False).head(10)
                fig = px.bar(x=airport_counts.index, y=airport_counts.values,
                            title=t('top_airports_inad', lang),
                            labels={'x': t('airport', lang), 'y': t('inad_count', lang)},
                            color_discrete_sequence=['#3182CE'])
                fig.update_layout(xaxis_tickangle=-45)
                st.plotly_chart(fig, use_container_width=True)

    # Tab 4: Step 3 - Priority Analysis
    with tab4:
        st.markdown(f'<p class="step-header">{t("step3_header", lang)}</p>', unsafe_allow_html=True)

        # Explanation
        with st.expander(f"ℹ️ {t('classification_criteria', lang)}"):
            st.markdown(f"""
            **🔴 {t('high_priority_desc', lang)}**
            - {t('high_priority_criteria1', lang).format(high_multiplier, f"{threshold * high_multiplier:.4f}")}
            - {t('high_priority_criteria2', lang).format(min_density)}
            - {t('high_priority_criteria3', lang)}
            - {t('high_priority_criteria4', lang).format(min_pax)}

            **🟠 {t('watch_list_desc', lang)}**
            - {t('watch_list_criteria', lang).format(f"{threshold:.4f}")}
            - {t('watch_list_criteria2', lang)}

            **🟢 {t('clear_desc', lang)}**
            - {t('clear_criteria', lang)}

            **⚪ {t('unreliable_desc', lang)}**
            - {t('unreliable_criteria', lang).format(min_pax)}
            """)

        col1, col2 = st.columns([2, 1])

        with col1:
            display_df = step3.copy()
            display_df['Priority_Display'] = display_df['Priority'].map(priority_labels)
            display_df['Density_Display'] = display_df['Density_permille'].apply(
                lambda x: f"{x:.4f}‰" if pd.notna(x) else "N/A")
            display_df['PAX_Display'] = display_df['PAX'].apply(lambda x: f"{x:,}")
            display_df['Confidence_Display'] = display_df['Confidence'].apply(lambda x: f"{x}%")

            show_cols = ['Airline', 'LastStop', 'INAD', 'PAX_Display', 'Density_Display',
                        'Confidence_Display', 'Priority_Display']
            display_df = display_df[show_cols]
            display_df.columns = [t('airline', lang), t('last_stop', lang), 'INAD', t('pax', lang),
                                 t('density', lang), t('confidence', lang), t('priority', lang)]

            st.dataframe(style_priority_table(display_df), use_container_width=True, height=500)

        with col2:
            high = step3[step3['Priority'] == 'HIGH_PRIORITY']
            watch = step3[step3['Priority'] == 'WATCH_LIST']

            if len(high) > 0:
                st.error(f"""
                **🔴 {t('high_priority_routes_msg', lang).format(len(high))}**

                {t('requires_legal_review', lang)}
                """)

            if len(watch) > 0:
                st.warning(f"""
                **🟠 {t('watch_list_routes_msg', lang).format(len(watch))}**

                {t('monitor_escalation', lang)}
                """)

            # Density vs PAX scatter
            reliable_step3 = step3[step3['Reliable'] == True]
            if len(reliable_step3) > 0:
                fig = px.scatter(
                    reliable_step3,
                    x='PAX',
                    y='Density_permille',
                    color='Priority',
                    size='INAD',
                    hover_data=['Airline', 'LastStop'],
                    title=t('density_vs_pax', lang),
                    color_discrete_map={
                        'HIGH_PRIORITY': '#E53E3E',
                        'WATCH_LIST': '#DD6B20',
                        'CLEAR': '#38A169'
                    }
                )
                fig.add_hline(y=threshold, line_dash="dash", line_color="blue",
                             annotation_text=t('threshold', lang))
                fig.add_hline(y=min_density, line_dash="dot", line_color="red",
                             annotation_text=t('min_density_high', lang).split('(')[0].strip())
                st.plotly_chart(fig, use_container_width=True)

    # Tab 5: Systemic Cases
    with tab5:
        st.markdown(f'<p class="step-header">{t("systemic_header", lang)}</p>', unsafe_allow_html=True)

        st.info(t('systemic_info', lang))

        # Run multi-semester analysis
        with st.spinner(t('analyzing_historical', lang)):
            try:
                multi_results = load_multi_semester_analysis(
                    inad_path, bazl_path,
                    tuple(tuple(s) for s in semesters),
                    config_tuple
                )
                systemic = multi_results['systemic_cases']
            except Exception as e:
                st.error(f"{t('systemic_analysis_error', lang)} {e}")
                systemic = pd.DataFrame()

        if len(systemic) == 0:
            st.info(t('no_systemic_routes', lang))
        else:
            # Summary
            truly_systemic = systemic[systemic['IsSystemic'] == True]
            col1, col2, col3 = st.columns(3)
            with col1:
                st.metric(f"🔴 {t('systemic_cases', lang)}", len(truly_systemic))
            with col2:
                st.metric(t('routes_flagged_multiple', lang), len(systemic))
            with col3:
                worsening = len(systemic[systemic['Trend'] == 'WORSENING'])
                st.metric(t('worsening_trends', lang), worsening)

            # Systemic cases table
            if len(truly_systemic) > 0:
                st.markdown(f"### 🔴 {t('confirmed_systemic', lang)}")
                st.markdown(f"*{t('systemic_description', lang)}*")

                display_systemic = truly_systemic.copy()
                display_systemic['Trend_Display'] = display_systemic.apply(
                    lambda r: f"{r['Trend']} ({r['TrendPercent']:+.1f}%)" if r['Trend'] != 'NEW' else 'NEW',
                    axis=1)
                display_systemic['Latest'] = display_systemic.apply(
                    lambda r: f"{r['LatestINAD']} INAD, {r['LatestDensity']:.4f}‰" if r['LatestDensity'] else "N/A",
                    axis=1)

                show_cols = ['Airline', 'LastStop', 'TotalAppearances', 'MaxConsecutive',
                            'Trend_Display', 'Latest', 'LatestPriority']
                display_systemic = display_systemic[show_cols]
                display_systemic.columns = [t('airline', lang), t('last_stop', lang), t('appearances', lang),
                                           t('consecutive', lang), t('trend', lang), t('latest_data', lang),
                                           t('current_priority', lang)]

                st.dataframe(display_systemic, use_container_width=True)

            # Historical view
            st.markdown(f"### 📊 {t('historical_trends', lang)}")

            # Semester summary chart
            summary = multi_results['semester_summary']
            if len(summary) > 0:
                fig = go.Figure()
                fig.add_trace(go.Scatter(
                    x=summary['Label'], y=summary['High_Priority'],
                    mode='lines+markers', name=t('high_priority', lang),
                    line=dict(color='#E53E3E', width=2)
                ))
                fig.add_trace(go.Scatter(
                    x=summary['Label'], y=summary['Watch_List'],
                    mode='lines+markers', name=t('watch_list', lang),
                    line=dict(color='#DD6B20', width=2)
                ))
                fig.update_layout(
                    title=t('flagged_routes_time', lang),
                    xaxis_title=t('semester', lang),
                    yaxis_title=t('number_routes', lang),
                    hovermode='x unified'
                )
                st.plotly_chart(fig, use_container_width=True)

            # Route history detail
            if len(systemic) > 0:
                st.markdown(f"### 🔍 {t('route_history_detail', lang)}")
                selected_route = st.selectbox(
                    t('select_route_history', lang),
                    options=[f"{r['Airline']} → {r['LastStop']}" for _, r in systemic.iterrows()]
                )

                if selected_route:
                    airline, last_stop = selected_route.split(' → ')
                    route_data = systemic[(systemic['Airline'] == airline) &
                                         (systemic['LastStop'] == last_stop)].iloc[0]
                    history = route_data['History']

                    if history:
                        hist_df = pd.DataFrame(history)
                        fig = go.Figure()
                        fig.add_trace(go.Scatter(
                            x=hist_df['Semester'],
                            y=hist_df['Density'],
                            mode='lines+markers',
                            name=t('density', lang),
                            line=dict(color='#3182CE', width=2),
                            marker=dict(size=10)
                        ))
                        fig.add_trace(go.Bar(
                            x=hist_df['Semester'],
                            y=hist_df['INAD'],
                            name=t('inad_count', lang),
                            yaxis='y2',
                            marker_color='rgba(50, 130, 206, 0.3)'
                        ))
                        fig.update_layout(
                            title=f'{t("history", lang)} {selected_route}',
                            yaxis=dict(title=t('density_label', lang), side='left'),
                            yaxis2=dict(title=t('inad_count', lang), side='right', overlaying='y'),
                            hovermode='x unified'
                        )
                        st.plotly_chart(fig, use_container_width=True)

    # Tab 6: Legal Summary
    with tab6:
        st.markdown(f'<p class="step-header">{t("legal_header", lang)}</p>', unsafe_allow_html=True)

        st.markdown(f"""
        ### {t('analysis_params', lang)}
        - **{t('period', lang)}** {selected_semester}
        - **{t('threshold_method_label', lang)}** {threshold_method.title()}
        - **{t('threshold_value', lang)}** {threshold:.4f}‰
        - **{t('minimum_inad', lang)}** {min_inad}
        - **{t('minimum_pax', lang)}** {min_pax:,}
        """)

        # Generate summary
        summary = ia.generate_legal_summary(step3)

        col1, col2 = st.columns(2)

        with col1:
            st.markdown(f"### 🔴 {t('high_priority_routes', lang)}")
            if summary['high_priority_count'] > 0:
                for route in summary['high_priority_routes']:
                    st.markdown(f"""
                    **{route['Airline']} → {route['LastStop']}**
                    - INAD: {route['INAD']} | {t('pax', lang)}: {route['PAX']:,}
                    - {t('density', lang)}: {route['Density_permille']:.4f}‰
                    - {t('confidence', lang)}: {route['Confidence']}%
                    """)
            else:
                st.success(t('no_high_priority', lang))

        with col2:
            st.markdown(f"### 🟠 {t('watch_list_routes', lang)}")
            if summary['watch_list_count'] > 0:
                for route in summary['watch_list_routes']:
                    st.markdown(f"""
                    **{route['Airline']} → {route['LastStop']}**
                    - INAD: {route['INAD']} | {t('pax', lang)}: {route['PAX']:,}
                    - {t('density', lang)}: {route['Density_permille']:.4f}‰
                    - {t('confidence', lang)}: {route['Confidence']}%
                    """)
            else:
                st.info(t('no_watch_list', lang))

        # Data quality issues
        if summary['data_quality_issues']:
            st.markdown(f"### ⚠️ {t('data_quality_notes', lang)}")
            for issue in summary['data_quality_issues']:
                st.warning(f"**{issue['Airline']} → {issue['LastStop']}**: {issue['DataQuality']}")

        # Export section
        st.markdown("---")
        st.markdown(f"### 📥 {t('export_reports', lang)}")

        col1, col2, col3 = st.columns(3)

        with col1:
            # High priority CSV
            high_df = step3[step3['Priority'] == 'HIGH_PRIORITY'][
                ['Airline', 'LastStop', 'INAD', 'PAX', 'Density_permille', 'Confidence']
            ].copy()
            if len(high_df) > 0:
                csv = high_df.to_csv(index=False).encode('utf-8')
                st.download_button(
                    f"📥 {t('export_high_priority', lang)}",
                    data=csv,
                    file_name=f"HIGH_PRIORITY_{year}_H{sem}.csv",
                    mime="text/csv"
                )

        with col2:
            # Watch list CSV
            watch_df = step3[step3['Priority'] == 'WATCH_LIST'][
                ['Airline', 'LastStop', 'INAD', 'PAX', 'Density_permille', 'Confidence']
            ].copy()
            if len(watch_df) > 0:
                csv = watch_df.to_csv(index=False).encode('utf-8')
                st.download_button(
                    f"📥 {t('export_watch_list', lang)}",
                    data=csv,
                    file_name=f"WATCH_LIST_{year}_H{sem}.csv",
                    mime="text/csv"
                )

        with col3:
            # Full analysis CSV
            export_df = step3.copy()
            export_df['CodeBreakdown'] = export_df['CodeBreakdown'].apply(str)
            csv = export_df.to_csv(index=False).encode('utf-8')
            st.download_button(
                f"📥 {t('export_full', lang)}",
                data=csv,
                file_name=f"INAD_Analysis_{year}_H{sem}.csv",
                mime="text/csv"
            )

    # Footer
    st.markdown("---")
    st.markdown(
        f"<small>{t('analysis_label', lang)} {selected_semester} | {t('threshold_label', lang)} {threshold:.4f}‰ ({threshold_method}) | "
        f"{t('min_pax_label', lang)} {min_pax:,} | {t('generated', lang)} {pd.Timestamp.now().strftime('%Y-%m-%d %H:%M')}</small>",
        unsafe_allow_html=True
    )


if __name__ == "__main__":
    main()
