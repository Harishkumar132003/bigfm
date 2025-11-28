class SQLAGENT:
    @staticmethod
    def clean_sql(q):
        return q.replace("```sql", "").replace("```", "").strip()

    @staticmethod
    def generate_chart_json(sql_results, question):
        prompt = f"""
Convert SQL result into a valid JSON chart specification.
...
{sql_results}
User Question:
{question}
"""
        try:
            result = llm_chart_structured.invoke(prompt)
            return result.dict()
        except Exception:
            return {
                "type": "text",
                "response": "Failed to generate chart JSON. Try again."
            }

    @staticmethod
    def generate_sql(user_question: str):
        system_prompt = SYSTEM_SQL_ANALYST
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_question},
        ]
        response = llm_sql_structured.invoke(messages)
        return {
            "sql": SQLAGENT.clean_sql(response.sql),
            "isChartNeeded": response.isChartNeeded
        }

    @staticmethod
    def generate_final_answer(question, sql_query, sql_results, chat_history):
        messages = [
            {"role": "system", "content": SYSTEM_DATA_ANALYST},
            *chat_history,
            {
                "role": "user",
                "content": f"User Question: {question}\nSQL Result: {sql_results}"
            },
        ]
        return llm_answer.invoke(messages).content

    @staticmethod
    def process_query(user_query, chat_history):
        sql_obj = SQLAGENT.generate_sql(user_query)
        sql_query = sql_obj["sql"]
        is_chart_needed = sql_obj["isChartNeeded"]

        try:
            sql_result = db.run(sql_query)
        except Exception as e:
            return {
                "type": "text",
                "response": f"SQL Error: {e}\nGenerated SQL: {sql_query}"
            }

        if is_chart_needed:
            chart_json = SQLAGENT.generate_chart_json(sql_result, user_query)
            if chart_json.get("type") == "text":
                return chart_json
            return {"type": "chart", **chart_json}

        history_slice = chat_history[-2:]
        text_answer = SQLAGENT.generate_final_answer(
            user_query, sql_query, sql_result, history_slice
        )
        return {"type": "text", "response": text_answer}
