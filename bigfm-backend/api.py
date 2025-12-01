# from flask import Flask, request, jsonify, send_file
# from dotenv import load_dotenv
# from langchain_core.messages import AIMessage, HumanMessage
# from langchain_openai import ChatOpenAI
# from langchain_community.utilities import SQLDatabase
# import os
# from sqlalchemy import create_engine, text
# from flask_cors import CORS
# from openai import OpenAI
# import tempfile
# import base64
# import json
# from pydantic import BaseModel, Field
# from typing import List, Optional
# import pandas as pd
# from decimal import Decimal

# class SQLModel(BaseModel):
#     sql: str = Field(description="Generated SQL query")
#     isChartNeeded: bool = Field(description="Whether user wants a chart")

# class ChartDataset(BaseModel):
#     label: str
#     data: List[float]
#     color: str

# class ChartResponse(BaseModel):
#     chart_type: str
#     labels: List[str]
#     values: Optional[List[float]] = None
#     datasets: Optional[List[ChartDataset]] = None
#     colors: Optional[List[str]] = None
#     title: str
#     hole: Optional[float] = None
#     options: Optional[dict] = None
#     x_axis_label: Optional[str] = None
#     y_axis_label: Optional[str] = None
#     legend_position: Optional[str] = None 
#     z: Optional[List[List[float]]] = None
#     x: Optional[List[str]] = None
#     y: Optional[List[str]] = None

# load_dotenv()
# app = Flask(__name__)
# CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
# client = OpenAI()

# # ---------------------------------------------------------------
# # DB ENGINE
# # ---------------------------------------------------------------

# raw_engine = create_engine(
#     f"mysql+mysqlconnector://root:your_new_password@localhost:3306/bigfm",
#     pool_pre_ping=True,
# )



# def save_chat(userid, role, message=None, response=None, audio_blob=None):
#     try:
#         query = text(
#             """
#             INSERT INTO chat_history (userid, role, message, audio, response)
#             VALUES (:userid, :role, :message, :audio, :response)
#         """
#         )
#         with raw_engine.begin() as conn:
#             conn.execute(
#                 query,
#                 {
#                     "userid": userid,
#                     "role": role,
#                     "message": message,
#                     "audio": audio_blob,
#                     "response": response,
#                 },
#             )
#     except Exception as e:
#         print("Chat save error:", e)


# def get_chat_by_usercode(userid):
#     query = text(
#         """
#         SELECT role, message, audio, response, created_at
#         FROM chat_history
#         WHERE userid = :userid
#         ORDER BY id ASC
#     """
#     )

#     with raw_engine.begin() as conn:
#         rows = conn.execute(query, {"userid": userid}).mappings().all()

#     result = []
#     for r in rows:
#         audio_base64 = (
#             f"data:audio/webm;base64,{base64.b64encode(r['audio']).decode()}"
#             if r["audio"]
#             else None
#         )
#         parsed_response = None
#         try:
#             parsed_response = json.loads(r["response"])
#         except:
#             parsed_response = r["response"]

#         result.append(
#             {
#                 "role": r["role"],
#                 "message": r["message"],
#                 "response": parsed_response,
#                 "created_at": r["created_at"].isoformat(),
#                 "audio": audio_base64,
#             }
#         )

#     return result


# def init_database():
#     db_uri = f"mysql+mysqlconnector://root:your_new_password@localhost:3306/bigfm"

#     engine_args = {"pool_pre_ping": True, "pool_size": 20, "max_overflow": 40}

#     return SQLDatabase.from_uri(db_uri, engine_args=engine_args)


# db = init_database()

# # Cache schema
# SCHEMA = db.get_table_info()

# # ---------------------------------------------------------------
# # SYSTEM PROMPTS
# # ---------------------------------------------------------------

# SYSTEM_SQL_ANALYST = f"""
# You are an expert MySQL analyst.
# You know the following database schema:

# <SCHEMA>
# {SCHEMA}
# </SCHEMA>

