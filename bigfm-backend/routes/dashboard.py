from flask import Blueprint, request, jsonify
from sqlalchemy import text
import pandas as pd
from database import  db


dashboard_bp = Blueprint("dashboard_bp", __name__)

@dashboard_bp.route('/getMissedclients', methods=['GET'])
def get_missed_clients():
    channel_club = request.args.get("channel_club")   # FEVER, MY FM, BIG FM ...
    station = request.args.get("station")
    month = request.args.get("month")
    year = request.args.get("year")
    week = request.args.get("week")

    # New flag → "missed" (0% share) OR "less20" (<20% share)
    filter_type = request.args.get("filter_type", "missed")

    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 10))

    if not channel_club:
        return jsonify({"error": "channel_club parameter required"}), 400

    filters = "WHERE 1=1"
    params = {}

    if station:
        filters += " AND station = :station"
        params["station"] = station

    if month:
        filters += " AND month = :month"
        params["month"] = month

    if year:
        filters += " AND year = :year"
        params["year"] = year

    if week:
        filters += " AND week = :week"
        params["week"] = week

    offset = (page - 1) * limit

    # 🔥 HAVING logic based on new flag
    if filter_type == "less20":
        having_condition = """
            SUM(CASE WHEN channel_club = :cl THEN seconds ELSE 0 END) > 0
        AND (
            SUM(CASE WHEN channel_club = :cl THEN seconds ELSE 0 END) * 100.0
            / SUM(seconds)
        ) < 20
        """
    else:   # missed by default (0% share)
        having_condition = f"""
            SUM(CASE WHEN channel_club = :cl THEN seconds ELSE 0 END) = 0
            AND SUM(seconds) > 0
        """

    sql = f"""
        SELECT
            station,
            parent,
            SUM(CASE WHEN channel_club = 'BIG FM' THEN seconds ELSE 0 END) AS BIG_FM,
            SUM(CASE WHEN channel_club = 'FEVER' THEN seconds ELSE 0 END) AS FEVER,
            SUM(CASE WHEN channel_club = 'MY FM' THEN seconds ELSE 0 END) AS MY_FM,
            SUM(CASE WHEN channel_club = 'RADIO CITY' THEN seconds ELSE 0 END) AS RADIO_CITY,
            SUM(CASE WHEN channel_club = 'RADIO MIRCHI' THEN seconds ELSE 0 END) AS RADIO_MIRCHI,
            SUM(CASE WHEN channel_club = 'RED FM' THEN seconds ELSE 0 END) AS RED_FM,
            SUM(CASE WHEN channel_club NOT IN (
                'BIG FM','FEVER','MY FM','RADIO CITY','RADIO MIRCHI','RED FM'
            ) THEN seconds ELSE 0 END) AS OTHERS,
            SUM(seconds) AS total_seconds
        FROM advertiser_broadcaster_stats
        {filters}
        GROUP BY station, parent
        HAVING {having_condition}
        ORDER BY station, parent
        LIMIT :limit OFFSET :offset;
    """

    params["limit"] = limit
    params["offset"] = offset
    params["cl"] = channel_club

    # Count query
    sql_count = f"""
        SELECT COUNT(*) AS total
        FROM (
            SELECT station, parent
            FROM advertiser_broadcaster_stats
            {filters}
            GROUP BY station, parent
            HAVING {having_condition}
        ) AS t;
    """

    engine = db._engine
    with engine.connect() as conn:
        rows = conn.execute(text(sql), params).mappings().all()
        total_records = conn.execute(text(sql_count), params).scalar()

    data = []
    for row in rows:
        total = float(row["total_seconds"]) if row["total_seconds"] else 0

        obj = {
            "station": row["station"],
            "parent": row["parent"],
            "BIG_FM": f"{round((float(row['BIG_FM']) / total) * 100)}%" if total else "0%",
            "FEVER": f"{round((float(row['FEVER']) / total) * 100)}%" if total else "0%",
            "MY_FM": f"{round((float(row['MY_FM']) / total) * 100)}%" if total else "0%",
            "RADIO_CITY": f"{round((float(row['RADIO_CITY']) / total) * 100)}%" if total else "0%",
            "RADIO_MIRCHI": f"{round((float(row['RADIO_MIRCHI']) / total) * 100)}%" if total else "0%",
            "RED_FM": f"{round((float(row['RED_FM']) / total) * 100)}%" if total else "0%",
            "OTHERS": f"{round((float(row['OTHERS']) / total) * 100)}%" if total else "0%",
            "total_seconds": total
        }
        data.append(obj)

    return jsonify({
        "page": page,
        "limit": limit,
        "total_records": total_records,
        "total_pages": (total_records + limit - 1) // limit,
        "records": data
    })


