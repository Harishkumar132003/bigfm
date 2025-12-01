from flask import Blueprint, request, jsonify
from dotenv import load_dotenv
from langchain_core.messages import AIMessage, HumanMessage
from langchain_openai import ChatOpenAI
from langchain_community.utilities import SQLDatabase
import os
from sqlalchemy import create_engine, text
from flask_cors import CORS
from openai import OpenAI
import tempfile
import base64
import json
from pydantic import BaseModel, Field
from typing import List, Optional
import pandas as pd
from decimal import Decimal
from database import raw_engine, db

agent_bp = Blueprint("agent_bp", __name__)
client = OpenAI()

class SQLModel(BaseModel):
    sql: str = Field(description="Generated SQL query")
    isChartNeeded: bool = Field(description="Whether user wants a chart")

class ChartDataset(BaseModel):
    label: str
    data: List[float]
    color: str

class ChartResponse(BaseModel):
    chart_type: str
    labels: List[str]
    values: Optional[List[float]] = None
    datasets: Optional[List[ChartDataset]] = None
    colors: Optional[List[str]] = None
    title: str
    hole: Optional[float] = None
    options: Optional[dict] = None
    x_axis_label: Optional[str] = None
    y_axis_label: Optional[str] = None
    legend_position: Optional[str] = None 
    z: Optional[List[List[float]]] = None
    x: Optional[List[str]] = None
    y: Optional[List[str]] = None


def save_chat(userid, role, message=None, response=None, audio_blob=None):
    try:
        query = text(
            """
            INSERT INTO chat_history (userid, role, message, audio, response)
            VALUES (:userid, :role, :message, :audio, :response)
        """
        )
        with raw_engine.begin() as conn:
            conn.execute(
                query,
                {
                    "userid": userid,
                    "role": role,
                    "message": message,
                    "audio": audio_blob,
                    "response": response,
                },
            )
    except Exception as e:
        print("Chat save error:", e)


def get_chat_by_usercode(userid):
    query = text(
        """
        SELECT role, message, audio, response, created_at
        FROM chat_history
        WHERE userid = :userid
        ORDER BY id ASC
    """
    )

    with raw_engine.begin() as conn:
        rows = conn.execute(query, {"userid": userid}).mappings().all()

    result = []
    for r in rows:
        audio_base64 = (
            f"data:audio/webm;base64,{base64.b64encode(r['audio']).decode()}"
            if r["audio"]
            else None
        )
        parsed_response = None
        try:
            parsed_response = json.loads(r["response"])
        except:
            parsed_response = r["response"]

        result.append(
            {
                "role": r["role"],
                "message": r["message"],
                "response": parsed_response,
                "created_at": r["created_at"].isoformat(),
                "audio": audio_base64,
            }
        )

    return result


# Cache schema
SCHEMA = db.get_table_info()

# ---------------------------------------------------------------
# SYSTEM PROMPTS
# ---------------------------------------------------------------

SYSTEM_SQL_ANALYST = f"""
You are an expert MySQL analyst.
You know the following database schema:

<SCHEMA>
{SCHEMA}
</SCHEMA>

RULES FOR SQL:
1. Always SELECT only the columns required to answer the question.
2. Use lowercase SQL keywords preferred but either style is accepted.
3. If origin / station / city is mentioned → apply:
       WHERE origin = '<VALUE>'  or WHERE station = '<VALUE>' depending on context.
4. TIME FILTER RULES (IMPORTANT):
   - There is NO date field.
   - If the user mentions year / month / week, filter using:
         WHERE year = <YEAR>
         WHERE month = '<MONTH>'
         WHERE week = '<WEEK>'
   - If user does NOT mention year / month / week → DO NOT apply any time filter.
5. If brand, parent, category, category_final, bucket, channel, or channel_club is mentioned → filter using exact match.
6. When aggregation is needed:
       total seconds → SUM(seconds)
       total outlay → SUM(outlay)
       total rate → SUM(rate)
7. MARKET SHARE RULES (IMPORTANT):
   - Market Share is always based on seconds.
   - Formula:
         (SUM(seconds of a broadcaster or channel_club) / SUM(all seconds)) * 100
   - SQL implementation example:
         SUM(CASE WHEN channel_club = 'BIG FM' THEN seconds ELSE 0 END) / SUM(seconds) * 100 AS big_fm_share
8. For ranking or top-N results → ORDER BY ... DESC with LIMIT 1 or LIMIT N.
9. Never include any text explanation, comments, or natural language — ONLY the SQL query.

CHART DETECTION RULES:
- Detect whether the user wants a chart using keywords:
  ["chart", "graph", "plot", "visualize", "trend", "bar", "line", "pie", "histogram"]
- Set `isChartNeeded` = true if any keyword is detected.
- Otherwise set `isChartNeeded` = false.

You MUST output structured fields only:
- "sql": final SQL query
- "isChartNeeded": boolean
"""