# RULES FOR SQL:
# 1. Always SELECT only the columns required to answer the question.
# 2. Use lowercase SQL keywords preferred but either style is accepted.
# 3. If a CITY / ORIGIN is mentioned → apply:
#        WHERE city = '<CITY>'
# 4. If a DATE RANGE is mentioned (last 7 days, last month, today, etc.) → apply ONLY on:
#        date_to
#    Examples:
#        last 7 days → WHERE date_to >= CURDATE() - INTERVAL 7 DAY
#        last 30 days → WHERE date_to >= CURDATE() - INTERVAL 30 DAY
#        this month → WHERE MONTH(date_to) = MONTH(CURDATE()) AND YEAR(date_to) = YEAR(CURDATE())
# 5. If user does not mention a date → DO NOT apply a date filter.
# 6. If brand, parent, category, or broadcaster is mentioned → filter using exact match.
# 7. When aggregation needed:
#        total plays → SUM(plays)
#        total seconds → SUM(seconds)
# 8. For ranking → ORDER BY DESC with LIMIT 1 or LIMIT N.
# 9. Never include text, comments, or explanations—only the SQL query.

# CHART DETECTION RULES:
# - Detect whether the user wants a chart using keywords:
#   ["chart", "graph", "plot", "visualize", "trend", "bar", "line", "pie", "histogram"]
# - Set `isChartNeeded` = true if any keyword is detected.
# - Otherwise set `isChartNeeded` = false.

# You MUST output structured fields only:
# - "sql": final SQL query
# - "isChartNeeded": boolean
# """

# SYSTEM_DATA_ANALYST = """
# You are a senior data analyst.
# Rules:
# - Interpret the SQL result into a short, clear answer.
# - Never mention SQL.
# - Never mention schema.
# """

# # ---------------------------------------------------------------
# # LLM MODELS
# # ---------------------------------------------------------------

# llm_sql = ChatOpenAI(model="gpt-4.1", temperature=0)
# llm_sql_structured = llm_sql.with_structured_output(SQLModel , method="function_calling")
# llm_answer = ChatOpenAI(model="gpt-4.1-mini", temperature=0)
# llm_chart = ChatOpenAI(model="gpt-4.1-mini", temperature=0)
# llm_chart_structured = llm_chart.with_structured_output(ChartResponse, method="function_calling")

# # ---------------------------------------------------------------
# # HELPERS
# # ---------------------------------------------------------------


# def clean_sql(q):
#     return q.replace("```sql", "").replace("```", "").strip()



# def generate_chart_json(sql_results, question):
#     prompt = f"""
# Convert SQL result into a valid JSON chart specification.

# Supported chart types:
# - bar
# - line
# - pie
# - donut (chart_type='pie' + hole=0.5)
# - radar
# - heatmap

# Single-Series Format:
# {{
#   "chart_type": "bar" | "line" | "pie" | "radar",
#   "labels": [...],
#   "values": [...],
#   "colors": [...],
#   "title": "..."
# }}

# Multi-Series Format:
# {{
#   "chart_type": "bar" | "line",
#   "labels": [...],
#   "datasets": [
#     {{
#       "label": "series",
#       "data": [...],
#       "color": "#RRGGBB"
#     }}
#   ],
#   "title": "..."
# }}

# Donut Format:
# {{
#   "chart_type": "pie",
#   "labels": [...],
#   "values": [...],
#   "colors": [...],
#   "hole": 0.5,
#   "title": "..."
# }}

# Radar Format:
# {{
#   "chart_type": "radar",
#   "labels": [...],
#   "values": [...],
#   "colors": [...],
#   "title": "..."
# }}

# Heatmap Format:
# {{
#   "chart_type": "heatmap",
#   "x": [...],
#   "y": [...],
#   "z": [...],
#   "title": "..."
# }}

# Rules:
# - Output ONLY valid JSON.
# - Colors must be bright hex colors.
# - Match SQL data structure exactly.
# - For heatmap: pivot SQL into (x=months, y=package_size, z=matrix).
# - Missing combinations = 0.
# - No markdown. No comments.