@dashboard_bp.route("/getBrandWiseMarketShare", methods=["GET"])
def get_brand_wise_market_share():
    origin = request.args.get("origin")
    category = request.args.get("category")
    parent = request.args.get("parent")
    brand_name = request.args.get("brand_name")
    bucket = request.args.get("bucket")
    station = request.args.get("station")
    month = request.args.get("month")
    year = request.args.get("year")
    week = request.args.get("week")

    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 20))
    offset = (page - 1) * limit

    filters = "WHERE 1=1"
    params = {}

    if origin:
        filters += " AND origin = :origin"
        params["origin"] = origin

    if category:
        filters += " AND category = :category"
        params["category"] = category

    if parent:
        filters += " AND parent = :parent"
        params["parent"] = parent

    if brand_name:
        filters += " AND brand_name = :brand_name"
        params["brand_name"] = brand_name

    if bucket:
        filters += " AND bucket = :bucket"
        params["bucket"] = bucket

    if station:
        filters += " AND station = :station"
        params["station"] = station

    if month:
        filters += " AND month = :month"
        params["month"] = month

    if year:
        filters += " AND year = :year"
        params["year"] = year

    if week:
        filters += " AND week = :week"
        params["week"] = week

    sql = f"""
        SELECT
            origin,
            category,
            parent,
            brand_name,
            bucket,
            station,
            SUM(CASE WHEN channel_club = 'BIG FM' THEN seconds ELSE 0 END) AS BIG_FM,
            SUM(CASE WHEN channel_club = 'FEVER' THEN seconds ELSE 0 END) AS FEVER,
            SUM(CASE WHEN channel_club = 'MY FM' THEN seconds ELSE 0 END) AS MY_FM,
            SUM(CASE WHEN channel_club = 'RADIO CITY' THEN seconds ELSE 0 END) AS RADIO_CITY,
            SUM(CASE WHEN channel_club = 'RADIO MIRCHI' THEN seconds ELSE 0 END) AS RADIO_MIRCHI,
            SUM(CASE WHEN channel_club = 'RED FM' THEN seconds ELSE 0 END) AS RED_FM,
            SUM(CASE WHEN channel_club NOT IN ('BIG FM','FEVER','MY FM','RADIO CITY','RADIO MIRCHI','RED FM')
                THEN seconds ELSE 0 END) AS OTHERS,
            SUM(seconds) AS total_seconds
        FROM advertiser_broadcaster_stats
        {filters}
        GROUP BY origin, category, parent, brand_name, bucket, station
        ORDER BY origin, category, parent, brand_name, bucket, station
        LIMIT :limit OFFSET :offset
    """

    sql_count = f"""
        SELECT COUNT(*) FROM (
            SELECT 1
            FROM advertiser_broadcaster_stats
            {filters}
            GROUP BY origin, category, parent, brand_name, bucket, station
        ) AS t
    """

    params["limit"] = limit
    params["offset"] = offset

    engine = db._engine
    with engine.connect() as conn:
        rows = conn.execute(text(sql), params).mappings().all()
        total_records = conn.execute(text(sql_count), params).scalar()

    results = []
    for r in rows:
        BIG_FM = float(r["BIG_FM"] or 0)
        FEVER = float(r["FEVER"] or 0)
        MY_FM = float(r["MY_FM"] or 0)
        OTHERS = float(r["OTHERS"] or 0)
        RADIO_CITY = float(r["RADIO_CITY"] or 0)
        RADIO_MIRCHI = float(r["RADIO_MIRCHI"] or 0)
        RED_FM = float(r["RED_FM"] or 0)
        total = BIG_FM + FEVER + MY_FM + OTHERS + RADIO_CITY + RADIO_MIRCHI + RED_FM

        results.append({
    "Origin": r["origin"],
    "Category": r["category"],
    "Parent": r["parent"],
    "Brand Name": r["brand_name"],
    "Bucket": r["bucket"],
    "Station": r["station"],
    "BIG FM Total": BIG_FM,
    "FEVER": FEVER,
    "MY FM": MY_FM,
    "Others": OTHERS,
    "RADIO CITY": RADIO_CITY,
    "RADIO MIRCHI": RADIO_MIRCHI,
    "RED FM": RED_FM,
    "Total": total,
    "BIG FM": f"{round(BIG_FM / total * 100)}%" if total else "0%",
    "FEVER": f"{round(FEVER / total * 100)}%" if total else "0%",
    "MY FM": f"{round(MY_FM / total * 100)}%" if total else "0%",
    "Others": f"{round(OTHERS / total * 100)}%" if total else "0%",
    "RADIO CITY": f"{round(RADIO_CITY / total * 100)}%" if total else "0%",
    "RADIO MIRCHI": f"{round(RADIO_MIRCHI / total * 100)}%" if total else "0%",
    "RED FM": f"{round(RED_FM / total * 100)}%" if total else "0%",
})


    return jsonify({
        "page": page,
        "limit": limit,
        "total_records": total_records,
        "total_pages": (total_records + limit - 1) // limit,
        "records": results
    })

