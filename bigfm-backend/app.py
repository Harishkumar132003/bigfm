from flask import Flask, request, jsonify
import pandas as pd
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

FILE_PATH = 'data/Excecl Merge Macro.xlsx'
SELECTED_BROADCASTERS = ['BIG FM', 'RADIO CITY', 'RADIO MIRCHI', 'RED FM', 'MY FM', 'FEVER']

@app.route('/market_share_by_origin', methods=['POST'])
def market_share_by_origin():
    try:
        data = request.get_json()
        city = data.get("city")

        if not city:
            return jsonify({"error": "city field is required"}), 400

        # read sheet
        try:
            df = pd.read_excel(FILE_PATH, sheet_name=city, engine='openpyxl')
        except Exception as e:
            return jsonify({"error": f"City sheet '{city}' not found or file error.", "details": str(e)}), 500

        broadcaster_cols = {}
        cols = df.columns
        for b in SELECTED_BROADCASTERS:
            plays_cols = [c for c in cols if b in c and '#Plays' in c]
            seconds_cols = [c for c in cols if b in c and '#Seconds' in c]
            if plays_cols or seconds_cols:
                broadcaster_cols[b] = {'plays': plays_cols, 'seconds': seconds_cols}

        origin_seconds = {}
        for b, d in broadcaster_cols.items():
            if d['seconds']:
                origin_seconds[b] = df[d['seconds']].sum().sum()
            elif d['plays']:
                origin_seconds[b] = df[d['plays']].sum().sum()

        if not origin_seconds:
            return jsonify({"error": "No matching broadcaster columns found"}), 404

        origin_series = pd.Series(origin_seconds)
        market_share = (origin_series / origin_series.sum() * 100).round(2)

        result = (
            market_share.reset_index()
            .rename(columns={'index': 'Broadcaster', 0: 'Market_Share_%'})
            .to_dict(orient='records')
        )

        return jsonify({"city": city, "market_share": result})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/market_share_by_advertiser', methods=['POST'])