# Insufficient Data Rules:
# - If the SQL result does NOT have enough distinct values to build the requested chart:
#     • bar/line: require ≥ 2 points
#     • radar: require ≥ 3 points
#     • heatmap: require ≥ 2 distinct months AND ≥ 2 distinct package sizes
#   THEN return this (TEXT) response instead of a chart:
#   {{
#     "type": "text",
#     "response": "Heatmap cannot be generated because the dataset is insufficient."
#   }}

# SQL Result:
# {sql_results}

# User Question:
# {question}
# """




#     try:
#         result: ChartResponse = llm_chart_structured.invoke(prompt)
#         return result.dict()
#     except Exception:
#         return {
#             "type": "text",
#             "response": "Failed to generate chart JSON. Try again."
#         }


# # ---------------------------------------------------------------
# # MAIN PROCESSING PIPELINE
# # ---------------------------------------------------------------


# def generate_sql(user_question: str):
#     system_prompt = SYSTEM_SQL_ANALYST

#     messages = [
#         {"role": "system", "content": system_prompt},
#         {"role": "user", "content": user_question},
#     ]

#     response: SQLModel = llm_sql_structured.invoke(messages)
#     return {
#             "sql": clean_sql(response.sql),
#             "isChartNeeded": response.isChartNeeded
#         }


# def generate_final_answer(question, sql_query, sql_results, chat_history):
#     messages = [
#         {"role": "system", "content": SYSTEM_DATA_ANALYST},
#         *chat_history,
#         {
#             "role": "user",
#             "content": f"""
# User Question: {question}
# SQL Result: {sql_results}
# """,
#         },
#     ]
#     return llm_answer.invoke(messages).content


# def process_query(user_query, chat_history):

#     # 1️⃣ Structured SQL output → { sql, isChartNeeded }
#     sql_obj = generate_sql(user_query)
#     sql_query = sql_obj["sql"]
#     is_chart_needed = sql_obj["isChartNeeded"]

#     # 2️⃣ Run SQL safely
#     try:
#         sql_result = db.run(sql_query)
#         # print("Executed SQL:", sql_query)
#     except Exception as e:
#         return {
#             "type": "text",
#             "response": f"SQL Error: {e}\nGenerated SQL: {sql_query}"
#         }

#     # 3️⃣ If user needs a chart
#     # print("sql_result", sql_result)
#     if is_chart_needed:
#         chart_json = generate_chart_json(sql_result, user_query)

#         # If chart generation fails, it returns a text fallback
#         if chart_json.get("type") == "text":
#             return chart_json

#         return {"type": "chart", **chart_json}

#     # 4️⃣ Otherwise → Natural language answer
#     history_slice = chat_history[-2:]
#     text_answer = generate_final_answer(
#         user_query, sql_query, sql_result, history_slice
#     )

#     return {"type": "text", "response": text_answer}



# # ---------------------------------------------------------------
# # ROUTES
# # ---------------------------------------------------------------

# chat_history = [AIMessage(content="Hello! I'm your SQL assistant. Ask me anything.")]


# @app.post("/analyze")
# def analyze():
#     data = request.json

#     user_query = data.get("query")
#     userid = data.get("userid", "")
#     role = data.get("role", "").lower().strip()

#     if not user_query:
#         return jsonify({"error": "query field is required"}), 400

#     chat_history.append(HumanMessage(content=user_query))

#     try:
#         result = process_query(user_query, chat_history)
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

#     # For LLM conversation history, store text only (for context)
#     history_text = (
#         result.get("response")
#         if isinstance(result, dict) and result.get("type") == "text"
#         else "Chart response generated."
#     )
#     chat_history.append(AIMessage(content=history_text))

#     # Store FULL JSON in DB so frontend can reconstruct chart/text
#     try:
#         save_chat(
#             userid, "assistant", message=user_query, response=json.dumps(result)
#         )
#     except Exception as e:
#         print("Error saving chat:", e)