@dashboard_bp.route("/getOriginWiseMarketShare", methods=["GET"])
def get_origin_wise_market_share():
    # Optional filters
    category = request.args.get("category")
    parent = request.args.get("parent")
    brand_name = request.args.get("brand_name")
    bucket = request.args.get("bucket")
    station = request.args.get("station")
    month = request.args.get("month")
    year = request.args.get("year")
    week = request.args.get("week")

    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 20))
    offset = (page - 1) * limit

    filters = "WHERE 1=1"
    params = {}

    if category:
        filters += " AND category = :category"
        params["category"] = category

    if parent:
        filters += " AND parent = :parent"
        params["parent"] = parent

    if brand_name:
        filters += " AND brand_name = :brand_name"
        params["brand_name"] = brand_name

    if bucket:
        filters += " AND bucket = :bucket"
        params["bucket"] = bucket

    if station:
        filters += " AND station = :station"
        params["station"] = station

    if month:
        filters += " AND month = :month"
        params["month"] = month

    if year:
        filters += " AND year = :year"
        params["year"] = year

    if week:
        filters += " AND week = :week"
        params["week"] = week

    sql = f"""
        SELECT
            origin,
            SUM(CASE WHEN channel_club = 'BIG FM' THEN seconds ELSE 0 END) AS BIG_FM,
            SUM(CASE WHEN channel_club = 'FEVER' THEN seconds ELSE 0 END) AS FEVER,
            SUM(CASE WHEN channel_club = 'MY FM' THEN seconds ELSE 0 END) AS MY_FM,
            SUM(CASE WHEN channel_club = 'RADIO CITY' THEN seconds ELSE 0 END) AS RADIO_CITY,
            SUM(CASE WHEN channel_club = 'RADIO MIRCHI' THEN seconds ELSE 0 END) AS RADIO_MIRCHI,
            SUM(CASE WHEN channel_club = 'RED FM' THEN seconds ELSE 0 END) AS RED_FM,
            SUM(CASE WHEN channel_club NOT IN ('BIG FM','FEVER','MY FM','RADIO CITY','RADIO MIRCHI','RED FM')
                THEN seconds ELSE 0 END) AS OTHERS,
            SUM(seconds) AS total_seconds
        FROM advertiser_broadcaster_stats
        {filters}
        GROUP BY origin
        ORDER BY origin
        LIMIT :limit OFFSET :offset
    """

    sql_count = f"""
        SELECT COUNT(*) FROM (
            SELECT 1
            FROM advertiser_broadcaster_stats
            {filters}
            GROUP BY origin
        ) AS t
    """

    params["limit"] = limit
    params["offset"] = offset

    engine = db._engine
    with engine.connect() as conn:
        rows = conn.execute(text(sql), params).mappings().all()
        total_records = conn.execute(text(sql_count), params).scalar()

    results = []
    for r in rows:
        BIG_FM = float(r["BIG_FM"] or 0)
        FEVER = float(r["FEVER"] or 0)
        MY_FM = float(r["MY_FM"] or 0)
        OTHERS = float(r["OTHERS"] or 0)
        RADIO_CITY = float(r["RADIO_CITY"] or 0)
        RADIO_MIRCHI = float(r["RADIO_MIRCHI"] or 0)
        RED_FM = float(r["RED_FM"] or 0)

        total = BIG_FM + FEVER + MY_FM + OTHERS + RADIO_CITY + RADIO_MIRCHI + RED_FM

        results.append({
            "Origin": r["origin"],
            "BIG FM Total": BIG_FM,
            "FEVER Total": FEVER,
            "MY FM Total": MY_FM,
            "Others Total": OTHERS,
            "RADIO CITY Total": RADIO_CITY,
            "RADIO MIRCHI Total": RADIO_MIRCHI,
            "RED FM Total": RED_FM,
            "Total": total,
            "BIG FM": f"{round(BIG_FM / total * 100)}%" if total else "0%",
            "FEVER": f"{round(FEVER / total * 100)}%" if total else "0%",
            "MY FM": f"{round(MY_FM / total * 100)}%" if total else "0%",
            "Others": f"{round(OTHERS / total * 100)}%" if total else "0%",
            "RADIO CITY": f"{round(RADIO_CITY / total * 100)}%" if total else "0%",
            "RADIO MIRCHI": f"{round(RADIO_MIRCHI / total * 100)}%" if total else "0%",
            "RED FM": f"{round(RED_FM / total * 100)}%" if total else "0%",
        })

    return jsonify({
        "page": page,
        "limit": limit,
        "total_records": total_records,
        "total_pages": (total_records + limit - 1) // limit,
        "records": results
    })



