# Utiliser Ubuntu 22.04 comme base
FROM ubuntu:22.04

# Éviter les prompts interactifs pendant l'installation
ENV DEBIAN_FRONTEND=noninteractive

# Installer Python 3.10 et les dépendances nécessaires
RUN apt-get update && apt-get install -y \
    python3.10 \
    python3.10-dev \
    python3-pip \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers nécessaires
COPY requirements.txt .
COPY run.py .
COPY daemon.cpp .
COPY Makefile .
COPY templates/ ./templates/
COPY static/ ./static/
COPY sensor.example/ ./sensor/

# Installer les dépendances Python
RUN pip3 install --no-cache-dir -r requirements.txt

EXPOSE 5000

# La commande sera définie dans docker-compose.yml