#     # Return pure JSON to frontend
#     return jsonify(result)


# @app.get("/analyze/history/<usercode>")
# def analyze_history(usercode):
#     results = get_chat_by_usercode(usercode)
#     return jsonify({"usercode": usercode, "history": results})


# @app.post("/voice")
# def voice_input():
#     try:
#         audio_file = request.files.get("audio")
#         usercode = request.form.get("usercode", "")
#         role = request.form.get("role", "").lower().strip()

#         if not audio_file:
#             return jsonify({"error": "Audio file is required"}), 400

#         audio_bytes = audio_file.read()
#         audio_file.stream.seek(0)

#         with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp:
#             audio_file.save(temp.name)
#             audio_path = temp.name

#         # Whisper transcription
#         with open(audio_path, "rb") as f:
#             transcript = client.audio.transcriptions.create(
#                 model="gpt-4o-transcribe", file=f, language="en"
#             )

#         transcribed_text = transcript.text.strip()

#         reply = process_query(transcribed_text, usercode, role, chat_history)

#         # For history context:
#         history_text = (
#             reply.get("response")
#             if isinstance(reply, dict) and reply.get("type") == "text"
#             else "Chart response generated."
#         )

#         chat_history.append(HumanMessage(content=transcribed_text))
#         chat_history.append(AIMessage(content=history_text))

#         # Save to DB (store reply as JSON string)
#         save_chat(
#             usercode=usercode,
#             role="assistant",
#             message=transcribed_text,
#             response=json.dumps(reply),
#             audio_blob=audio_bytes,
#         )

#         return jsonify({"voice_text": transcribed_text, "response": reply})

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500


# @app.post("/tts")
# def tts():
#     try:
#         data = request.get_json(silent=True) or {}
#         text = data.get("text")

#         if not text:
#             return jsonify({"error": "text is required"}), 400

#         response = client.audio.speech.create(
#             model="gpt-4o-mini-tts", voice="alloy", input=text
#         )

#         audio_bytes = response.read()
#         audio_base64 = base64.b64encode(audio_bytes).decode("utf-8")

#         return jsonify(
#             {"audio": f"data:audio/mp3;base64,{audio_base64}", "format": "mp3"}
#         )

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500


# @app.post("/upload_market_data")
# def upload_market_data():
#     try:
#         city = request.form.get("city")
#         date_from = request.form.get("date_from")
#         date_to = request.form.get("date_to")
#         file = request.files.get("file")

#         if not city or not date_from or not date_to or not file:
#             return jsonify({"error": "city, date_from, date_to & file are required"}), 400

#         df = pd.read_csv(file) if file.filename.endswith(".csv") else pd.read_excel(file)

#         # Detect plays/seconds column pairs
#         broadcaster_pairs = []
#         for col in df.columns:
#             if "(#Plays)" in col:
#                 base = col.replace("(#Plays)", "").strip()
#                 seconds_col = f"{base}(#Seconds)"
#                 if seconds_col in df.columns:
#                     broadcaster_pairs.append((col, seconds_col))

#         insert_sql = """
#             INSERT INTO advertiser_broadcaster_stats
#             (city, date_from, date_to, brand_name, parent, category, broadcaster, plays, seconds)
#             VALUES (:city, :date_from, :date_to, :brand_name, :parent, :category, :broadcaster, :plays, :seconds)
#         """

#         # Use SQLAlchemy transaction
#         with raw_engine.begin() as connection:
#             for _, row in df.iterrows():
#                 brand_name = row.get("Brand Name")
#                 parent = row.get("Parent")
#                 category = row.get("Category")

#                 for plays_col, seconds_col in broadcaster_pairs:
#                     plays = row.get(plays_col)
#                     seconds = row.get(seconds_col)

#                     plays = 0 if pd.isna(plays) else int(plays)
#                     seconds = 0 if pd.isna(seconds) else int(seconds)

