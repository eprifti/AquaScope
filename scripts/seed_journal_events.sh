#!/usr/bin/env bash
#
# Seed tank events from Journal_Recifal.txt into the "Bac Récifal Principal" tank
# for user ***REDACTED_EMAIL***
#
set -euo pipefail

API="http://localhost:8000/api/v1"
EMAIL="***REDACTED_EMAIL***"
PASS="AquaScope2024%21"

echo "=== Seeding Journal Events ==="

# ── Login ────────────────────────────────────────────────────────
echo "[1/2] Logging in as $EMAIL..."
TOKEN=$(curl -sf -X POST "$API/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=$EMAIL&password=$PASS" | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

AUTH="Authorization: Bearer $TOKEN"
CT="Content-Type: application/json"

# Find the saltwater tank
TANK_ID=$(curl -sf "$API/tanks/" -H "$AUTH" | python3 -c "
import sys, json
tanks = json.load(sys.stdin)
for t in tanks:
    if t['water_type'] == 'saltwater':
        print(t['id'])
        break
")
echo "  Tank ID: $TANK_ID"

# Helper
post_event() {
  curl -sf -X POST "$API/tanks/$TANK_ID/events" -H "$AUTH" -H "$CT" -d "$1" > /dev/null && echo "  + $2" || echo "  ! FAILED: $2"
}

# ── Events from Journal Récifal ──────────────────────────────────
echo "[2/2] Creating events from journal..."

# 2024
post_event '{"title":"Installation osmoseur","event_date":"2024-10-29","event_type":"setup","description":"Mise en place de l'\''osmoseur : préfiltration, membrane et filtre charbon actif. Objectif : eau exempte de silicates, nitrates et métaux lourds."}' "Osmoseur installé"

post_event '{"title":"Démarrage du cycle","event_date":"2024-11-10","event_type":"setup","description":"Lancement du cycle biologique : ajout de pierres vivantes, début de la phase de maturation. Surveillance ammoniaque, nitrites, nitrates."}' "Cycle démarré"

post_event '{"title":"Paramètres cibles établis","event_date":"2024-11-15","event_type":"milestone","description":"Salinité cible 1.024, température 25°C. Approche naturelle, introduction progressive prévue."}' "Paramètres cibles"

post_event '{"title":"Plan de peuplement défini","event_date":"2024-12-26","event_type":"milestone","description":"Ébauche du peuplement : espèces résistantes et récif-compatibles (clowns, gobies, coraux mous). Évaluation de la maturité du bac."}' "Plan peuplement"

# 2025 - Equipment & Setup
post_event '{"title":"Étude pompes de remontée","event_date":"2025-01-28","event_type":"equipment_added","description":"Choix de deux pompes jumelles pour redondance. Débit calculé pour 1,5m de refoulement. Réflexion sécurité et brassage."}' "Pompes remontée"

# March 2025 - First livestock
post_event '{"title":"Premiers poissons et invertébrés","event_date":"2025-03-08","event_type":"livestock_added","description":"Introduction : 2 Amphiprion ocellaris (orange), 1 Valenciennea puellaris, 1 Ecsenius bicolor, Trochus histrio et Nassarius."}' "Premiers poissons"

post_event '{"title":"Disparition Valenciennea puellaris","event_date":"2025-03-11","event_type":"livestock_lost","description":"Valenciennea puellaris disparue, présumée sautée hors du bac."}' "Perte Valenciennea"

post_event '{"title":"Perte Amphiprion ocellaris","event_date":"2025-03-17","event_type":"livestock_lost","description":"1 Amphiprion ocellaris disparu — occlusion intestinale après nourrissage aux vers de grindal (à ne plus faire)."}' "Perte clown"

post_event '{"title":"3ème clown + crevettes","event_date":"2025-03-22","event_type":"livestock_added","description":"Ajout 3ème Amphiprion ocellaris + Lysmata amboinensis + Lysmata wurdemanni."}' "Crevettes ajoutées"

post_event '{"title":"Infestation vers plats identifiée","event_date":"2025-03-28","event_type":"issue","description":"Double infestation : Convolutriloba macropyga (rouge) et Waminoa sp. (beige, sur coraux). Solution naturelle recherchée (Synchiropus, labres)."}' "Vers plats"

post_event '{"title":"Introduction Synchiropus splendidus","event_date":"2025-03-29","event_type":"livestock_added","description":"Synchiropus splendidus blue issu d'\''élevage. Accepte nourritures enrichies, discret les premiers jours."}' "Mandarin ajouté"

post_event '{"title":"Inventaire complet : 17 espèces de coraux","event_date":"2025-04-01","event_type":"milestone","description":"Inventaire détaillé du vivant : 17 espèces de coraux, poissons, crevettes, escargots et vers tubicoles."}' "Inventaire vivant"

post_event '{"title":"Décès Synchiropus splendidus","event_date":"2025-04-04","event_type":"livestock_lost","description":"Mort du mandarin 5-6 jours après introduction. Ne se nourrissait pas malgré microfaune et nourriture enrichie."}' "Perte mandarin"

# May 2025
post_event '{"title":"5 Chromis viridis + Gramma loreto + Stenopus hispidus","event_date":"2025-05-09","event_type":"livestock_added","description":"Ajout de 5 Chromis viridis, 1 Gramma loreto et 1 crevette boxer (Stenopus hispidus). Le Gramma montre des signes de stress — retrouvé mort 2 jours plus tard."}' "Chromis + Gramma"

post_event '{"title":"Décès Gramma loreto (1er)","event_date":"2025-05-11","event_type":"livestock_lost","description":"Gramma loreto probablement affaibli par blessures en magasin. Retrouvé mort."}' "Perte Gramma #1"

post_event '{"title":"Collage gorgone","event_date":"2025-05-13","event_type":"other","description":"Collage gorgone avec colle AFIX bi-composant en immersion. Relâchement temporaire de matière blanchâtre, tient fermement après durcissement."}' "Gorgone collée"

post_event '{"title":"Décès Chromis viridis #1","event_date":"2025-05-15","event_type":"livestock_lost","description":"Chromis en détresse respiratoire sévère. Bain osmotique et isolement en décante sans amélioration. Probable infection branchiale."}' "Perte Chromis #1"

post_event '{"title":"Tache blanche Ecsenius bicolor","event_date":"2025-05-16","event_type":"issue","description":"Possible parasite (Amyloodinium ou Cryptocaryon) ou lésion mécanique. Grattage observé. Piège à poisson préparé."}' "Problème Ecsenius"

post_event '{"title":"Décès Chromis viridis #2","event_date":"2025-05-17","event_type":"livestock_lost","description":"Deuxième Chromis viridis décédée."}' "Perte Chromis #2"

post_event '{"title":"Programmation lumière ReefBreeders Photon V2+","event_date":"2025-05-24","event_type":"equipment_added","description":"Cycle lumineux optimisé pour Acropora : dominante bleue (Royal/Cool Blue), blanc modéré, ramping 10h-21h par paliers de 1h."}' "Lumière programmée"

post_event '{"title":"Ecsenius bicolor rétabli","event_date":"2025-05-29","event_type":"milestone","description":"Le Ecsenius ne montre plus de signes de grattage. Alimentation normale, comportement stable. Aucun traitement administré."}' "Ecsenius guéri"

post_event '{"title":"Gorgone — nécrose et traitement iode","event_date":"2025-05-29","event_type":"issue","description":"Points de nécrose sur gorgone photosynthétique. Bains d'\''iode doux (Bétadine 10%, 1ml/L, 5-10 min) 1x/semaine."}' "Nécrose gorgone"

# June 2025
post_event '{"title":"Maintenance régulière + soin gorgone","event_date":"2025-06-04","event_type":"water_change","description":"Changement d'\''eau 3% (~15L), traitement iode localisé sur gorgone. Siphonnage ciblé du sol."}' "Maintenance"

post_event '{"title":"Introduction Gramma loreto + 2 Pterapogon kauderni","event_date":"2025-06-11","event_type":"livestock_added","description":"1 Gramma loreto + 2 Pterapogon kauderni (cardinaux de Banggai). Acclimatation réussie, intégration harmonieuse."}' "Gramma + Kauderni"

post_event '{"title":"Diatomées après changement lumière","event_date":"2025-06-15","event_type":"issue","description":"Voile marron sur sable (diatomées) après nouveau cycle lumineux ReefBreeders Photon V2+. Filaments bruns sur tissus LPS."}' "Diatomées"

post_event '{"title":"Maintenance approfondie anti-algues","event_date":"2025-06-16","event_type":"cleaning","description":"Changement d'\''eau 25L, nettoyage pompes/écumeur/filtre rouleau. Escargot mort découvert en décante. Charbon actif ajouté."}' "Nettoyage profond"

post_event '{"title":"KH trop bas — coraux mous fermés","event_date":"2025-06-24","event_type":"issue","description":"KH mesuré à 5 dKH (trop bas), Ca 355 ppm, NO₃/PO₄ = 0/0 (ultra-low nutrients). Zoanthus, Discosoma et Kenya Tree fermés."}' "Crise KH"

post_event '{"title":"Correction KH avec Colombo KH+","event_date":"2025-06-25","event_type":"water_change","description":"Ajout 11g Colombo Marine KH+ pour passer de 5 à 6 dKH. Suivi programmé."}' "Correction KH"

post_event '{"title":"Première dose Colombo Nitrate+","event_date":"2025-06-27","event_type":"water_change","description":"5 ml dans zone brassée le soir. NO₃ à 0 ppm, objectif 1-2 ppm pour sortir du régime ULNS."}' "Dose nitrate"

post_event '{"title":"Ajout calcium Aquaforest","event_date":"2025-06-28","event_type":"water_change","description":"60g Aquaforest Calcium dissous dans eau osmosée tiède. Ca corrigé à 445 ppm."}' "Calcium ajouté"

post_event '{"title":"Traitement Dino X lancé — Ostreopsis spp.","event_date":"2025-06-29","event_type":"issue","description":"Dinoflagellés Ostreopsis confirmés au microscope. Dino X 20ml/400L tous les 2 jours pendant 14 jours. Siphonnage quotidien + écumeur max."}' "Traitement dinos"

post_event '{"title":"Stabilisation post Dino X (J+2)","event_date":"2025-07-03","event_type":"water_change","description":"Dinos fortement réduits. Bulleur ajouté, coraux plus ouverts. Salinité 1.021 (un peu basse)."}' "Post Dino X"

# July-August 2025
post_event '{"title":"Retour de vacances — incidents multiples","event_date":"2025-07-27","event_type":"crash","description":"Écumeur arrêté, micron bag colmaté, lumière décante HS, pompe brassage bloquée. Dinos persistent. KH descendu de 9→7 en 20 jours."}' "Crash vacances"

post_event '{"title":"Nouvel écumeur Bubble Magus Curve 7 Elite","event_date":"2025-07-27","event_type":"equipment_added","description":"Installation Bubble Magus Curve 7 Elite pour remplacer ARKA ACS180 en panne. Rodage 3-7 jours."}' "Écumeur remplacé"

post_event '{"title":"Bacto ball + Stability + SeaGel","event_date":"2025-07-31","event_type":"upgrade","description":"Introduction bactéries d'\''ensemancement (Bacto ball), Stability 500ml (1 bouchon/sem), SeaGel 500ml (résine anti-silicates/toxines)."}' "Bactéries ajoutées"

post_event '{"title":"Fin blackout 72h — dinos en recul","event_date":"2025-08-03","event_type":"milestone","description":"Sortie de 72h de blackout. Dinoflagellés très réduits, coraux en meilleur état. Lumière réduite de 50%, culture bactéries lancée."}' "Fin blackout"

post_event '{"title":"Archaster typicus + nourriture vivante","event_date":"2025-08-14","event_type":"livestock_added","description":"1 Archaster typicus (étoile fouisseuse) + gammarus, mysis, copépodes vivants pour renforcer la microfaune et contrer les dinos."}' "Étoile + microfaune"

post_event '{"title":"Réfection osmoseur","event_date":"2025-08-26","event_type":"equipment_added","description":"Remplacement membrane, préfiltre, filtre charbon. Ajout résine supplémentaire. Résultat : 0 ppm."}' "Osmoseur refait"

# September 2025
post_event '{"title":"Nitrates élevés 25 ppm, PO₄ basses","event_date":"2025-09-08","event_type":"issue","description":"NO₃ à 25 ppm, PO₄ à 0.04 ppm. Commencé à monter les nitrates avant GFO pour garder l'\''équilibre."}' "Déséquilibre NO3/PO4"

post_event '{"title":"UV stérilisateur 55W JEBAO installé","event_date":"2025-09-19","event_type":"equipment_added","description":"Installation UV stérilisateur 55W JEBAO pour combattre les dinoflagellés restants."}' "UV installé"

post_event '{"title":"UV efficace — dinos en recul","event_date":"2025-09-22","event_type":"milestone","description":"4 jours après UV : bac va mieux, dinos moins visibles. UV tourne H24. Mg descendu à 1335, correction planifiée."}' "UV fonctionne"

post_event '{"title":"Dinos plus visibles — victoire !","event_date":"2025-09-30","event_type":"milestone","description":"11 jours après UV, dinos ne sont plus visibles. +2h de lumière à basse intensité. NO₃ à 25, PO₄ non détectables — remontée PO₄ nécessaire."}' "Dinos vaincus"

# October 2025
post_event '{"title":"Analyse ATI ICP — iode très bas","event_date":"2025-10-24","event_type":"issue","description":"ICP du 23/10 : iode 20 µg/L (vs 65 cible), KH 9.5 trop haut, NO₃ 24.8, PO₄ 0.14 élevés. Fluor, fer, Mn déficitaires."}' "ICP iode bas"

post_event '{"title":"Correction iode Tropic Marin","event_date":"2025-10-24","event_type":"water_change","description":"Démarrage correction iode (16ml total sur 3 jours). Suspension KH buffer. Correction F, Fe, Mn planifiée."}' "Correction iode"

post_event '{"title":"Stress Stylophora post-iode","event_date":"2025-10-28","event_type":"issue","description":"Stylophora pâli/blanchâtre après correction iode. Changement d'\''eau 20L + charbon actif. Déplacé plus bas. Pause oligo-éléments 5-7 jours."}' "Stress Stylophora"

# November 2025
post_event '{"title":"Correction salinité — densité 1.028","event_date":"2025-11-22","event_type":"water_change","description":"Densité trop élevée à 1.028 causant stress (gorgone fermée, SPS sensibles). Ajout 1,35L eau osmosée → 1.026. Correction Mn et iode micro-dose."}' "Correction salinité"

post_event '{"title":"Calibration hydromètres","event_date":"2025-11-22","event_type":"milestone","description":"Test 3 hydromètres : Grotech ×2 sous-estiment (1.023), ELA France correct (1.025). Réfractomètre calibré avec solution 35 ppt → 1.0255. Bac à 1.0255."}' "Calibration"

# January 2026
post_event '{"title":"Incident osmolateur — retour vacances","event_date":"2026-01-04","event_type":"crash","description":"Panne osmolateur ~48h : salinité montée à 1.028-1.029, température chutée à 21°C. Ajout 20L eau osmosée, correction progressive. Écumeur très rempli. Coraux temporairement fermés."}' "Crash osmolateur"

echo ""
echo "=== Done! ==="
echo "Events seeded for tank: Bac Récifal Principal"
echo "Open the tank detail page to see the timeline."