@dashboard_bp.route("/getOriginBucketWiseMarketShare", methods=["GET"])
def get_origin_bucket_wise_market_share():
    # Optional filters
    origin = request.args.get("origin")
    category = request.args.get("category")
    parent = request.args.get("parent")
    brand_name = request.args.get("brand_name")
    station = request.args.get("station")
    month = request.args.get("month")
    year = request.args.get("year")
    week = request.args.get("week")

    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 20))
    offset = (page - 1) * limit

    filters = "WHERE 1=1"
    params = {}

    if origin:
        filters += " AND origin = :origin"
        params["origin"] = origin

    if category:
        filters += " AND category = :category"
        params["category"] = category

    if parent:
        filters += " AND parent = :parent"
        params["parent"] = parent

    if brand_name:
        filters += " AND brand_name = :brand_name"
        params["brand_name"] = brand_name

    if station:
        filters += " AND station = :station"
        params["station"] = station

    if month:
        filters += " AND month = :month"
        params["month"] = month

    if year:
        filters += " AND year = :year"
        params["year"] = year

    if week:
        filters += " AND week = :week"
        params["week"] = week

    sql = f"""
        SELECT
            origin,
            bucket,
            SUM(CASE WHEN channel_club = 'BIG FM' THEN seconds ELSE 0 END) AS BIG_FM,
            SUM(CASE WHEN channel_club = 'FEVER' THEN seconds ELSE 0 END) AS FEVER,
            SUM(CASE WHEN channel_club = 'MY FM' THEN seconds ELSE 0 END) AS MY_FM,
            SUM(CASE WHEN channel_club = 'RADIO CITY' THEN seconds ELSE 0 END) AS RADIO_CITY,
            SUM(CASE WHEN channel_club = 'RADIO MIRCHI' THEN seconds ELSE 0 END) AS RADIO_MIRCHI,
            SUM(CASE WHEN channel_club = 'RED FM' THEN seconds ELSE 0 END) AS RED_FM,
            SUM(CASE WHEN channel_club NOT IN ('BIG FM','FEVER','MY FM','RADIO CITY','RADIO MIRCHI','RED FM')
                THEN seconds ELSE 0 END) AS OTHERS,
            SUM(seconds) AS total_seconds
        FROM advertiser_broadcaster_stats
        {filters}
        GROUP BY origin, bucket
        ORDER BY origin, bucket
        LIMIT :limit OFFSET :offset
    """

    sql_count = f"""
        SELECT COUNT(*) FROM (
            SELECT 1
            FROM advertiser_broadcaster_stats
            {filters}
            GROUP BY origin, bucket
        ) AS t
    """

    params["limit"] = limit
    params["offset"] = offset

    engine = db._engine
    with engine.connect() as conn:
        rows = conn.execute(text(sql), params).mappings().all()
        total_records = conn.execute(text(sql_count), params).scalar()

    results = []
    for r in rows:
        BIG_FM = float(r["BIG_FM"] or 0)
        FEVER = float(r["FEVER"] or 0)
        MY_FM = float(r["MY_FM"] or 0)
        OTHERS = float(r["OTHERS"] or 0)
        RADIO_CITY = float(r["RADIO_CITY"] or 0)
        RADIO_MIRCHI = float(r["RADIO_MIRCHI"] or 0)
        RED_FM = float(r["RED_FM"] or 0)

        total = BIG_FM + FEVER + MY_FM + OTHERS + RADIO_CITY + RADIO_MIRCHI + RED_FM

        results.append({
            "Origin": r["origin"],
            "Bucket": r["bucket"],
            "BIG FM": BIG_FM,
            "FEVER": FEVER,
            "MY FM": MY_FM,
            "Others": OTHERS,
            "RADIO CITY": RADIO_CITY,
            "RADIO MIRCHI": RADIO_MIRCHI,
            "RED FM": RED_FM,
            "Total": total,
            "BIG FM%": f"{round(BIG_FM / total * 100)}%" if total else "0%",
            "FEVER%": f"{round(FEVER / total * 100)}%" if total else "0%",
            "MY FM%": f"{round(MY_FM / total * 100)}%" if total else "0%",
            "Others%": f"{round(OTHERS / total * 100)}%" if total else "0%",
            "RADIO CITY%": f"{round(RADIO_CITY / total * 100)}%" if total else "0%",
            "RADIO MIRCHI%": f"{round(RADIO_MIRCHI / total * 100)}%" if total else "0%",
            "RED FM%": f"{round(RED_FM / total * 100)}%" if total else "0%",
        })

    return jsonify({
        "page": page,
        "limit": limit,
        "total_records": total_records,
        "total_pages": (total_records + limit - 1) // limit,
        "records": results
    })



