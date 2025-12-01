# routes/upload_api.py
from flask import Blueprint, request, jsonify
from sqlalchemy import text
import pandas as pd
from database import raw_engine

upload_bp = Blueprint("upload_bp", __name__)

@upload_bp.post("/upload_market_data")
def upload_market_data():
    try:
        file = request.files.get("file")
        if not file:
            return jsonify({"error": "file is required"}), 400

        df = pd.read_csv(file) if file.filename.endswith(".csv") else pd.read_excel(file)

        # Required columns validation
        required_cols = [
            "Station", "Parent", "Brand Name", "Category", "Channel", "Channel Club",
            "Origin", "Bucket", "DAVP/Non DAVP", "Seconds", "Rate", "Outlay", "Consider",
            "A/B", "A/C", "Category Final", "Week", "Month"
        ]
        missing = [c for c in required_cols if c not in df.columns]
        if missing:
            return jsonify({"error": f"Missing columns in file: {missing}"}), 400

        sql = """
            INSERT INTO advertiser_broadcaster_stats (
                station, parent, brand_name, category, channel, channel_club,
                origin, bucket, davp_type, seconds, rate, outlay, consider,
                a_b, a_c, category_final, week, month, year
            )
            VALUES (
                :station, :parent, :brand_name, :category, :channel, :channel_club,
                :origin, :bucket, :davp_type, :seconds, :rate, :outlay, :consider,
                :a_b, :a_c, :category_final, :week, :month, :year
            )
        """

        inserted_count = 0

        with raw_engine.begin() as conn:
            for _, row in df.iterrows():

                # if inserted_count >= 50:
                #     break
                 
                origin_val = row.get("Origin")

                # Skip invalid Delete origin records
                if (not origin_val
                        or origin_val.strip() == ""
                        or origin_val.strip() == "Delete"
                        or origin_val.strip() == "Delete-Marketing"):
                    continue

                # Clean origin values like "Chennai - Delete" → "Chennai"
                origin = origin_val.replace(" - Delete", "").strip()

                seconds = 0 if pd.isna(row.get("Seconds")) else int(row.get("Seconds"))
                rate_val = row.get("Rate")
                rate = 0 if pd.isna(rate_val) else float(rate_val)
                month_raw = row.get("Month")
                month = month_raw.split("'")[0]
                outlay_val = row.get("Outlay")
                outlay = 0 if pd.isna(outlay_val) else float(outlay_val)
                year = 2000 + int(month_raw.split("'")[1])

                conn.execute(text(sql), {
                    "station": row.get("Station"),
                    "parent": row.get("Parent"),
                    "brand_name": row.get("Brand Name"),
                    "category": row.get("Category"),
                    "channel": row.get("Channel"),
                    "channel_club": row.get("Channel Club"),
                    "origin": origin,
                    "bucket": row.get("Bucket"),
                    "davp_type": row.get("DAVP/Non DAVP"),
                    "seconds": seconds,
                    "rate": rate,
                    "outlay": outlay,
                    "consider": row.get("Consider"),
                    "a_b": row.get("A/B"),
                    "a_c": row.get("A/C"),
                    "category_final": row.get("Category Final"),
                    "week": row.get("Week"),
                    "month": month,
                    "year": year,
                })

                inserted_count += 1

        return jsonify({
            "message": "Market data uploaded successfully 🚀",
            "inserted_records": inserted_count
        }), 200

    except Exception as e:
        print("❌ Error:", e)
        return jsonify({"error": str(e)}), 500