SYSTEM_DATA_ANALYST = """
You are a senior data analyst.
Rules:
- Interpret the SQL result into a short, clear answer.
- Never mention SQL.
- Never mention schema.
"""

# ---------------------------------------------------------------
# LLM MODELS
# ---------------------------------------------------------------

llm_sql = ChatOpenAI(model="gpt-4.1", temperature=0)
llm_sql_structured = llm_sql.with_structured_output(SQLModel , method="function_calling")
llm_answer = ChatOpenAI(model="gpt-4.1-mini", temperature=0)
llm_chart = ChatOpenAI(model="gpt-4.1-mini", temperature=0)
llm_chart_structured = llm_chart.with_structured_output(ChartResponse, method="function_calling")

# ---------------------------------------------------------------
# HELPERS
# ---------------------------------------------------------------


def clean_sql(q):
    return q.replace("```sql", "").replace("```", "").strip()



def generate_chart_json(sql_results, question):
    prompt = f"""
Convert SQL result into a valid JSON chart specification.

Supported chart types:
- bar
- line
- pie
- donut (chart_type='pie' + hole=0.5)
- radar
- heatmap

Single-Series Format:
{{
  "chart_type": "bar" | "line" | "pie" | "radar",
  "labels": [...],
  "values": [...],
  "colors": [...],
  "title": "..."
}}

Multi-Series Format:
{{
  "chart_type": "bar" | "line",
  "labels": [...],
  "datasets": [
    {{
      "label": "series",
      "data": [...],
      "color": "#RRGGBB"
    }}
  ],
  "title": "..."
}}

Donut Format:
{{
  "chart_type": "pie",
  "labels": [...],
  "values": [...],
  "colors": [...],
  "hole": 0.5,
  "title": "..."
}}

Radar Format:
{{
  "chart_type": "radar",
  "labels": [...],
  "values": [...],
  "colors": [...],
  "title": "..."
}}

Heatmap Format:
{{
  "chart_type": "heatmap",
  "x": [...],
  "y": [...],
  "z": [...],
  "title": "..."
}}

Rules:
- Output ONLY valid JSON.
- Colors must be bright hex colors.
- Match SQL data structure exactly.
- For heatmap: pivot SQL into (x=months, y=package_size, z=matrix).
- Missing combinations = 0.
- No markdown. No comments.

Insufficient Data Rules:
- If the SQL result does NOT have enough distinct values to build the requested chart:
    • bar/line: require ≥ 2 points
    • radar: require ≥ 3 points
    • heatmap: require ≥ 2 distinct months AND ≥ 2 distinct package sizes
  THEN return this (TEXT) response instead of a chart:
  {{
    "type": "text",
    "response": "Heatmap cannot be generated because the dataset is insufficient."
  }}

SQL Result:
{sql_results}

User Question:
{question}
"""




    try:
        result: ChartResponse = llm_chart_structured.invoke(prompt)
        return result.dict()
    except Exception:
        return {
            "type": "text",
            "response": "Failed to generate chart JSON. Try again."
        }


# ---------------------------------------------------------------
# MAIN PROCESSING PIPELINE
# ---------------------------------------------------------------


def generate_sql(user_question: str):
    system_prompt = SYSTEM_SQL_ANALYST

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_question},
    ]

    response: SQLModel = llm_sql_structured.invoke(messages)
    return {
            "sql": clean_sql(response.sql),
            "isChartNeeded": response.isChartNeeded
        }


def generate_final_answer(question, sql_query, sql_results, chat_history):
    messages = [
        {"role": "system", "content": SYSTEM_DATA_ANALYST},
        *chat_history,
        {
            "role": "user",
            "content": f"""
User Question: {question}
SQL Result: {sql_results}
""",
        },
    ]
    return llm_answer.invoke(messages).content