#                     # skip if both zero
#                     if plays == 0 and seconds == 0:
#                         continue

#                     broadcaster = plays_col.replace("(#Plays)", "").strip()

#                     connection.execute(
#                         text(insert_sql),
#                         {
#                             "city": city,
#                             "date_from": date_from,
#                             "date_to": date_to,
#                             "brand_name": brand_name,
#                             "parent": parent,
#                             "category": category,
#                             "broadcaster": broadcaster,
#                             "plays": plays,
#                             "seconds": seconds,
#                         }
#                     )

#         return jsonify({"message": "Data uploaded successfully 🚀"}), 200

#     except Exception as e:
#         print("❌ Error:", e)
#         return jsonify({"error": str(e)}), 500




# @app.route('/getMissedclients', methods=['GET'])
# def get_missed_clients():
#     broadcaster = request.args.get("broadcaster")
#     city = request.args.get("city")
#     start_date = request.args.get("start_date")
#     end_date = request.args.get("end_date")
#     page = int(request.args.get("page", 1))
#     limit = int(request.args.get("limit", 10))  # default 10

#     if not broadcaster:
#         return jsonify({"error": "broadcaster parameter required"}), 400

#     mapping = {
#         "BIG FM": "BIG_FM",
#         "FEVER": "FEVER",
#         "MY FM": "MY_FM",
#         "OTHERS": "OTHERS",
#         "RADIO CITY": "RADIO_CITY",
#         "RADIO MIRCHI": "RADIO_MIRCHI",
#         "RED FM": "RED_FM"
#     }

#     if broadcaster not in mapping:
#         return jsonify({"error": "Invalid broadcaster"}), 400

#     selected_col = mapping[broadcaster]

#     group_case = """  
#         CASE
#             WHEN broadcaster LIKE 'RADIO MIRCHI LOVE%' THEN 'RADIO MIRCHI LOVE'
#             WHEN broadcaster LIKE 'RADIO MIRCHI%' THEN 'RADIO MIRCHI'
#             WHEN broadcaster LIKE 'PUNJABI FEVER%' THEN 'PUNJABI FEVER'
#             WHEN broadcaster LIKE 'FEVER%' THEN 'FEVER'
#             WHEN broadcaster LIKE 'BIG FM%' THEN 'BIG FM'
#             WHEN broadcaster LIKE 'RED FM%' THEN 'RED FM'
#             WHEN broadcaster LIKE 'MY FM%' THEN 'MY FM'
#             WHEN broadcaster LIKE 'RADIO CITY%' THEN 'RADIO CITY'
#             ELSE TRIM(broadcaster)
#         END
#     """

#     filters = "WHERE 1=1"
#     params = {}

#     if city:
#         filters += " AND city = :city"
#         params["city"] = city

#     if start_date:
#         filters += " AND ad_date >= :start_date"
#         params["start_date"] = start_date

#     if end_date:
#         filters += " AND ad_date <= :end_date"
#         params["end_date"] = end_date

#     offset = (page - 1) * limit

#     # Main paginated query
#     sql = f"""
#         SELECT
#             city,
#             parent,
#             SUM(CASE WHEN {group_case} = 'BIG FM' THEN seconds ELSE 0 END) AS BIG_FM,
#             SUM(CASE WHEN {group_case} = 'FEVER' THEN seconds ELSE 0 END) AS FEVER,
#             SUM(CASE WHEN {group_case} = 'MY FM' THEN seconds ELSE 0 END) AS MY_FM,
#             SUM(CASE WHEN {group_case} = 'RADIO CITY' THEN seconds ELSE 0 END) AS RADIO_CITY,
#             SUM(CASE WHEN {group_case} = 'RADIO MIRCHI' THEN seconds ELSE 0 END) AS RADIO_MIRCHI,
#             SUM(CASE WHEN {group_case} = 'RED FM' THEN seconds ELSE 0 END) AS RED_FM,
#             SUM(CASE WHEN {group_case} NOT IN (
#                 'BIG FM', 'FEVER', 'MY FM', 'RADIO CITY', 'RADIO MIRCHI', 'RED FM'
#             ) THEN seconds ELSE 0 END) AS OTHERS
#         FROM advertiser_broadcaster_stats
#         {filters}
#         GROUP BY city, parent
#         HAVING {selected_col} = 0
#            AND (BIG_FM + FEVER + MY_FM + RADIO_CITY + RADIO_MIRCHI + RED_FM + OTHERS) > 0
#         ORDER BY city, parent
#         LIMIT :limit OFFSET :offset;
#     """

