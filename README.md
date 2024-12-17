# WEBS Application
**Hugo COLLIN, Chloé MAYER, Anikati M'MADI**

## Description
TODO

## Guide de démarrage
### 0. Préparation générale
1. Avoir son environnement à jour
```sh
# Mettre à jour le gestionnaire de paquets
sudo apt update

# Réparer les dépendances (en cas de problème)
sudo apt --fix-broken install

# Installer les mises à jour
sudo apt upgrade -y
```

2. Installer les outils de base :
    - Git
    ```sh
    sudo apt install git
    ```
    
    - Python
    ```sh
    # Installer Python (en utilisant le PPA deadsnakes)
    sudo add-apt-repository ppa:deadsnakes/ppa -y
    sudo apt update
    sudo apt install python3.10-dev python3.10-venv python3.10-distutils -y

    # Vérifier l'installation
    python3.10 --version
    ```

    - Outils de compilation
    ```sh
    sudo apt install build-essential cmake
    ```

3. [Initialiser sa clé SSH liée à GitHub](https://gist.github.com/Hugo-COLLIN/456fd191689c11a59e76a66d3ad887d8)

4. Cloner le dépôt :
```sh
git clone git@github.com:Hugo-COLLIN/MIAGE_Systeme_WEBS.git
```

### 1. Préparer l'environnement de développement
1. Se placer dans le répertoire du projet (`cd MIAGE_Systeme_WEBS`)
2. Copier le dossier `sensor/` depuis l'archive disponible sur le cours en ligne à la racine du projet.
3. Créer l'environnement virtuel Python :
```sh
python3 -m venv venv
source venv/bin/activate
```

4. Installer les dépendances Python :
```sh
pip install -r requirements.txt
```

5. Compiler le deamon via le Makefile :
```sh
make
```

### 2. Lancer l'application
1. Avoir compilé le daemon avec `make` (ne pas oublier de recompiler après toute modification de `daemon.c`)

2. Lancer :
```sh
python3 run.py
```

3. Ouvrir le navigateur à l'url indiquée