def process_query(user_query, chat_history):

    # 1️⃣ Structured SQL output → { sql, isChartNeeded }
    sql_obj = generate_sql(user_query)
    sql_query = sql_obj["sql"]
    is_chart_needed = sql_obj["isChartNeeded"]

    # 2️⃣ Run SQL safely
    try:
        sql_result = db.run(sql_query)
        # print("Executed SQL:", sql_query)
    except Exception as e:
        return {
            "type": "text",
            "response": f"SQL Error: {e}\nGenerated SQL: {sql_query}"
        }

    # 3️⃣ If user needs a chart
    # print("sql_result", sql_result)
    if is_chart_needed:
        chart_json = generate_chart_json(sql_result, user_query)

        # If chart generation fails, it returns a text fallback
        if chart_json.get("type") == "text":
            return chart_json

        return {"type": "chart", **chart_json}

    # 4️⃣ Otherwise → Natural language answer
    history_slice = chat_history[-2:]
    text_answer = generate_final_answer(
        user_query, sql_query, sql_result, history_slice
    )

    return {"type": "text", "response": text_answer}



# ---------------------------------------------------------------
# ROUTES
# ---------------------------------------------------------------

chat_history = [AIMessage(content="Hello! I'm your SQL assistant. Ask me anything.")]


@agent_bp.post("/analyze")
def analyze():
    data = request.json

    user_query = data.get("query")
    userid = data.get("userid", "")
    role = data.get("role", "").lower().strip()

    if not user_query:
        return jsonify({"error": "query field is required"}), 400

    chat_history.append(HumanMessage(content=user_query))

    try:
        result = process_query(user_query, chat_history)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    # For LLM conversation history, store text only (for context)
    history_text = (
        result.get("response")
        if isinstance(result, dict) and result.get("type") == "text"
        else "Chart response generated."
    )
    chat_history.append(AIMessage(content=history_text))

    # Store FULL JSON in DB so frontend can reconstruct chart/text
    try:
        save_chat(
            userid, "assistant", message=user_query, response=json.dumps(result)
        )
    except Exception as e:
        print("Error saving chat:", e)

    # Return pure JSON to frontend
    return jsonify(result)


@agent_bp.get("/analyze/history/<usercode>")
def analyze_history(usercode):
    results = get_chat_by_usercode(usercode)
    return jsonify({"usercode": usercode, "history": results})


@agent_bp.post("/voice")
def voice_input():
    try:
        audio_file = request.files.get("audio")
        usercode = request.form.get("usercode", "")
        role = request.form.get("role", "").lower().strip()

        if not audio_file:
            return jsonify({"error": "Audio file is required"}), 400

        audio_bytes = audio_file.read()
        audio_file.stream.seek(0)

        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp:
            audio_file.save(temp.name)
            audio_path = temp.name

        # Whisper transcription
        with open(audio_path, "rb") as f:
            transcript = client.audio.transcriptions.create(
                model="gpt-4o-transcribe", file=f, language="en"
            )

        transcribed_text = transcript.text.strip()

        reply = process_query(transcribed_text, usercode, role, chat_history)

        # For history context:
        history_text = (
            reply.get("response")
            if isinstance(reply, dict) and reply.get("type") == "text"
            else "Chart response generated."
        )

        chat_history.append(HumanMessage(content=transcribed_text))
        chat_history.append(AIMessage(content=history_text))

        # Save to DB (store reply as JSON string)
        save_chat(
            usercode=usercode,
            role="assistant",
            message=transcribed_text,
            response=json.dumps(reply),
            audio_blob=audio_bytes,
        )

        return jsonify({"voice_text": transcribed_text, "response": reply})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@agent_bp.post("/tts")
def tts():
    try:
        data = request.get_json(silent=True) or {}
        text = data.get("text")

        if not text:
            return jsonify({"error": "text is required"}), 400

        response = client.audio.speech.create(
            model="gpt-4o-mini-tts", voice="alloy", input=text
        )

        audio_bytes = response.read()
        audio_base64 = base64.b64encode(audio_bytes).decode("utf-8")

        return jsonify(
            {"audio": f"data:audio/mp3;base64,{audio_base64}", "format": "mp3"}
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500