#     params["limit"] = limit
#     params["offset"] = offset

#     # Count total records for pagination UI
#     sql_count = f"""
#     SELECT COUNT(*) AS total
#     FROM (
#         SELECT
#             city, parent,
#             SUM(CASE WHEN {group_case} = 'BIG FM' THEN seconds ELSE 0 END) AS BIG_FM,
#             SUM(CASE WHEN {group_case} = 'FEVER' THEN seconds ELSE 0 END) AS FEVER,
#             SUM(CASE WHEN {group_case} = 'MY FM' THEN seconds ELSE 0 END) AS MY_FM,
#             SUM(CASE WHEN {group_case} = 'RADIO CITY' THEN seconds ELSE 0 END) AS RADIO_CITY,
#             SUM(CASE WHEN {group_case} = 'RADIO MIRCHI' THEN seconds ELSE 0 END) AS RADIO_MIRCHI,
#             SUM(CASE WHEN {group_case} = 'RED FM' THEN seconds ELSE 0 END) AS RED_FM,
#             SUM(CASE WHEN {group_case} NOT IN (
#                 'BIG FM', 'FEVER', 'MY FM', 'RADIO CITY', 'RADIO MIRCHI', 'RED FM'
#             ) THEN seconds ELSE 0 END) AS OTHERS
#         FROM advertiser_broadcaster_stats
#         {filters}
#         GROUP BY city, parent
#         HAVING {selected_col} = 0
#            AND (BIG_FM + FEVER + MY_FM + RADIO_CITY + RADIO_MIRCHI + RED_FM + OTHERS) > 0
#     ) AS t;
# """


#     engine = db._engine
#     with engine.connect() as conn:
#         result = conn.execute(text(sql), params)
#         rows = result.mappings().all()
#         total_records = conn.execute(text(sql_count), params).scalar()

#     data = []
#     for row in rows:
#         total = (
#             float(row["BIG_FM"]) + float(row["FEVER"]) + float(row["MY_FM"]) +
#             float(row["OTHERS"]) + float(row["RADIO_CITY"]) +
#             float(row["RADIO_MIRCHI"]) + float(row["RED_FM"])
#         )

#         obj = {
#             "city": row["city"],
#             "parent": row["parent"],
#             "BIG_FM": f"{round((float(row['BIG_FM']) / total) * 100)}%" if total else "0%",
#             "FEVER": f"{round((float(row['FEVER']) / total) * 100)}%" if total else "0%",
#             "MY_FM": f"{round((float(row['MY_FM']) / total) * 100)}%" if total else "0%",
#             "OTHERS": f"{round((float(row['OTHERS']) / total) * 100)}%" if total else "0%",
#             "RADIO_CITY": f"{round((float(row['RADIO_CITY']) / total) * 100)}%" if total else "0%",
#             "RADIO_MIRCHI": f"{round((float(row['RADIO_MIRCHI']) / total) * 100)}%" if total else "0%",
#             "RED_FM": f"{round((float(row['RED_FM']) / total) * 100)}%" if total else "0%",
#             "total_seconds": total
#         }
#         data.append(obj)

#     return jsonify({
#         "page": page,
#         "limit": limit,
#         "total_records": total_records,
#         "total_pages": (total_records + limit - 1) // limit,
#         "records": data
#     })


# if __name__ == "__main__":
#     app.run(host="0.0.0.0", port=5000, debug=True)