@dashboard_bp.route("/getOriginParentWiseMarketShare", methods=["GET"])
def get_origin_parent_wise_market_share():
    # Optional filters
    origin = request.args.get("origin")
    category = request.args.get("category")
    brand_name = request.args.get("brand_name")
    bucket = request.args.get("bucket")
    station = request.args.get("station")
    month = request.args.get("month")
    year = request.args.get("year")
    week = request.args.get("week")

    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 20))
    offset = (page - 1) * limit

    filters = "WHERE 1=1"
    params = {}

    if origin:
        filters += " AND origin = :origin"
        params["origin"] = origin

    if category:
        filters += " AND category = :category"
        params["category"] = category

    if brand_name:
        filters += " AND brand_name = :brand_name"
        params["brand_name"] = brand_name

    if bucket:
        filters += " AND bucket = :bucket"
        params["bucket"] = bucket

    if station:
        filters += " AND station = :station"
        params["station"] = station

    if month:
        filters += " AND month = :month"
        params["month"] = month

    if year:
        filters += " AND year = :year"
        params["year"] = year

    if week:
        filters += " AND week = :week"
        params["week"] = week

    sql = f"""
        SELECT
            origin,
            parent,
            SUM(CASE WHEN channel_club = 'BIG FM' THEN seconds ELSE 0 END) AS BIG_FM,
            SUM(CASE WHEN channel_club = 'FEVER' THEN seconds ELSE 0 END) AS FEVER,
            SUM(CASE WHEN channel_club = 'MY FM' THEN seconds ELSE 0 END) AS MY_FM,
            SUM(CASE WHEN channel_club = 'RADIO CITY' THEN seconds ELSE 0 END) AS RADIO_CITY,
            SUM(CASE WHEN channel_club = 'RADIO MIRCHI' THEN seconds ELSE 0 END) AS RADIO_MIRCHI,
            SUM(CASE WHEN channel_club = 'RED FM' THEN seconds ELSE 0 END) AS RED_FM,
            SUM(CASE WHEN channel_club NOT IN ('BIG FM','FEVER','MY FM','RADIO CITY','RADIO MIRCHI','RED FM')
                THEN seconds ELSE 0 END) AS OTHERS,
            SUM(seconds) AS total_seconds
        FROM advertiser_broadcaster_stats
        {filters}
        GROUP BY origin, parent
        ORDER BY origin, parent
        LIMIT :limit OFFSET :offset
    """

    sql_count = f"""
        SELECT COUNT(*) FROM (
            SELECT 1
            FROM advertiser_broadcaster_stats
            {filters}
            GROUP BY origin, parent
        ) AS t
    """

    params["limit"] = limit
    params["offset"] = offset

    engine = db._engine
    with engine.connect() as conn:
        rows = conn.execute(text(sql), params).mappings().all()
        total_records = conn.execute(text(sql_count), params).scalar()

    results = []
    for r in rows:
        BIG_FM = float(r["BIG_FM"] or 0)
        FEVER = float(r["FEVER"] or 0)
        MY_FM = float(r["MY_FM"] or 0)
        OTHERS = float(r["OTHERS"] or 0)
        RADIO_CITY = float(r["RADIO_CITY"] or 0)
        RADIO_MIRCHI = float(r["RADIO_MIRCHI"] or 0)
        RED_FM = float(r["RED_FM"] or 0)

        total = BIG_FM + FEVER + MY_FM + OTHERS + RADIO_CITY + RADIO_MIRCHI + RED_FM

        results.append({
            "Origin": r["origin"],
            "Parent": r["parent"],
            "BIG FM": BIG_FM,
            "FEVER": FEVER,
            "MY FM": MY_FM,
            "Others": OTHERS,
            "RADIO CITY": RADIO_CITY,
            "RADIO MIRCHI": RADIO_MIRCHI,
            "RED FM": RED_FM,
            "Secondages": total,
            "BIG FM%": f"{round(BIG_FM / total * 100)}%" if total else "0%",
            "FEVER%": f"{round(FEVER / total * 100)}%" if total else "0%",
            "MY FM%": f"{round(MY_FM / total * 100)}%" if total else "0%",
            "Others%": f"{round(OTHERS / total * 100)}%" if total else "0%",
            "RADIO CITY%": f"{round(RADIO_CITY / total * 100)}%" if total else "0%",
            "RADIO MIRCHI%": f"{round(RADIO_MIRCHI / total * 100)}%" if total else "0%",
            "RED FM%": f"{round(RED_FM / total * 100)}%" if total else "0%",
        })

    return jsonify({
        "page": page,
        "limit": limit,
        "total_records": total_records,
        "total_pages": (total_records + limit - 1) // limit,
        "records": results
    })



