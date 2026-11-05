/**
 * Bynamdy seed script — populates demo content + admin user.
 * Run with: bun scripts/seed.ts
 * Admin credentials come from ADMIN_EMAIL / ADMIN_PASSWORD env vars.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const daysAgo = (n: number, hourJitter = 0) =>
  new Date(Date.now() - n * 24 * 60 * 60 * 1000 + hourJitter * 60 * 60 * 1000);

async function main() {
  console.log("🌱 Seeding Bnamdy...");

  /* ---------- admin ---------- */
  const email = (process.env.ADMIN_EMAIL || "admin@bynamdy.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";
  const existingAdmin = await db.admin.findUnique({ where: { email } });
  if (!existingAdmin) {
    await db.admin.create({
      data: {
        email,
        passwordHash: await bcrypt.hash(password, 12),
      },
    });
    console.log(`👑 Admin created: ${email} (2FA will be set up on first login at /admin)`);
  } else {
    console.log(`👑 Admin already exists: ${email}`);
  }

  /* ---------- articles ---------- */
  const articles = [
    {
      title: "GTA VI Drops Fall 2026 — Rockstar Confirms Release Window and New Vice City Details",
      category: "releases",
      excerpt:
        "Rockstar has finally locked a release window for Grand Theft Auto VI. Here is everything we know about the return to Vice City, the two playable protagonists and the next-gen features.",
      content: `Rockstar Games has confirmed that **Grand Theft Auto VI** will launch in **Fall 2026**, ending years of speculation. The studio also dropped fresh details about the game's setting and characters.

## A Twin-Protagonist Story in Leonida

For the first time in series history, GTA VI will feature a playable female protagonist, Lucia, alongside her partner Jason. The story unfolds across the sun-soaked state of Leonida — a satirical take on Florida — with Vice City as its crown jewel.

## What's New

- A living, evolving open world that reacts to your choices
- Dynamic traffic, crowds and wildlife systems rebuilt from scratch
- Deeper interiors and enterable businesses than any previous GTA
- A soundtrack curated with artists from across the globe — including Afrobeats stars

## Platforms and Pricing

GTA VI launches first on **PlayStation 5** and **Xbox Series X|S**. A PC version is expected later, following Rockstar's usual pattern. Standard editions are expected at $69.99, with collector editions to be announced.

> "This is the largest, most immersive evolution of the Grand Theft Auto universe yet." — Rockstar Games

Stay locked to Bynamdy — we'll update this page as new trailers and pre-order info drop.`,
      coverImage: "/images/news/city-night.png",
      views: 18420,
      createdAt: daysAgo(0, 3),
    },
    {
      title: "EA FC 26 Title Update: Gameplay Balancing, New Nigerian League Ratings and Patch Notes",
      category: "updates",
      excerpt:
        "EA's latest title update rebalances shooting and goalkeeping, fixes the low-driven shot meta and adds refreshed ratings for Nigerian league standouts.",
      content: `EA has rolled out **Title Update 4** for EA SPORTS FC 26 across all platforms, and it's a big one for competitive players.

## Gameplay Changes

- **Low-driven shots nerfed** — reduced accuracy from distance to end the meta spam
- **Goalkeeper positioning improved**, especially on near-post shots
- **Through-ball physics** tuned for more realistic weight
- Counter-attack AI slightly less aggressive on World Class and above

## Ultimate Team

Squad Battles rewards have been bumped, and the new **Nigeria League TOTW** brings upgraded cards for standouts in the NPFL, a first for the franchise. Expect entries from Enyimba, Remo Stars and Rangers International.

## Bug Fixes

- Fixed the moment where the ball would pass through a defender's legs on rare animations
- Stadium crowd audio no longer cuts out after substitutions
- Pro Clubs kit clash issues resolved

The update is live now on PC, PlayStation and Xbox. Mobile players get the refresh later this week.`,
      coverImage: "/images/news/stadium.png",
      views: 9350,
      createdAt: daysAgo(1, 6),
    },
    {
      title: "Call of Duty: Black Ops 7 Multiplayer Reveal — Omnimovement 2.0 and Launch Maps",
      category: "news",
      excerpt:
        "Treyborn reveals Omnimovement 2.0, 16 launch maps and the return of the fan-favorite Nuketown. Beta access opens next month for anyone who pre-orders.",
      content: `Activision and Treyarch have pulled the curtain off **Call of Duty: Black Ops 7** multiplayer, and the headline is **Omnimovement 2.0** — an evolution of last year's omni-directional sprint system that now includes wall-dashes and mid-air weapon swaps.

## Launch Content

- **16 multiplayer maps** at launch, including a reimagined Nuketown
- **6v6 and 2v2 modes** with a dedicated ranked playlist
- **Zombies**: round-based mode returns with a dark-ops storyline
- Loadout system reworked with new Wildcards

## Beta Details

The early access beta runs next month for players who pre-order, with an open beta weekend following for everyone. Nigerians on mobile can look forward to a separate **COD Mobile Season 12** crossover event with exclusive BO7-themed skins.

## Monetization

Activision confirmed no pay-to-win mechanics; the battle pass returns with double XP tokens earnable in-game.`,
      coverImage: "/images/news/soldier.png",
      views: 12100,
      createdAt: daysAgo(2, 2),
    },
    {
      title: "Elden Ring: Nightreign Co-op Expansion Announced With Three New Bosses",
      category: "news",
      excerpt:
        "FromSoftware is expanding Nightreign with a free co-op expansion: three new Nightlords, a fresh map region and cross-play improvements arrive this winter.",
      content: `FromSoftware announced the first major expansion for **Elden Ring: Nightreign**, and it is packed.

## What's Coming

- **Three new Nightlord bosses**, each with multi-phase fights designed for three-player squads
- A new region — the Ashen Highlands — with vertical dungeons and underground rivers
- **Duo play** gets a dedicated balancing pass, so two-player runs finally feel fair
- Cross-play between platforms improves with ping and marker systems

## Free for All Players

The base expansion is free, with a cosmetic supporter pack sold separately. FromSoftware also teased a harder "Deep Night" difficulty that scales boss aggression for veteran squads.

The expansion lands this winter. In the meantime, patch 1.08 goes live next week with performance fixes on PC.`,
      coverImage: "/images/news/dragon.png",
      views: 7420,
      createdAt: daysAgo(3, 5),
    },
    {
      title: "Free Fire World Series Lagos: 12 African Teams Qualify for the Global Finals",
      category: "news",
      excerpt:
        "The Free Fire esports scene in Africa is booming — twelve teams from Nigeria, Ghana, Kenya and Egypt have qualified for the World Series global finals.",
      content: `Mobile esports in Africa just hit a new milestone. The **Free Fire World Series regional qualifiers** concluded in Lagos with a record 40,000 concurrent viewers.

## Nigeria's Contingent

Five Nigerian teams booked their tickets, headlined by Lagos-based squad **Red Hawks**, who swept the final three matches. Remo, Abuja and Port Harcourt squads round out the roster.

## What's Next

- Global finals streamed live next quarter with a $1M prize pool
- Watch parties confirmed for Lagos, Nairobi and Accra
- In-game donation items let fans support their teams

Garena also announced server upgrades for West Africa, promising reduced ping for Nigerian players — a huge quality-of-life win.`,
      coverImage: "/images/news/arena.png",
      views: 5210,
      createdAt: daysAgo(4, 1),
    },
    {
      title: "Best Mobile Game Controllers 2026: Backbone, Gamesir and Razer Tested",
      category: "updates",
      excerpt:
        "We tested the latest mobile controllers for iOS and Android to find the best for cloud gaming, COD Mobile and emulators — including budget picks under $30.",
      content: `Mobile gaming is serious business — especially in Nigeria where phones are the primary gaming device. We spent three weeks testing the newest controllers.

## The Winners

**Backbone One (2nd Gen)** — best overall for iPhone. Ultra-low latency, great build, and the companion app is genuinely useful.

**Gamesir G8 Galileo** — best for Android, including the titanium-braced version for larger phones. Works beautifully with cloud gaming and COD Mobile.

**Razer Kishi V2** — solid middle ground with excellent software support.

## Budget Pick

Under $30, the **Gamesir T4 Cyclone** is the value king — hall-effect sticks and 20+ hour battery.

## What to Look For

- Hall-effect thumbsticks (no drift, ever)
- Pass-through charging
- Low Bluetooth latency (under 15ms) if wireless

Check our Store page for current prices and links.`,
      coverImage: "/images/news/mobile.png",
      views: 3980,
      createdAt: daysAgo(5, 4),
    },
  ];

  for (const a of articles) {
    await db.article.upsert({
      where: { slug: a.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) },
      update: {},
      create: {
        ...a,
        slug: a.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80),
        seoTitle: a.title.slice(0, 60),
        seoDescription: a.excerpt.slice(0, 155),
        published: true,
      },
    });
  }
  console.log(`📰 ${articles.length} articles seeded`);

  /* ---------- cheat codes ---------- */
  const codes: { gameTitle: string; platform: string; code: string; effect: string; details: string }[] = [
    // GTA V — PC
    { gameTitle: "GTA V", platform: "PC", code: "PAINKILLER", effect: "God mode — invincibility for 5 minutes", details: "Press **T** (or the chat console key) in-game, type the code and hit Enter. Works in single-player only. Timers refresh each time you re-enter it." },
    { gameTitle: "GTA V", platform: "PC", code: "HOTHANDS", effect: "Explosive melee attacks", details: "Open the in-game console with **T**, type the code, press Enter. Every punch detonates — be careful near vehicles." },
    { gameTitle: "GTA V", platform: "PC", code: "SKYFALL", effect: "Spawn in mid-air (skydive respawn)", details: "Type in console. Your character respawns mid-air for an instant skydive — pull the parachute or fast-travel to survive." },
    { gameTitle: "GTA V", platform: "PlayStation", code: "Circle, L1, Triangle, R2, X, Square, Circle, Right, Square, L1, L1, L1", effect: "Full health and armor", details: "Enter quickly during gameplay (not in menus). Your health and armor refill instantly." },
    { gameTitle: "GTA V", platform: "Xbox", code: "Y, RT, RB, LT, Left, Right, LB, LT", effect: "Super jump", details: "Enter the button sequence during gameplay. Jump becomes enormous — combine with skyfall for chaos." },
    // GTA San Andreas — Mobile
    { gameTitle: "GTA: San Andreas", platform: "Mobile", code: "LXGIWYL", effect: "Weapon set 1 (thugs arsenal)", details: "On mobile, tap the on-screen keyboard icon during gameplay, type the code, and confirm. Cheat input works like the PC version." },
    { gameTitle: "GTA: San Andreas", platform: "Mobile", code: "AEZAKMI", effect: "Never wanted — clear and freeze wanted level", details: "Type via the in-game keyboard. Police ignore you completely; great for free-roam exploration." },
    // EA FC 26
    { gameTitle: "EA SPORTS FC 26", platform: "PlayStation", code: "Up, Up, Left, Right, Down, Square at team select", effect: "Classic stadium unlock (retro venues)", details: "Entered at the **team select** screen in Kick Off mode. Unlocks a pack of legacy stadiums for the match." },
    // COD
    { gameTitle: "Call of Duty: Black Ops", platform: "PC", code: "3ARC INTEL", effect: "Unlock all intel in the campaign", details: "On the main menu, sit in the interrogation chair (press space repeatedly), then use the terminal on the wall and type `3ARC INTEL`." },
    { gameTitle: "Call of Duty: Warzone Mobile", platform: "Mobile", code: "ARMORY25", effect: "Redeem code — free weapon charm + XP token", details: "Go to **Settings → Redeem Code** in-game and enter the code. Limited-time promo code; new accounts only." },
    // Minecraft
    { gameTitle: "Minecraft", platform: "PC", code: "/gamemode creative", effect: "Switch to Creative mode (infinite blocks)", details: "Enable cheats when creating the world (or `/op` yourself on a server), open chat with **T** and run the command. `/gamemode survival` switches back." },
    { gameTitle: "Minecraft", platform: "Mobile", code: "/give @s diamond 64", effect: "Get 64 diamonds instantly", details: "Enable **Cheats** in world settings, open chat (speech bubble icon) and run the command. Works on Bedrock phones and tablets." },
    // Mortal Kombat 1
    { gameTitle: "Mortal Kombat 1", platform: "PlayStation", code: "D, D, D + Square at VS screen", effect: "Unlock the retro arcade demo (Invasions bonus)", details: "Entered on the **VS loading screen** during Invasions season events. Unlocks a bonus retro stage this season." },
    // PUBG Mobile
    { gameTitle: "PUBG Mobile", platform: "Mobile", code: "PGMXMAS2026", effect: "Redeem code — parachute skin + 30 UC", details: "Open the **Events → Redeem** page on the official PUBG Mobile site, log in, paste the code. Promo codes expire fast — redeem today." },
    // Elden Ring
    { gameTitle: "Elden Ring", platform: "Xbox", code: "RUNE-ARC-DUPE (glitch)", effect: "Duplicate Rune Arcs at any Site of Grace", details: "With a Rune Arc equipped, open the menu and store it **exactly as you rest** — timing the storage with the rest animation duplicates it. May be patched; works as of patch 1.07." },
  ];

  let i = 0;
  for (const c of codes) {
    const slug = `${c.gameTitle}-${c.effect}`
      .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 70) + `-${i++}`;
    await db.cheatCode.upsert({
      where: { slug },
      update: {},
      create: { ...c, slug, views: Math.floor(Math.random() * 8000) + 500 },
    });
  }
  console.log(`🎮 ${codes.length} cheat codes seeded`);

  /* ---------- wallpapers ---------- */
  const wallpapers = [
    { title: "Neon Rider", category: "Sci-Fi", imageUrl: "/images/wallpapers/cyber-rider.png", resolution: "3840x2160", featured: true, downloads: 3120 },
    { title: "Crimson Warrior", category: "Games", imageUrl: "/images/wallpapers/warrior.png", resolution: "3840x2160", featured: true, downloads: 2450 },
    { title: "Midnight Run", category: "Cars", imageUrl: "/images/wallpapers/supercar.png", resolution: "3840x2160", featured: false, downloads: 1890 },
    { title: "Red Geometry", category: "Abstract", imageUrl: "/images/wallpapers/abstract-red.png", resolution: "3840x2160", featured: false, downloads: 940 },
  ];
  for (const w of wallpapers) {
    const slug = w.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    await db.wallpaper.upsert({ where: { slug }, update: {}, create: { ...w, slug } });
  }
  console.log(`🖼️ ${wallpapers.length} wallpapers seeded`);

  /* ---------- freebies ---------- */
  const freebies = [
    { title: "Rocket League — 100% Free on Epic", type: "free", description: "Soccer meets driving in one of the most fun multiplayer games ever. Claim it permanently free on Epic Games Store this week.", platform: "Epic Games · PC", url: "https://store.epicgames.com/en-US/p/rocket-league", priceOriginal: "$19.99", priceDeal: "Free", endsAt: daysAgo(-6) },
    { title: "Genshin Impact Starter Giveaway", type: "giveaway", description: "50 lucky winners get starter packs with Primogems and mora. Follow and drop your UID to enter.", platform: "Multi", url: "https://genshin.hoyoverse.com/en/", priceDeal: "Free entry", endsAt: daysAgo(-10) },
    { title: "Steam Autumn Sale — up to 85% off", type: "deal", description: "Massive discounts on Elden Ring, Cyberpunk 2077 and thousands more. Nigerian gamers can pay in USD via debit cards.", platform: "Steam · PC", url: "https://store.steampowered.com/sale/autumn", priceOriginal: "From $59.99", priceDeal: "From $8.99", endsAt: daysAgo(-14) },
    { title: "Xbox Game Pass Ultimate — 3 Months Deal", type: "deal", description: "Hundreds of games on console, PC and cloud. New subscribers get the first 3 months heavily discounted.", platform: "Xbox · PC · Cloud", url: "https://www.xbox.com/xbox-game-pass", priceOriginal: "$49.99", priceDeal: "$29.99", endsAt: daysAgo(-30) },
    { title: "Prime Gaming — Free Indie Bundle", type: "free", description: "Amazon Prime members can claim a bundle of 5 indie games this month, yours to keep forever.", platform: "Prime Gaming · PC", url: "https://gaming.amazon.com", priceDeal: "Free with Prime", endsAt: daysAgo(-20) },
  ];
  for (const f of freebies) {
    const exists = await db.freebie.findFirst({ where: { title: f.title } });
    if (!exists) await db.freebie.create({ data: f });
  }
  console.log(`🎁 ${freebies.length} freebies seeded`);

  /* ---------- products (placeholder affiliate links) ---------- */
  const products = [
    { name: "Bynamdy Crimson Pro Wireless Headset", brand: "Bynamdy Picks", category: "Headsets", description: "7.1 surround, 40-hour battery and a noise-cancelling boom mic. Tuned for footsteps — hear them coming before they hear you.", price: 79.99, oldPrice: 109.99, imageUrl: "/images/store/headset.png", affiliateUrl: "https://www.amazon.com/dp/EXAMPLE1?tag=bynamdy-20", featured: true },
    { name: "Redline K87 Mechanical Keyboard", brand: "Redline", category: "Keyboards", description: "Hot-swappable red switches, aluminium frame and per-key RGB. Full N-key rollover for zero dropped inputs.", price: 64.99, oldPrice: 89.99, imageUrl: "/images/store/keyboard.png", affiliateUrl: "https://www.amazon.com/dp/EXAMPLE2?tag=bynamdy-20", featured: true },
    { name: "Viperlight Esports Mouse", brand: "Viperlight", category: "Mice", description: "55g ultralight shell, 26K DPI optical sensor and 90-hour battery. The same shape the pros grind ranked with.", price: 49.99, oldPrice: 69.99, imageUrl: "/images/store/mouse.png", affiliateUrl: "https://www.amazon.com/dp/EXAMPLE3?tag=bynamdy-20", featured: false },
    { name: "Nexus Pro Wireless Controller", brand: "Nexus", category: "Controllers", description: "Hall-effect sticks that never drift, back paddles and trigger stops. Works on PC, phone and cloud gaming.", price: 59.99, oldPrice: null, imageUrl: "/images/store/controller.png", affiliateUrl: "https://www.amazon.com/dp/EXAMPLE4?tag=bynamdy-20", featured: false },
    { name: "Ultraview 34\" Curved Gaming Monitor", brand: "Ultraview", category: "Monitors", description: "Ultrawide 165Hz QHD panel with 1ms response. Wraparound immersion for shooters and sim racing.", price: 329.99, oldPrice: 429.99, imageUrl: "/images/store/monitor.png", affiliateUrl: "https://www.amazon.com/dp/EXAMPLE5?tag=bynamdy-20", featured: true },
    { name: "Throne X Ergonomic Gaming Chair", brand: "Throne", category: "Chairs", description: "Cold-cure foam, magnetic head pillow and reclining backrest up to 155°. Built for 8-hour ranked sessions.", price: 189.99, oldPrice: 259.99, imageUrl: "/images/store/chair.png", affiliateUrl: "https://www.amazon.com/dp/EXAMPLE6?tag=bynamdy-20", featured: false },
  ];
  for (const p of products) {
    const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    await db.product.upsert({ where: { slug }, update: {}, create: { ...p, slug } });
  }
  console.log(`🛒 ${products.length} products seeded`);

  /* ---------- sample contact message ---------- */
  const sampleMsg = await db.contactMessage.findFirst({ where: { email: "daniel.okafor@example.com" } });
  if (!sampleMsg) {
    await db.contactMessage.create({
      data: {
        name: "Daniel Okafor",
        email: "daniel.okafor@example.com",
        subject: "Partnership — Lagos gaming lounge",
        message:
          "Hi Bnamdy team! We run a gaming lounge in Lekki with 20 PCs and would love to partner on tournaments and content. Can we schedule a call next week?",
      },
    });
    console.log("📬 1 sample message seeded");
  }

  /* ---------- page views (last 14 days) so the chart looks alive ---------- */
  const paths = ["/", "/news", "/codes", "/wallpapers", "/freebies", "/store", "/about", "/contact"];
  const count = await db.pageView.count();
  if (count === 0) {
    for (let d = 13; d >= 0; d--) {
      const day = daysAgo(d).toISOString().slice(0, 10);
      for (const path of paths) {
        const base = path === "/" ? 180 : path === "/codes" ? 120 : 40;
        const c = Math.floor(Math.random() * base) + Math.floor(base / 2);
        await db.pageView.create({ data: { day, path, count: c } });
      }
    }
    console.log("📈 Page view history seeded (14 days)");
  }

  console.log("✅ Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
