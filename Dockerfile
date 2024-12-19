# Utiliser Ubuntu 22.04 comme base
FROM ubuntu:22.04

# Éviter les prompts interactifs pendant l'installation
ENV DEBIAN_FRONTEND=noninteractive

# Installer Python 3.9 et les dépendances nécessaires
RUN apt-get update && apt-get install -y \
    python3.10 \
    python3.10-dev \
    python3-pip \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Le reste de votre Dockerfile reste identique
WORKDIR /app
COPY requirements.txt .
COPY run.py .
COPY daemon.cpp .
COPY Makefile .
COPY templates/ ./templates/
COPY static/ ./static/
COPY sensor.example/ ./sensor/

RUN pip3 install --no-cache-dir -r requirements.txt
RUN make

EXPOSE 5000
CMD ["python3", "run.py"]