@dashboard_bp.route("/getCategoryWiseMarketShare", methods=["GET"])
def get_category_wise_market_share():
    # Optional filters
    origin = request.args.get("origin")
    parent = request.args.get("parent")
    brand_name = request.args.get("brand_name")
    bucket = request.args.get("bucket")
    station = request.args.get("station")
    month = request.args.get("month")
    year = request.args.get("year")
    week = request.args.get("week")

    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 20))
    offset = (page - 1) * limit

    filters = "WHERE 1=1"
    params = {}

    if origin:
        filters += " AND origin = :origin"
        params["origin"] = origin

    if parent:
        filters += " AND parent = :parent"
        params["parent"] = parent

    if brand_name:
        filters += " AND brand_name = :brand_name"
        params["brand_name"] = brand_name

    if bucket:
        filters += " AND bucket = :bucket"
        params["bucket"] = bucket

    if station:
        filters += " AND station = :station"
        params["station"] = station

    if month:
        filters += " AND month = :month"
        params["month"] = month

    if year:
        filters += " AND year = :year"
        params["year"] = year

    if week:
        filters += " AND week = :week"
        params["week"] = week

    sql = f"""
        SELECT
            category_final,
            SUM(CASE WHEN channel_club = 'BIG FM' THEN seconds ELSE 0 END) AS BIG_FM,
            SUM(CASE WHEN channel_club = 'FEVER' THEN seconds ELSE 0 END) AS FEVER,
            SUM(CASE WHEN channel_club = 'MY FM' THEN seconds ELSE 0 END) AS MY_FM,
            SUM(CASE WHEN channel_club = 'RADIO CITY' THEN seconds ELSE 0 END) AS RADIO_CITY,
            SUM(CASE WHEN channel_club = 'RADIO MIRCHI' THEN seconds ELSE 0 END) AS RADIO_MIRCHI,
            SUM(CASE WHEN channel_club = 'RED FM' THEN seconds ELSE 0 END) AS RED_FM,
            SUM(CASE WHEN channel_club NOT IN ('BIG FM','FEVER','MY FM','RADIO CITY','RADIO MIRCHI','RED FM')
                THEN seconds ELSE 0 END) AS OTHERS,
            SUM(seconds) AS total_seconds
        FROM advertiser_broadcaster_stats
        {filters}
        GROUP BY category_final
        ORDER BY category_final
        LIMIT :limit OFFSET :offset
    """

    sql_count = f"""
        SELECT COUNT(*) FROM (
            SELECT 1
            FROM advertiser_broadcaster_stats
            {filters}
            GROUP BY category_final
        ) AS t
    """

    params["limit"] = limit
    params["offset"] = offset

    engine = db._engine
    with engine.connect() as conn:
        rows = conn.execute(text(sql), params).mappings().all()
        total_records = conn.execute(text(sql_count), params).scalar()

    results = []
    for r in rows:
        BIG_FM = float(r["BIG_FM"] or 0)
        FEVER = float(r["FEVER"] or 0)
        MY_FM = float(r["MY_FM"] or 0)
        OTHERS = float(r["OTHERS"] or 0)
        RADIO_CITY = float(r["RADIO_CITY"] or 0)
        RADIO_MIRCHI = float(r["RADIO_MIRCHI"] or 0)
        RED_FM = float(r["RED_FM"] or 0)

        total = BIG_FM + FEVER + MY_FM + OTHERS + RADIO_CITY + RADIO_MIRCHI + RED_FM

        results.append({
            "Category": r["category_final"],
            "BIG FM": BIG_FM,
            "FEVER": FEVER,
            "MY FM": MY_FM,
            "Others": OTHERS,
            "RADIO CITY": RADIO_CITY,
            "RADIO MIRCHI": RADIO_MIRCHI,
            "RED FM": RED_FM,
            "Total Secondages": total,
            "BIG FM%": f"{round(BIG_FM / total * 100)}%" if total else "0%",
            "FEVER%": f"{round(FEVER / total * 100)}%" if total else "0%",
            "MY FM%": f"{round(MY_FM / total * 100)}%" if total else "0%",
            "Others%": f"{round(OTHERS / total * 100)}%" if total else "0%",
            "RADIO CITY%": f"{round(RADIO_CITY / total * 100)}%" if total else "0%",
            "RADIO MIRCHI%": f"{round(RADIO_MIRCHI / total * 100)}%" if total else "0%",
            "RED FM%": f"{round(RED_FM / total * 100)}%" if total else "0%",
        })

    return jsonify({
        "page": page,
        "limit": limit,
        "total_records": total_records,
        "total_pages": (total_records + limit - 1) // limit,
        "records": results
    })