def market_share_by_advertiser():
    try:
        data = request.get_json()
        city = data.get("city")

        if not city:
            return jsonify({"error": "city field is required"}), 400

        # Read sheet for given city
        try:
            df = pd.read_excel(FILE_PATH, sheet_name=city, engine='openpyxl')
        except Exception:
            return jsonify({"error": f"Sheet '{city}' not found in file {FILE_PATH}"}), 404

        selected_broadcasters = ['BIG FM', 'RADIO CITY', 'RADIO MIRCHI', 'RED FM', 'MY FM', 'FEVER']
        cols = df.columns

        # Map each broadcaster to its seconds column
        broadcaster_seconds_cols = {}
        for b in selected_broadcasters:
            for c in cols:
                if b in c and '#Seconds' in c:
                    broadcaster_seconds_cols[b] = c

        if not broadcaster_seconds_cols:
            return jsonify({"error": "No matching broadcaster #Seconds columns found"}), 400

        # Select only required columns
        use_cols = ['Brand Name'] + list(broadcaster_seconds_cols.values())
        avg_df = df[use_cols].copy()

        for c in broadcaster_seconds_cols.values():
            avg_df[c] = pd.to_numeric(avg_df[c], errors='coerce').fillna(0)

        avg_df['Total_Selected_Seconds'] = avg_df[list(broadcaster_seconds_cols.values())].sum(axis=1)

        # Keep only advertisers with non-zero seconds
        avg_df = avg_df[avg_df['Total_Selected_Seconds'] > 0]

        # Compute market share %
        for b, col in broadcaster_seconds_cols.items():
            avg_df[f"{b} Market_Share_%"] = (avg_df[col] / avg_df['Total_Selected_Seconds'] * 100).round(2)

        result_cols = ['Brand Name'] + [f"{b} Market_Share_%" for b in broadcaster_seconds_cols]
        result_df = avg_df[result_cols]

        return jsonify({
            "city": city,
            "market_share_by_advertiser": result_df.to_dict(orient="records"),
            "len": len(result_df.to_dict(orient="records"))
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/market_share_by_industry', methods=['POST'])
def market_share_by_industry():
    try:
        data = request.get_json()
        city = data.get('city')

        if not city:
            return jsonify({"error": "City name is required"}), 400

        # Load sheet by city
        df = pd.read_excel(FILE_PATH, sheet_name=city, engine="openpyxl")

        industry_col = "Category"

        if industry_col not in df.columns:
            return jsonify({"error": f"Column '{industry_col}' not found in sheet"}), 400

        selected_broadcasters = ['BIG FM', 'RADIO CITY', 'RADIO MIRCHI', 'RED FM', 'MY FM', 'FEVER']

        cols = df.columns
        broadcaster_seconds_cols = {}
        for b in selected_broadcasters:
            col = [c for c in cols if b in c and '#Seconds' in c]
            if col:
                broadcaster_seconds_cols[b] = col[0]

        # Keep only relevant columns
        req_cols = [industry_col] + list(broadcaster_seconds_cols.values())
        df = df[req_cols].copy()

        # Convert second columns to numeric
        for c in broadcaster_seconds_cols.values():
            df[c] = pd.to_numeric(df[c], errors='coerce').fillna(0)

        # Group → Sum seconds by industry
        grouped = df.groupby(industry_col).sum()

        # Compute total seconds across all broadcasters
        grouped['Total_Seconds'] = grouped.sum(axis=1)

        # Remove industries with no seconds
        grouped = grouped[grouped['Total_Seconds'] > 0]

        # Calculate Market Share %
        for b, col in broadcaster_seconds_cols.items():
            grouped[b + " Market_Share_%"] = (grouped[col] / grouped['Total_Seconds'] * 100).round(2)

        # Prepare response
        result = grouped.reset_index()[
            [industry_col] + [b + " Market_Share_%"
            for b in broadcaster_seconds_cols.keys()]
        ]

        return jsonify({
            "city": city,
            "record_count": len(result),
            "market_share_by_industry": result.to_dict(orient="records")
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/market_share_by_broadcaster', methods=['POST'])
def market_share_by_broadcaster():
    try:
        data = request.get_json()
        broadcaster = data.get('broadcaster')

        if not broadcaster:
            return jsonify({"error": "Broadcaster name is required"}), 400

        # Load ALL sheet names
        xls = pd.ExcelFile(FILE_PATH, engine="openpyxl")
        sheets = xls.sheet_names

        result = []

        for city in sheets:
            df = pd.read_excel(FILE_PATH, sheet_name=city, engine="openpyxl")
            cols = df.columns

            # Find seconds column for that broadcaster
            seconds_cols = [c for c in cols if broadcaster in c and '#Seconds' in c]
            if not seconds_cols:
                continue

            broadcaster_seconds_col = seconds_cols[0]

            # Convert to numeric
            df[broadcaster_seconds_col] = pd.to_numeric(df[broadcaster_seconds_col], errors='coerce').fillna(0)

            # Total city seconds across all broadcasters
            all_seconds_cols = [c for c in cols if '#Seconds' in c]
            df[all_seconds_cols] = df[all_seconds_cols].apply(pd.to_numeric, errors='coerce').fillna(0)

            total_city_seconds = df[all_seconds_cols].sum().sum()
            broadcaster_total_seconds = df[broadcaster_seconds_col].sum()

            if total_city_seconds == 0:
                continue

            market_share = round((broadcaster_total_seconds / total_city_seconds) * 100, 2)

            result.append({
                "city": city,
                "broadcaster": broadcaster,
                "broadcaster_seconds": broadcaster_total_seconds,
                "total_city_seconds": total_city_seconds,
                "market_share_%": market_share
            })

        return jsonify({
            "broadcaster": broadcaster,
            "city_count": len(result),
            "data": result
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/market_share_stacked_by_origin', methods=['GET'])
def market_share_stacked_by_origin():
    try:
        xls = pd.ExcelFile(FILE_PATH, engine="openpyxl")
        sheets = xls.sheet_names

        selected_broadcasters = ['BIG FM', 'RADIO CITY', 'RADIO MIRCHI', 'RED FM', 'MY FM', 'FEVER']

        final_data = []

        for city in sheets:
            df = pd.read_excel(FILE_PATH, sheet_name=city, engine="openpyxl")
            cols = df.columns

            # Identify ALL seconds columns (including broadcasters outside selected list)
            all_seconds_cols = [c for c in cols if '#Seconds' in c]
            if not all_seconds_cols:
                continue

            # Convert to numeric
            for col in all_seconds_cols:
                df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)

            # Total seconds across ALL broadcasters
            total_city_seconds = sum(df[col].sum() for col in all_seconds_cols)
            if total_city_seconds == 0:
                continue

            # Market share data for this city
            city_market_share = {"city": city}

            # Add % for selected broadcasters
            selected_total = 0
            for b in selected_broadcasters:
                col = next((c for c in all_seconds_cols if b in c), None)
                if col:
                    sec = df[col].sum()
                    pct = round((sec / total_city_seconds) * 100, 2)
                    city_market_share[b] = pct
                    selected_total += pct
                else:
                    city_market_share[b] = 0.0

            # Calculate "OTHERS"
            others_pct = round(100 - selected_total, 2)
            city_market_share["OTHERS"] = max(others_pct, 0)  # avoid -0.0

            final_data.append(city_market_share)

        return jsonify({
            "origin_count": len(final_data),
            "data": final_data
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500




if __name__ == '__main__':
    app.run(debug=True)
