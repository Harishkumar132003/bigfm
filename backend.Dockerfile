FROM python:3.12-slim

WORKDIR /app


COPY bigfm-backend/requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend project
COPY bigfm-backend ./

EXPOSE 5000

CMD ["python", "app.py"]