@dashboard_bp.route("/getStationWiseMarketShare", methods=["GET"])
def get_station_wise_market_share():
    # Optional filters
    origin = request.args.get("origin")
    parent = request.args.get("parent")
    brand_name = request.args.get("brand_name")
    category_final = request.args.get("category_final")
    bucket = request.args.get("bucket")
    month = request.args.get("month")
    year = request.args.get("year")
    week = request.args.get("week")

    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 20))
    offset = (page - 1) * limit

    filters = "WHERE 1=1"
    params = {}

    if origin:
        filters += " AND origin = :origin"
        params["origin"] = origin

    if parent:
        filters += " AND parent = :parent"
        params["parent"] = parent

    if brand_name:
        filters += " AND brand_name = :brand_name"
        params["brand_name"] = brand_name

    if category_final:
        filters += " AND category_final = :category_final"
        params["category_final"] = category_final

    if bucket:
        filters += " AND bucket = :bucket"
        params["bucket"] = bucket

    if month:
        filters += " AND month = :month"
        params["month"] = month

    if year:
        filters += " AND year = :year"
        params["year"] = year

    if week:
        filters += " AND week = :week"
        params["week"] = week

    sql = f"""
        SELECT
            station,
            SUM(CASE WHEN channel_club = 'BIG FM' THEN seconds ELSE 0 END) AS BIG_FM,
            SUM(CASE WHEN channel_club = 'FEVER' THEN seconds ELSE 0 END) AS FEVER,
            SUM(CASE WHEN channel_club = 'MY FM' THEN seconds ELSE 0 END) AS MY_FM,
            SUM(CASE WHEN channel_club = 'RADIO CITY' THEN seconds ELSE 0 END) AS RADIO_CITY,
            SUM(CASE WHEN channel_club = 'RADIO MIRCHI' THEN seconds ELSE 0 END) AS RADIO_MIRCHI,
            SUM(CASE WHEN channel_club = 'RED FM' THEN seconds ELSE 0 END) AS RED_FM,
            SUM(CASE WHEN channel_club NOT IN ('BIG FM','FEVER','MY FM','RADIO CITY','RADIO MIRCHI','RED FM')
                THEN seconds ELSE 0 END) AS OTHERS,
            SUM(seconds) AS total_seconds
        FROM advertiser_broadcaster_stats
        {filters}
        GROUP BY station
        ORDER BY station
        LIMIT :limit OFFSET :offset
    """

    sql_count = f"""
        SELECT COUNT(*) FROM (
            SELECT 1
            FROM advertiser_broadcaster_stats
            {filters}
            GROUP BY station
        ) AS t
    """

    params["limit"] = limit
    params["offset"] = offset

    engine = db._engine
    with engine.connect() as conn:
        rows = conn.execute(text(sql), params).mappings().all()
        total_records = conn.execute(text(sql_count), params).scalar()

    results = []
    for r in rows:
        BIG_FM = float(r["BIG_FM"] or 0)
        FEVER = float(r["FEVER"] or 0)
        MY_FM = float(r["MY_FM"] or 0)
        OTHERS = float(r["OTHERS"] or 0)
        RADIO_CITY = float(r["RADIO_CITY"] or 0)
        RADIO_MIRCHI = float(r["RADIO_MIRCHI"] or 0)
        RED_FM = float(r["RED_FM"] or 0)

        total = BIG_FM + FEVER + MY_FM + OTHERS + RADIO_CITY + RADIO_MIRCHI + RED_FM

        results.append({
            "Station": r["station"],
            "BIG FM": BIG_FM,
            "FEVER": FEVER,
            "MY FM": MY_FM,
            "Others": OTHERS,
            "RADIO CITY": RADIO_CITY,
            "RADIO MIRCHI": RADIO_MIRCHI,
            "RED FM": RED_FM,
            "Total Secondages": total,
            "BIG FM%": f"{round(BIG_FM / total * 100)}%" if total else "0%",
            "FEVER%": f"{round(FEVER / total * 100)}%" if total else "0%",
            "MY FM%": f"{round(MY_FM / total * 100)}%" if total else "0%",
            "Others%": f"{round(OTHERS / total * 100)}%" if total else "0%",
            "RADIO CITY%": f"{round(RADIO_CITY / total * 100)}%" if total else "0%",
            "RADIO MIRCHI%": f"{round(RADIO_MIRCHI / total * 100)}%" if total else "0%",
            "RED FM%": f"{round(RED_FM / total * 100)}%" if total else "0%",
        })

    return jsonify({
        "page": page,
        "limit": limit,
        "total_records": total_records,
        "total_pages": (total_records + limit - 1) // limit,
        "records": results
    })



@dashboard_bp.route("/getDashboardSummary", methods=["GET"])
def get_dashboard_summary():
    origin = request.args.get("origin")
    month = request.args.get("month")
    year = request.args.get("year")
    week = request.args.get("week")

    filters = "WHERE 1=1"
    params = {}

    if origin:
        filters += " AND origin = :origin"
        params["origin"] = origin
    if month:
        filters += " AND month = :month"
        params["month"] = month
    if year:
        filters += " AND year = :year"
        params["year"] = year
    if week:
        filters += " AND week = :week"
        params["week"] = week

    engine = db._engine
    with engine.connect() as conn:

        # 1️⃣ TOTAL SECONDS FOR EACH CHANNEL
        sql_total = f"""
            SELECT 
                SUM(CASE WHEN channel_club = 'BIG FM' THEN seconds ELSE 0 END) AS BIG_FM,
                SUM(CASE WHEN channel_club = 'FEVER' THEN seconds ELSE 0 END) AS FEVER,
                SUM(CASE WHEN channel_club = 'MY FM' THEN seconds ELSE 0 END) AS MY_FM,
                SUM(CASE WHEN channel_club = 'RADIO CITY' THEN seconds ELSE 0 END) AS RADIO_CITY,
                SUM(CASE WHEN channel_club = 'RADIO MIRCHI' THEN seconds ELSE 0 END) AS RADIO_MIRCHI,
                SUM(CASE WHEN channel_club = 'RED FM' THEN seconds ELSE 0 END) AS RED_FM,
                SUM(CASE WHEN channel_club NOT IN ('BIG FM','FEVER','MY FM','RADIO CITY','RADIO MIRCHI','RED FM')
                    THEN seconds ELSE 0 END) AS OTHERS
            FROM advertiser_broadcaster_stats
            {filters}
        """
        totals = conn.execute(text(sql_total), params).mappings().first()

        # Convert all to floats to avoid Decimal crash
        totals = {k: float(v or 0) for k, v in totals.items()}

        total_seconds_all = sum(totals.values())
        bigfm_seconds = totals["BIG_FM"]
        bigfm_percent = round((bigfm_seconds / total_seconds_all) * 100, 2) if total_seconds_all else 0

        # 2️⃣ MISSED 100% CLIENTS (BIG FM share = 0)
        sql_missed = f"""
            SELECT parent, SUM(seconds) AS total_sec
            FROM advertiser_broadcaster_stats
            {filters}
            GROUP BY parent
            HAVING SUM(CASE WHEN channel_club = 'BIG FM' THEN seconds ELSE 0 END) = 0
        """
        missed_rows = conn.execute(text(sql_missed), params).mappings().all()
        total_missed_clients = len(missed_rows)
        missed_seconds_total = sum(float(r["total_sec"]) for r in missed_rows)

        # 3️⃣ TOP 5 MISSED REGIONS BY STATION
        sql_top_regions = f"""
            SELECT station, SUM(seconds) AS missed_sec
            FROM advertiser_broadcaster_stats
            {filters}
            GROUP BY station
            HAVING SUM(CASE WHEN channel_club = 'BIG FM' THEN seconds ELSE 0 END) = 0
            ORDER BY missed_sec DESC
            LIMIT 5
        """
        top_regions = conn.execute(text(sql_top_regions), params).mappings().all()

    # Prepare channel-wise marketshare for frontend
    market_share = []
    for ch, sec in totals.items():
        pct = round((sec / total_seconds_all) * 100, 2) if total_seconds_all else 0
        market_share.append({"channel": ch, "seconds": sec, "percent": pct})

    return jsonify({
        "BIGFM_SUMMARY": {
            "seconds": bigfm_seconds,
            "percent": bigfm_percent
        },
        "MISSED_100_CLIENTS": {
            "missed_client_count": total_missed_clients,
            "missed_client_seconds": missed_seconds_total
        },
        "TOTAL_MARKET_SHARE_BY_CHANNEL": market_share,
        "TOP_5_MISSED_REGIONS": [
            {"station": r["station"], "missed_seconds": float(r["missed_sec"])}
            for r in top_regions
        ]
    })


