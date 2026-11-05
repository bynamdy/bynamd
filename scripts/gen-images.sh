#!/bin/bash
# Bynamdy seed image generation
set -u
DIR=/home/z/my-project/public/images
mkdir -p "$DIR/news" "$DIR/wallpapers" "$DIR/store"
LOG=/home/z/my-project/scripts/gen-images.log
: > "$LOG"

gen() {
  local prompt="$1"; local out="$2"; local size="$3"
  for attempt in 1 2 3; do
    if z-ai image -p "$prompt" -o "$out" -s "$size" >> "$LOG" 2>&1; then
      if [ -s "$out" ]; then echo "OK: $out" >> "$LOG"; return 0; fi
    fi
    echo "RETRY $attempt: $out" >> "$LOG"
    sleep 3
  done
  echo "FAIL: $out" >> "$LOG"; return 1
}

gen "Epic dark gaming setup battle station, ultrawide monitor glowing with red neon light, mechanical keyboard, black room, cinematic atmosphere, red and black color theme, high quality, detailed" "$DIR/hero.png" "1440x720" &

gen "Grand Theft Auto style open world video game cover art, night city skyline with red neon lights, muscle car in foreground, cinematic digital art, high quality" "$DIR/news/city-night.png" "1344x768"
gen "Football soccer video game cover art, player striking ball in packed stadium at night, dramatic red floodlights, dynamic action, digital art, high quality" "$DIR/news/stadium.png" "1344x768"
gen "First person shooter video game art, elite soldier in tactical gear with red glowing visor, dark smoky battlefield, cinematic, high quality, detailed" "$DIR/news/soldier.png" "1344x768"
gen "Dark fantasy action RPG art, knight with greatsword facing giant fire dragon boss in ruined castle, dramatic red and orange lighting, epic digital painting" "$DIR/news/dragon.png" "1344x768"
gen "Esports tournament arena, massive crowd cheering under red stage lights, giant screens, confetti, cinematic wide shot, high quality" "$DIR/news/arena.png" "1344x768"
gen "Mobile gaming setup, smartphone with attachable game controller glowing red, dark background, neon rim light, product photography style, high quality" "$DIR/news/mobile.png" "1344x768"

gen "Cyberpunk warrior on futuristic motorcycle, red neon trails, night city street in rain, cinematic wide wallpaper, red and black theme, ultra detailed" "$DIR/wallpapers/cyber-rider.png" "1344x768"
gen "Epic dark sci-fi warrior in black armor holding glowing red energy sword, dark cathedral background, embers floating, wallpaper composition, ultra detailed" "$DIR/wallpapers/warrior.png" "1344x768"
gen "Supercar racing through neon city at night in rain, red tail light trails, reflections on wet asphalt, cinematic wallpaper, ultra detailed" "$DIR/wallpapers/supercar.png" "1344x768"
gen "Abstract gaming wallpaper, sharp geometric black and red shapes, glowing red particles, dark minimal futuristic design, 4k wallpaper art" "$DIR/wallpapers/abstract-red.png" "1344x768"

gen "Professional gaming headset, matte black with red accents and red LED glow, floating product shot on dark background, studio lighting, high quality product photography" "$DIR/store/headset.png" "1024x1024"
gen "Mechanical gaming keyboard with red backlit keys, black aluminum frame, floating product shot on dark background, studio lighting, high quality product photography" "$DIR/store/keyboard.png" "1024x1024"
gen "Ultralight esports gaming mouse, matte black with red LED strips, floating product shot on dark background, studio lighting, high quality product photography" "$DIR/store/mouse.png" "1024x1024"
gen "Pro wireless gaming controller, black with red thumbsticks and red accents, floating product shot on dark background, studio lighting, high quality product photography" "$DIR/store/controller.png" "1024x1024"
gen "Curved ultrawide gaming monitor displaying abstract red wallpaper, black bezel, red LED backlight glow, dark room product shot, high quality" "$DIR/store/monitor.png" "1024x1024"
gen "Premium gaming chair, black leather with red stitching and red logo, studio product shot on dark background, high quality product photography" "$DIR/store/chair.png" "1024x1024"

wait
echo "ALL DONE" >> "$LOG"
