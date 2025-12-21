#!/usr/bin/env python3
"""
INAD Analysis Dashboard - Enhanced Version

Interactive Streamlit dashboard for analyzing INAD (inadmissible passenger) data.
Includes priority classification, systemic case detection, and legal review support.

Run with: streamlit run dashboard.py
"""

import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from pathlib import Path
import inad_analysis as ia

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


def style_priority_table(df):
    """Apply styling to priority table with black text."""
    def highlight_priority(row):
        priority = row.get('Priority', row.get('Status', ''))
        if priority in ['HIGH_PRIORITY', '🔴 HIGH']:
            return ['background-color: #FED7D7; color: black'] * len(row)
        elif priority in ['WATCH_LIST', '🟠 WATCH']:
            return ['background-color: #FEEBC8; color: black'] * len(row)
        elif priority in ['UNRELIABLE', '⚪ UNRELIABLE']:
            return ['background-color: #E2E8F0; color: black'] * len(row)
        elif priority in ['CLEAR', '🟢 CLEAR']:
            return ['background-color: #C6F6D5; color: black'] * len(row)
        return ['color: black'] * len(row)
    return df.style.apply(highlight_priority, axis=1)


def main():
    # Header
    st.markdown('<p class="main-header">✈️ INAD Analysis Dashboard</p>', unsafe_allow_html=True)
    st.markdown('<p class="sub-header">Enhanced Analysis with Priority Classification & Systemic Case Detection</p>', unsafe_allow_html=True)

    # Sidebar configuration
    st.sidebar.header("📁 Data Configuration")

    # File upload option
    upload_mode = st.sidebar.radio(
        "Data Source",
        ["Upload Files", "Use Server Files"],
        help="Upload new files or use existing files on the server"
    )

    base_path = Path(__file__).parent
    default_inad = base_path / "INAD Tabelle .xlsm"
    default_bazl = base_path / "BAZL-Daten.xlsx"

    if upload_mode == "Upload Files":
        st.sidebar.markdown("### Upload Data Files")

        inad_file = st.sidebar.file_uploader(
            "INAD File (.xlsm)",
            type=['xlsm'],
            help="Upload the INAD Tabelle file"
        )

        bazl_file = st.sidebar.file_uploader(
            "BAZL File (.xlsx)",
            type=['xlsx'],
            help="Upload the BAZL-Daten file"
        )

        if not inad_file or not bazl_file:
            st.warning("⚠️ Please upload both INAD and BAZL files in the sidebar to begin analysis.")
            st.info("""
            **Required Files:**
            - **INAD Tabelle** (.xlsm): Contains inadmissible passenger records
            - **BAZL-Daten** (.xlsx): Contains passenger count data
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

        st.sidebar.success("✅ Files uploaded successfully!")
        inad_path = str(inad_path)
        bazl_path = str(bazl_path)

    else:  # Use Server Files
        inad_path = st.sidebar.text_input(
            "INAD File Path",
            value=str(default_inad) if default_inad.exists() else ""
        )

        bazl_path = st.sidebar.text_input(
            "BAZL File Path",
            value=str(default_bazl) if default_bazl.exists() else ""
        )

        if not inad_path or not bazl_path:
            st.warning("⚠️ Please enter paths to INAD and BAZL files in the sidebar.")
            st.stop()

        if not Path(inad_path).exists() or not Path(bazl_path).exists():
            st.error("❌ One or more data files not found on server.")
            st.stop()

    # Load available semesters
    try:
        with st.spinner("Loading available semesters..."):
            semesters = ia.get_available_semesters(inad_path)
    except Exception as e:
        st.error(f"❌ Error loading INAD file: {e}")
        st.stop()

    if not semesters:
        st.warning("⚠️ No data found in INAD file.")
        st.stop()

    # Semester selection
    st.sidebar.header("📅 Time Period")
    semester_options = {format_semester(yr, sem): (yr, sem, start, end) for yr, sem, start, end in semesters}
    selected_semester = st.sidebar.selectbox("Select Semester", options=list(semester_options.keys()))
    year, sem, start_date, end_date = semester_options[selected_semester]

    # Analysis parameters
    st.sidebar.header("⚙️ Analysis Parameters")

    min_inad = st.sidebar.slider("Minimum INAD Threshold", 1, 20, 6,
                                  help="Minimum INADs for Step 1 and Step 2")

    min_pax = st.sidebar.slider("Minimum PAX for Reliable Data", 1000, 20000, 5000, step=1000,
                                 help="Routes with fewer passengers are marked as UNRELIABLE")

    threshold_method = st.sidebar.selectbox("Threshold Calculation Method",
                                            ['median', 'trimmed_mean', 'mean'],
                                            help="Median is most robust against outliers")

    min_density = st.sidebar.slider("Minimum Density for HIGH PRIORITY (‰)", 0.05, 0.30, 0.10, step=0.01,
                                     help="Must exceed this density to be HIGH PRIORITY")

    high_multiplier = st.sidebar.slider("HIGH PRIORITY Multiplier", 1.0, 3.0, 1.5, step=0.1,
                                         help="Must be this × threshold for HIGH PRIORITY")

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
        with st.spinner("Running analysis..."):
            results = load_analysis(inad_path, bazl_path, start_date, end_date, min_inad, config_tuple)
    except Exception as e:
        st.error(f"❌ Analysis error: {e}")
        st.stop()

    # Filters
    st.sidebar.header("🔍 Filters")
    all_airlines = sorted(results['inad_raw']['Airline'].unique())
    all_airports = sorted(results['inad_raw']['LastStop'].unique())

    selected_airlines = st.sidebar.multiselect("Airlines", options=all_airlines, default=[])
    selected_airports = st.sidebar.multiselect("Airports (Last Stop)", options=all_airports, default=[])

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
        st.metric("Total INAD", f"{total_inad:,}")
    with col2:
        st.metric("🔴 HIGH PRIORITY", high_priority)
    with col3:
        st.metric("🟠 WATCH LIST", watch_list)
    with col4:
        st.metric("⚪ UNRELIABLE", unreliable)
    with col5:
        st.metric("Threshold", f"{threshold:.4f}‰")
    with col6:
        st.metric("Method", threshold_method.title())

    # Tabs
    tab1, tab2, tab3, tab4, tab5, tab6 = st.tabs([
        "📊 Overview",
        "🛫 Step 1: Airlines",
        "🛤️ Step 2: Routes",
        "📈 Step 3: Priority Analysis",
        "🔄 Systemic Cases",
        "📋 Legal Summary"
    ])

    # Tab 1: Overview
    with tab1:
        st.markdown('<p class="step-header">Analysis Overview</p>', unsafe_allow_html=True)

        col1, col2 = st.columns(2)

        with col1:
            # Priority distribution
            priority_counts = step3['Priority'].value_counts()
            fig = px.pie(
                values=priority_counts.values,
                names=priority_counts.index,
                title='Route Priority Distribution',
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
                    title='Confidence Score Distribution',
                    labels={'Confidence': 'Confidence Score (0-100)'},
                    color_discrete_sequence=['#3182CE']
                )
                fig.add_vline(x=50, line_dash="dash", line_color="orange",
                             annotation_text="Medium Confidence")
                st.plotly_chart(fig, use_container_width=True)

        # Data quality warnings
        quality_issues = step3[step3['DataQuality'].notna()]
        if len(quality_issues) > 0:
            st.markdown("### ⚠️ Data Quality Warnings")
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
                    title='Top 10 Routes by Density (Reliable Data Only)',
                    labels={'Density_permille': 'Density (‰)'},
                    color_discrete_map={
                        'HIGH_PRIORITY': '#E53E3E',
                        'WATCH_LIST': '#DD6B20',
                        'CLEAR': '#38A169'
                    }
                )
                fig.add_hline(y=threshold, line_dash="dash", line_color="blue",
                             annotation_text=f"Threshold: {threshold:.4f}‰")
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
                        title='Refusal Categories (Flagged Routes)',
                        color_discrete_sequence=px.colors.qualitative.Set2
                    )
                    st.plotly_chart(fig, use_container_width=True)

    # Tab 2: Step 1 - Airlines
    with tab2:
        st.markdown(f'<p class="step-header">Step 1: Airlines with ≥{min_inad} INADs</p>', unsafe_allow_html=True)

        step1 = results['step1']

        col1, col2 = st.columns([2, 1])

        with col1:
            display_df = step1.copy()
            display_df['Status'] = display_df['PassesThreshold'].map({True: '⚠️ Review', False: '✅ OK'})
            display_df = display_df[['Airline', 'INAD_Count', 'Status']]
            display_df.columns = ['Airline', 'INAD Count', 'Status']

            def highlight_step1(row):
                if row['Status'] == '⚠️ Review':
                    return ['background-color: #FED7D7; color: black'] * len(row)
                return ['background-color: #C6F6D5; color: black'] * len(row)

            st.dataframe(display_df.style.apply(highlight_step1, axis=1),
                        use_container_width=True, height=400)

        with col2:
            passing = step1[step1['PassesThreshold']]
            st.info(f"""
            **Summary:**
            - {len(passing)} airlines ≥{min_inad} INADs
            - {len(step1) - len(passing)} airlines below threshold
            - {passing['INAD_Count'].sum() if len(passing) > 0 else 0} total INADs from flagged airlines
            """)

            fig = px.histogram(step1, x='INAD_Count', nbins=20,
                              title='INAD Distribution by Airline',
                              color_discrete_sequence=['#3182CE'])
            fig.add_vline(x=min_inad, line_dash="dash", line_color="red",
                         annotation_text=f"Threshold ({min_inad})")
            st.plotly_chart(fig, use_container_width=True)

    # Tab 3: Step 2 - Routes
    with tab3:
        st.markdown(f'<p class="step-header">Step 2: Routes with ≥{min_inad} INADs</p>', unsafe_allow_html=True)

        step2 = results['step2']

        col1, col2 = st.columns([2, 1])

        with col1:
            display_df = step2.copy()
            display_df['Status'] = display_df['PassesThreshold'].map({True: '⚠️ Review', False: '✅ OK'})
            display_df = display_df[['Airline', 'LastStop', 'INAD_Count', 'Status']]
            display_df.columns = ['Airline', 'Last Stop', 'INAD Count', 'Status']

            def highlight_step2(row):
                if row['Status'] == '⚠️ Review':
                    return ['background-color: #FED7D7; color: black'] * len(row)
                return ['background-color: #C6F6D5; color: black'] * len(row)

            st.dataframe(display_df.style.apply(highlight_step2, axis=1),
                        use_container_width=True, height=400)

        with col2:
            passing = step2[step2['PassesThreshold']]
            st.info(f"""
            **Summary:**
            - {len(passing)} routes ≥{min_inad} INADs
            - {len(passing['Airline'].unique()) if len(passing) > 0 else 0} airlines affected
            """)

            if len(step2) > 0:
                airport_counts = step2.groupby('LastStop')['INAD_Count'].sum().sort_values(ascending=False).head(10)
                fig = px.bar(x=airport_counts.index, y=airport_counts.values,
                            title='Top 10 Airports by INAD Count',
                            labels={'x': 'Airport', 'y': 'INAD Count'},
                            color_discrete_sequence=['#3182CE'])
                fig.update_layout(xaxis_tickangle=-45)
                st.plotly_chart(fig, use_container_width=True)

    # Tab 4: Step 3 - Priority Analysis
    with tab4:
        st.markdown('<p class="step-header">Step 3: Priority Classification</p>', unsafe_allow_html=True)

        # Explanation
        with st.expander("ℹ️ Classification Criteria"):
            st.markdown(f"""
            **🔴 HIGH PRIORITY** - Requires immediate legal review:
            - Density ≥ {high_multiplier}× threshold ({threshold * high_multiplier:.4f}‰)
            - Density ≥ {min_density}‰ (minimum density)
            - INAD count ≥ 10
            - PAX ≥ {min_pax:,} (reliable data)

            **🟠 WATCH LIST** - Monitor closely:
            - Density ≥ threshold ({threshold:.4f}‰)
            - Does not meet all HIGH PRIORITY criteria

            **🟢 CLEAR** - No action needed:
            - Density < threshold

            **⚪ UNRELIABLE** - Data quality concerns:
            - PAX < {min_pax:,} (insufficient passenger data)
            """)

        col1, col2 = st.columns([2, 1])

        with col1:
            display_df = step3.copy()
            display_df['Priority_Display'] = display_df['Priority'].map({
                'HIGH_PRIORITY': '🔴 HIGH',
                'WATCH_LIST': '🟠 WATCH',
                'CLEAR': '🟢 CLEAR',
                'UNRELIABLE': '⚪ UNRELIABLE',
                'NO_DATA': '❓ NO DATA'
            })
            display_df['Density_Display'] = display_df['Density_permille'].apply(
                lambda x: f"{x:.4f}‰" if pd.notna(x) else "N/A")
            display_df['PAX_Display'] = display_df['PAX'].apply(lambda x: f"{x:,}")
            display_df['Confidence_Display'] = display_df['Confidence'].apply(lambda x: f"{x}%")

            show_cols = ['Airline', 'LastStop', 'INAD', 'PAX_Display', 'Density_Display',
                        'Confidence_Display', 'Priority_Display']
            display_df = display_df[show_cols]
            display_df.columns = ['Airline', 'Last Stop', 'INAD', 'PAX', 'Density', 'Confidence', 'Priority']

            st.dataframe(style_priority_table(display_df), use_container_width=True, height=500)

        with col2:
            high = step3[step3['Priority'] == 'HIGH_PRIORITY']
            watch = step3[step3['Priority'] == 'WATCH_LIST']

            if len(high) > 0:
                st.error(f"""
                **🔴 {len(high)} HIGH PRIORITY Routes**

                Require immediate legal review
                """)

            if len(watch) > 0:
                st.warning(f"""
                **🟠 {len(watch)} WATCH LIST Routes**

                Monitor for potential escalation
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
                    title='Density vs. PAX Volume',
                    color_discrete_map={
                        'HIGH_PRIORITY': '#E53E3E',
                        'WATCH_LIST': '#DD6B20',
                        'CLEAR': '#38A169'
                    }
                )
                fig.add_hline(y=threshold, line_dash="dash", line_color="blue",
                             annotation_text=f"Threshold")
                fig.add_hline(y=min_density, line_dash="dot", line_color="red",
                             annotation_text=f"Min Density")
                st.plotly_chart(fig, use_container_width=True)

    # Tab 5: Systemic Cases
    with tab5:
        st.markdown('<p class="step-header">Systemic Case Detection</p>', unsafe_allow_html=True)

        st.info("""
        **Systemic cases** are routes that appear on the WATCH LIST or HIGH PRIORITY
        in **2 or more consecutive semesters**, indicating a persistent pattern
        rather than a one-time occurrence.
        """)

        # Run multi-semester analysis
        with st.spinner("Analyzing historical data for systemic patterns..."):
            try:
                multi_results = load_multi_semester_analysis(
                    inad_path, bazl_path,
                    tuple(tuple(s) for s in semesters),
                    config_tuple
                )
                systemic = multi_results['systemic_cases']
            except Exception as e:
                st.error(f"Error in systemic analysis: {e}")
                systemic = pd.DataFrame()

        if len(systemic) == 0:
            st.info("No routes have appeared on watch lists in multiple semesters.")
        else:
            # Summary
            truly_systemic = systemic[systemic['IsSystemic'] == True]
            col1, col2, col3 = st.columns(3)
            with col1:
                st.metric("🔴 Systemic Cases", len(truly_systemic))
            with col2:
                st.metric("Routes Flagged Multiple Times", len(systemic))
            with col3:
                worsening = len(systemic[systemic['Trend'] == 'WORSENING'])
                st.metric("Worsening Trends", worsening)

            # Systemic cases table
            if len(truly_systemic) > 0:
                st.markdown("### 🔴 Confirmed Systemic Cases")
                st.markdown("*Routes flagged in 2+ consecutive semesters - require priority legal review*")

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
                display_systemic.columns = ['Airline', 'Last Stop', 'Appearances', 'Consecutive',
                                           'Trend', 'Latest Data', 'Current Priority']

                st.dataframe(display_systemic, use_container_width=True)

            # Historical view
            st.markdown("### 📊 Historical Trends")

            # Semester summary chart
            summary = multi_results['semester_summary']
            if len(summary) > 0:
                fig = go.Figure()
                fig.add_trace(go.Scatter(
                    x=summary['Label'], y=summary['High_Priority'],
                    mode='lines+markers', name='HIGH PRIORITY',
                    line=dict(color='#E53E3E', width=2)
                ))
                fig.add_trace(go.Scatter(
                    x=summary['Label'], y=summary['Watch_List'],
                    mode='lines+markers', name='WATCH LIST',
                    line=dict(color='#DD6B20', width=2)
                ))
                fig.update_layout(
                    title='Flagged Routes Over Time',
                    xaxis_title='Semester',
                    yaxis_title='Number of Routes',
                    hovermode='x unified'
                )
                st.plotly_chart(fig, use_container_width=True)

            # Route history detail
            if len(systemic) > 0:
                st.markdown("### 🔍 Route History Detail")
                selected_route = st.selectbox(
                    "Select a route to view history",
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
                            name='Density',
                            line=dict(color='#3182CE', width=2),
                            marker=dict(size=10)
                        ))
                        fig.add_trace(go.Bar(
                            x=hist_df['Semester'],
                            y=hist_df['INAD'],
                            name='INAD Count',
                            yaxis='y2',
                            marker_color='rgba(50, 130, 206, 0.3)'
                        ))
                        fig.update_layout(
                            title=f'History: {selected_route}',
                            yaxis=dict(title='Density (‰)', side='left'),
                            yaxis2=dict(title='INAD Count', side='right', overlaying='y'),
                            hovermode='x unified'
                        )
                        st.plotly_chart(fig, use_container_width=True)

    # Tab 6: Legal Summary
    with tab6:
        st.markdown('<p class="step-header">Legal Review Summary</p>', unsafe_allow_html=True)

        st.markdown(f"""
        ### Analysis Parameters
        - **Period:** {selected_semester}
        - **Threshold Method:** {threshold_method.title()}
        - **Threshold Value:** {threshold:.4f}‰
        - **Minimum INAD:** {min_inad}
        - **Minimum PAX:** {min_pax:,}
        """)

        # Generate summary
        summary = ia.generate_legal_summary(step3)

        col1, col2 = st.columns(2)

        with col1:
            st.markdown("### 🔴 HIGH PRIORITY Routes")
            if summary['high_priority_count'] > 0:
                for route in summary['high_priority_routes']:
                    st.markdown(f"""
                    **{route['Airline']} → {route['LastStop']}**
                    - INAD: {route['INAD']} | PAX: {route['PAX']:,}
                    - Density: {route['Density_permille']:.4f}‰
                    - Confidence: {route['Confidence']}%
                    """)
            else:
                st.success("No HIGH PRIORITY routes identified.")

        with col2:
            st.markdown("### 🟠 WATCH LIST Routes")
            if summary['watch_list_count'] > 0:
                for route in summary['watch_list_routes']:
                    st.markdown(f"""
                    **{route['Airline']} → {route['LastStop']}**
                    - INAD: {route['INAD']} | PAX: {route['PAX']:,}
                    - Density: {route['Density_permille']:.4f}‰
                    - Confidence: {route['Confidence']}%
                    """)
            else:
                st.info("No WATCH LIST routes identified.")

        # Data quality issues
        if summary['data_quality_issues']:
            st.markdown("### ⚠️ Data Quality Notes")
            for issue in summary['data_quality_issues']:
                st.warning(f"**{issue['Airline']} → {issue['LastStop']}**: {issue['DataQuality']}")

        # Export section
        st.markdown("---")
        st.markdown("### 📥 Export Reports")

        col1, col2, col3 = st.columns(3)

        with col1:
            # High priority CSV
            high_df = step3[step3['Priority'] == 'HIGH_PRIORITY'][
                ['Airline', 'LastStop', 'INAD', 'PAX', 'Density_permille', 'Confidence']
            ].copy()
            if len(high_df) > 0:
                csv = high_df.to_csv(index=False).encode('utf-8')
                st.download_button(
                    "📥 HIGH PRIORITY Routes (CSV)",
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
                    "📥 WATCH LIST Routes (CSV)",
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
                "📥 Full Analysis (CSV)",
                data=csv,
                file_name=f"INAD_Analysis_{year}_H{sem}.csv",
                mime="text/csv"
            )

    # Footer
    st.markdown("---")
    st.markdown(
        f"<small>Analysis: {selected_semester} | Threshold: {threshold:.4f}‰ ({threshold_method}) | "
        f"Min PAX: {min_pax:,} | Generated: {pd.Timestamp.now().strftime('%Y-%m-%d %H:%M')}</small>",
        unsafe_allow_html=True
    )


if __name__ == "__main__":
    main()