@dashboard_bp.route('/getUpsellOpportunities', methods=['GET'])
def get_upsell_opportunities():
    filter_type = request.args.get('type', 'category')  # category, station, or brand
    limit = int(request.args.get('limit', 5))
    
    base_sql = f"""
        WITH market_share AS (
            SELECT
                {filter_type},
                SUM(CASE WHEN channel_club = 'BIG FM' THEN seconds ELSE 0 END) AS bigfm_seconds,
                SUM(seconds) AS total_seconds
            FROM advertiser_broadcaster_stats
            WHERE {filter_type} IS NOT NULL
            GROUP BY {filter_type}
            HAVING SUM(seconds) > 0
        )
        SELECT
            {filter_type} AS name,
            ROUND((bigfm_seconds * 100.0) / NULLIF(total_seconds, 0), 2) AS market_share,
            total_seconds,
            (total_seconds - bigfm_seconds) AS missing_seconds
        FROM market_share
        WHERE (bigfm_seconds * 100.0) / NULLIF(total_seconds, 0) < 20
        ORDER BY missing_seconds DESC
        LIMIT :limit
    """

    engine = db._engine
    with engine.connect() as conn:
        result = conn.execute(text(base_sql), {'limit': limit})
        opportunities = [dict(row) for row in result.mappings()]
    
    return jsonify({
        'filter_type': filter_type,
        'opportunities': opportunities
    })


@dashboard_bp.route("/getCategoryWiseBigFMShare", methods=["GET"])
def get_category_wise_bigfm_share():
    # Optional filters
    origin = request.args.get("origin")
    parent = request.args.get("parent")
    brand_name = request.args.get("brand_name")
    bucket = request.args.get("bucket")
    station = request.args.get("station")
    month = request.args.get("month")
    year = request.args.get("year")
    week = request.args.get("week")

    filters = "WHERE 1=1"
    params = {}

    if origin:
        filters += " AND origin = :origin"
        params["origin"] = origin
    if parent:
        filters += " AND parent = :parent"
        params["parent"] = parent
    if brand_name:
        filters += " AND brand_name = :brand_name"
        params["brand_name"] = brand_name
    if bucket:
        filters += " AND bucket = :bucket"
        params["bucket"] = bucket
    if station:
        filters += " AND station = :station"
        params["station"] = station
    if month:
        filters += " AND month = :month"
        params["month"] = month
    if year:
        filters += " AND year = :year"
        params["year"] = year
    if week:
        filters += " AND week = :week"
        params["week"] = week

    sql = f"""
        SELECT
            category_final,
            SUM(CASE WHEN channel_club = 'BIG FM' THEN seconds ELSE 0 END) AS bigfm_seconds,
            SUM(seconds) AS total_seconds
        FROM advertiser_broadcaster_stats
        {filters}
        GROUP BY category_final
        HAVING SUM(seconds) > 0
        ORDER BY total_seconds DESC
    """

    engine = db._engine
    with engine.connect() as conn:
        rows = conn.execute(text(sql), params).mappings().all()

    results = []
    for r in rows:
        bf = float(r["bigfm_seconds"] or 0)
        total = float(r["total_seconds"] or 0)
        share = (bf / total * 100) if total else 0

        results.append({
            "Category": r["category_final"],
            "Seconds": bf,
            "MarketShare": round(share, 2)
        })

    return jsonify({"records": results})
