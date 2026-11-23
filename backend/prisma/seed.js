const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const bcrypt = require("bcrypt");
const prisma = require("../src/db");

async function seed() {
  console.log("=================================================");
  console.log("   PodSphere Database Seeding (Evaluation Demo)");
  console.log("=================================================\n");

  const summary = {
    usersCreated: 0,
    usersUpdated: 0,
    usersExisting: 0,
    studiosCreated: 0,
    studiosUpdated: 0,
    studiosExisting: 0,
    studiosSkipped: 0,
    bookingsCreated: 0,
    bookingsUpdated: 0,
    bookingsExisting: 0,
    bookingsSkipped: 0
  };

  // 1. Demo User Accounts with verified roles and credentials
  const demoUsersData = [
    {
      name: "Rajesh Sharma",
      email: "delhi.host@podsphere.demo",
      password: "DemoHost123!",
      role: "PROVIDER"
    },
    {
      name: "Priya Malhotra",
      email: "noida.host@podsphere.demo",
      password: "DemoHost123!",
      role: "PROVIDER"
    },
    {
      name: "Aditya Creator",
      email: "creator.demo@podsphere.demo",
      password: "DemoCreator123!",
      role: "USER"
    }
  ];

  const userMap = {};

  for (const uData of demoUsersData) {
    let user = await prisma.user.findUnique({
      where: { email: uData.email }
    });

    if (!user) {
      const passwordHash = await bcrypt.hash(uData.password, 10);
      user = await prisma.user.create({
        data: {
          name: uData.name,
          email: uData.email,
          passwordHash: passwordHash,
          role: uData.role
        }
      });
      summary.usersCreated++;
      console.log(`[+] Created demo user: ${user.email} (${user.role})`);
    } else {
      // Verify existing demo user role and password match documented credentials
      let needsUpdate = false;
      const updateData = {};

      if (user.role !== uData.role) {
        updateData.role = uData.role;
        needsUpdate = true;
      }

      const passwordMatches = await bcrypt.compare(uData.password, user.passwordHash);
      if (!passwordMatches) {
        updateData.passwordHash = await bcrypt.hash(uData.password, 10);
        needsUpdate = true;
      }

      if (needsUpdate) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: updateData
        });
        summary.usersUpdated++;
        console.log(`[*] Updated demo user credentials/role: ${user.email} (${user.role})`);
      } else {
        summary.usersExisting++;
        console.log(`[=] Verified existing demo user: ${user.email} (${user.role})`);
      }
    }

    userMap[uData.email] = user;
  }

  const rajeshId = userMap["delhi.host@podsphere.demo"].id;
  const priyaId = userMap["noida.host@podsphere.demo"].id;
  const demoProviderIds = new Set([rajeshId, priyaId]);

  // 2. Realistic Indian Demo Studios with Stable UUIDs and Provider Ownership Guard
  const demoStudios = [
    {
      stableId: "a09fc8eb-026d-495d-aacf-31821c00f7ea",
      name: "Echo Broadcast Space",
      providerId: rajeshId,
      city: "Delhi",
      address: "Suite 402, Okhla Phase III, Industrial Area, New Delhi",
      hourlyRate: 1500,
      description: "Treated acoustic broadcast space with multi-camera live switching, Shure vocal microphones, and dedicated soundproof booth.",
      gear: ["4x Shure SM7B", "Rodecaster Pro II", "2x Blackmagic Pocket Cinema 4K", "Acoustic Vocal Booth", "Headphone Distribution Amp"],
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAY5Js5asS-K45ETzqtnRCzez9QWi4Sf9mwbsY7UZTFsPEh_BK_4nfW"
    },
    {
      stableId: "05c8caef-b4b3-4ad9-8704-31ad0c0a07a6",
      name: "CyberHub Creator Suite",
      providerId: rajeshId,
      city: "Gurugram",
      address: "Building 10B, DLF Cyber City, Sector 24, Gurugram",
      hourlyRate: 2400,
      description: "Modern corporate podcast studio built for executive fireside chats, startup interviews, and 4K livestreaming.",
      gear: ["3x Sony FX3 Rig", "Shure SM7B Mics", "Aputure 300d II Lighting", "Blackmagic ATEM Mini Pro", "Sennheiser Wireless Lavs"],
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuA7oQaCfARyz3Z5Cfvozlp6-tuYUO8fjPj8HPPQ2HqOrrFpyXFTLQZO"
    },
    {
      stableId: "12953768-62c4-4284-946c-ef958d78c781",
      name: "Sector 62 Production Den",
      providerId: priyaId,
      city: "Noida",
      address: "Plot B-8, Electronic City, Sector 62, Noida",
      hourlyRate: 1650,
      description: "Spacious multi-guest podcast set featuring RGB accent backdrops, acoustic diffusers, and 4-channel audio recording.",
      gear: ["4x Electro-Voice RE20", "Zoom PodTrak P8", "Nanlite Forza 60B", "Teleprompter Display", "Sony A7 IV"],
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDwSJXATKVh9I1RBqYTP7GErc6Dbo65xLusVDBfm8AQyzatSqj0pnxF"
    },
    {
      stableId: "4433483c-a5f2-4b67-863d-dcc59fb44ca3",
      name: "Hauz Khas Acoustic Lounge",
      providerId: rajeshId,
      city: "Delhi",
      address: "24 Hauz Khas Village, Near Deer Park, New Delhi",
      hourlyRate: 1800,
      description: "Warm, aesthetic conversation setup with bohemian interior styling, ideal for storytelling, culture podcasts, and intimate duos.",
      gear: ["2x Warm Audio WA-87", "Universal Audio Apollo Twin X", "Warm LED Practical Lamps", "Sony A7S III"],
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAEvzgoHSksFevM3QCZlQq8ygmEOfw03mZjThQWh83DqG_tAJzF2RIt"
    },
    {
      stableId: "7d2deb33-e075-4621-9d09-b3972052509b",
      name: "Koramangala Audio Lab",
      providerId: priyaId,
      city: "Bengaluru",
      address: "77 Koramangala 4th Block, 80 Feet Road, Bengaluru",
      hourlyRate: 2100,
      description: "Tech founder podcast hub featuring floating wood floors, high-end condenser mics, and optical gigabit fiber for remote dialing.",
      gear: ["4x Neumann TLM-103", "Universal Audio Apollo x8p", "Genelec 8030C Monitors", "Logitech PTZ 4K Camera"],
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCw4PIrLPmOCbYeQtk3oslrsn24gFFAZ9mSHI93sbWoXEp2AdK05of05hatH_5UWfBma51faaJWCDqvOsvVT0VIaDFj1w5gAH7pCHjV0ZuK-xqmrlYvDbNIb105zRwzGh_Z1sikeI7oRlMTMvm5oYLWORDpxPb3rAtqBKHPRSOgGRfp6i51Sl7Cx1gwIha3g863zZF80OEDdiRZ5aMX4ES9Tz_mvpgL8ijAVko8iBl8tyl2cHu752g"
    },
    {
      stableId: "d6765d98-814e-43f6-a6ed-bac0a22346f8",
      name: "Film City Stage 4 Soundstage",
      providerId: priyaId,
      city: "Mumbai",
      address: "Stage 4, Film City Complex, Goregaon East, Mumbai",
      hourlyRate: 3200,
      description: "High-ceiling broadcast stage engineered for premium video productions, panel shows, and celebrity roundtables.",
      gear: ["4x Sennheiser MKH 416", "Allen & Heath SQ-5 Console", "3x Sony FX6 Cinema Cameras", "Arri Skypanel S60-C"],
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuA7oQaCfARyz3Z5Cfvozlp6-tuYUO8fjPj8HPPQ2HqOrrFpyXFTLQZO"
    },
    {
      stableId: "030ce37e-0e3d-48bd-bfa6-fb949f75007b",
      name: "Indiranagar Sound Sanctuary",
      providerId: priyaId,
      city: "Bengaluru",
      address: "100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru",
      hourlyRate: 1950,
      description: "State-of-the-art voiceover and audiobook recording booth with zero ambient noise and Neumann U87 microphone.",
      gear: ["Neumann U87 Ai", "Avalon VT-737sp Preamp", "Auralex Max-Wall Sound Panels", "Beyerdynamic DT 770 Pro"],
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDwSJXATKVh9I1RBqYTP7GErc6Dbo65xLusVDBfm8AQyzatSqj0pnxF"
    },
    {
      stableId: "8edefe60-960f-40fd-b259-c8daeca464f1",
      name: "Bandra Coast Studio",
      providerId: rajeshId,
      city: "Mumbai",
      address: "Pali Hill Road, Bandra West, Mumbai",
      hourlyRate: 2600,
      description: "Boutique creative studio featuring sea-breeze natural lighting, motorized sit-stand podcast desks, and 4K livestream switching.",
      gear: ["2x Shure SM7B", "Rode Wireless PRO", "2x Canon C70 Cameras", "Rodecaster Video Console"],
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAY5Js5asS-K45ETzqtnRCzez9QWi4Sf9mwbsY7UZTFsPEh_BK_4nfW"
    },
    {
      stableId: "97481d34-dfc5-4775-8d56-5d75edc82153",
      name: "Connaught Place Media Hub",
      providerId: rajeshId,
      city: "Delhi",
      address: "Inner Circle, Block C, Connaught Place, New Delhi",
      hourlyRate: 2000,
      description: "Central Delhi podcast and interview recording room with heritage architectural aesthetics and whisper-quiet HVAC.",
      gear: ["3x Shure MV7+", "Focusrite Clarett+ 8Pre", "Godox SL-60W Video Lights", "4K Sony Alpha Kit"],
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAEvzgoHSksFevM3QCZlQq8ygmEOfw03mZjThQWh83DqG_tAJzF2RIt"
    },
    {
      stableId: "1acebfb9-fda2-4bae-a63f-d1f8a8c2a325",
      name: "Golf Course Road PodLab",
      providerId: rajeshId,
      city: "Gurugram",
      address: "One Horizon Centre, Golf Course Road, Sector 43, Gurugram",
      hourlyRate: 2800,
      description: "Executive podcast lounge designed for venture capital, technology, and finance podcasts with custom branding lightboxes.",
      gear: ["4x Shure KSM8 Dualdyne", "Rodecaster Pro II", "3x Sony FX3 Cinema Cameras", "Elgato Prompter", "Aputure Amaran 200x"],
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCw4PIrLPmOCbYeQtk3oslrsn24gFFAZ9mSHI93sbWoXEp2AdK05of05hatH_5UWfBma51faaJWCDqvOsvVT0VIaDFj1w5gAH7pCHjV0ZuK-xqmrlYvDbNIb105zRwzGh_Z1sikeI7oRlMTMvm5oYLWORDpxPb3rAtqBKHPRSOgGRfp6i51Sl7Cx1gwIha3g863zZF80OEDdiRZ5aMX4ES9Tz_mvpgL8ijAVko8iBl8tyl2cHu752g"
    }
  ];

  const studioMap = {};

  for (const s of demoStudios) {
    // 1. First, search by stable UUID
    let existing = await prisma.studio.findUnique({
      where: { id: s.stableId }
    });

    // Safety guard: if studio found by stable UUID belongs to a different provider, do NOT modify it!
    if (existing && existing.providerId !== s.providerId) {
      console.log(`[!] Studio with ID ${s.stableId} belongs to a different provider (${existing.providerId}). Skipping overwrite.`);
      summary.studiosSkipped++;
      continue;
    }

    // 2. If not found by stable UUID, search by name strictly owned by this demo provider
    if (!existing) {
      existing = await prisma.studio.findFirst({
        where: {
          name: s.name,
          providerId: s.providerId
        }
      });
    }

    // Safety guard: if a studio with this name belongs to a real (non-demo) user, DO NOT overwrite or reassign it!
    const realUserStudio = await prisma.studio.findFirst({
      where: {
        name: s.name,
        providerId: { notIn: Array.from(demoProviderIds) }
      }
    });

    if (realUserStudio && (!existing || existing.id === realUserStudio.id)) {
      console.log(`[!] Studio "${s.name}" belongs to real user account (${realUserStudio.providerId}). Skipping overwrite to preserve user data.`);
      summary.studiosSkipped++;
      continue;
    }

    if (!existing) {
      const created = await prisma.studio.create({
        data: {
          id: s.stableId,
          name: s.name,
          providerId: s.providerId,
          city: s.city,
          address: s.address,
          hourlyRate: s.hourlyRate,
          description: s.description,
          gear: s.gear,
          imageUrl: s.imageUrl
        }
      });
      summary.studiosCreated++;
      studioMap[s.name] = created;
      console.log(`[+] Created demo studio: "${created.name}" in ${created.city} (₹${created.hourlyRate}/hr)`);
    } else {
      // Check if existing record is already up to date
      const isIdentical =
        existing.name === s.name &&
        existing.providerId === s.providerId &&
        existing.city === s.city &&
        existing.address === s.address &&
        Number(existing.hourlyRate) === s.hourlyRate &&
        existing.description === s.description &&
        existing.imageUrl === s.imageUrl &&
        JSON.stringify(existing.gear) === JSON.stringify(s.gear);

      if (isIdentical) {
        summary.studiosExisting++;
        studioMap[s.name] = existing;
        console.log(`[=] Verified existing demo studio: "${existing.name}" in ${existing.city}`);
      } else {
        const updated = await prisma.studio.update({
          where: { id: existing.id },
          data: {
            name: s.name,
            providerId: s.providerId,
            city: s.city,
            address: s.address,
            hourlyRate: s.hourlyRate,
            description: s.description,
            gear: s.gear,
            imageUrl: s.imageUrl
          }
        });
        summary.studiosUpdated++;
        studioMap[s.name] = updated;
        console.log(`[*] Updated demo studio: "${updated.name}" in ${updated.city}`);
      }
    }
  }

  // 3. Realistic Demo Bookings with Safe Resolution & Ownership Protection
  const creatorId = userMap["creator.demo@podsphere.demo"].id;

  const sampleBookingsConfig = [
    {
      stableId: "47c441b3-cee5-4290-9826-d459150de038",
      targetStudioName: "Echo Broadcast Space",
      expectedProviderId: rajeshId,
      creatorId: creatorId,
      // 2026-11-26 10:00 AM - 12:00 PM IST (04:30 - 06:30 UTC)
      startTime: new Date("2026-11-26T04:30:00.000Z"),
      endTime: new Date("2026-11-26T06:30:00.000Z"),
      totalAmount: 3000,
      status: "PENDING"
    },
    {
      stableId: "2e5ecbd8-6551-400a-ab50-5a4a663fa067",
      targetStudioName: "CyberHub Creator Suite",
      expectedProviderId: rajeshId,
      creatorId: creatorId,
      // 2026-11-27 02:00 PM - 04:00 PM IST (08:30 - 10:30 UTC)
      startTime: new Date("2026-11-27T08:30:00.000Z"),
      endTime: new Date("2026-11-27T10:30:00.000Z"),
      totalAmount: 4800,
      status: "CONFIRMED"
    },
    {
      stableId: "3f99aa12-11bb-44cc-88dd-112233445566",
      targetStudioName: "Sector 62 Production Den",
      expectedProviderId: priyaId,
      creatorId: creatorId,
      // 2026-11-28 10:00 AM - 12:00 PM IST (04:30 - 06:30 UTC)
      startTime: new Date("2026-11-28T04:30:00.000Z"),
      endTime: new Date("2026-11-28T06:30:00.000Z"),
      totalAmount: 3300,
      status: "PENDING"
    }
  ];

  for (const b of sampleBookingsConfig) {
    // Dynamically resolve target studio; never assume presence or crash on undefined
    let targetStudio = studioMap[b.targetStudioName];
    if (!targetStudio) {
      targetStudio = await prisma.studio.findFirst({
        where: {
          name: b.targetStudioName,
          providerId: b.expectedProviderId
        }
      });
    }

    if (!targetStudio) {
      console.log(`[!] Required demo studio "${b.targetStudioName}" could not be resolved. Skipping sample booking safely.`);
      summary.bookingsSkipped++;
      continue;
    }

    // 1. Search by stable UUID
    let existing = await prisma.booking.findUnique({
      where: { id: b.stableId }
    });

    // Safety guard: if booking found by stableId belongs to a different creator or studio, DO NOT overwrite!
    if (existing && (existing.creatorId !== b.creatorId || existing.studioId !== targetStudio.id)) {
      console.log(`[!] Booking ${existing.id} belongs to a different creator or studio. Skipping overwrite.`);
      summary.bookingsSkipped++;
      continue;
    }

    // 2. If not found by stable ID, check by composite unique parameters (studio, creator, start time)
    if (!existing) {
      existing = await prisma.booking.findFirst({
        where: {
          studioId: targetStudio.id,
          creatorId: b.creatorId,
          startTime: b.startTime
        }
      });
    }

    if (!existing) {
      await prisma.booking.create({
        data: {
          id: b.stableId,
          studioId: targetStudio.id,
          creatorId: b.creatorId,
          startTime: b.startTime,
          endTime: b.endTime,
          totalAmount: b.totalAmount,
          status: b.status
        }
      });
      summary.bookingsCreated++;
      console.log(`[+] Created sample demo booking: ${b.status} for studio "${targetStudio.name}"`);
    } else {
      // Check if existing sample booking is already identical
      const isBkIdentical =
        new Date(existing.startTime).getTime() === new Date(b.startTime).getTime() &&
        new Date(existing.endTime).getTime() === new Date(b.endTime).getTime() &&
        existing.status === b.status &&
        Number(existing.totalAmount) === b.totalAmount;

      if (isBkIdentical) {
        summary.bookingsExisting++;
        console.log(`[=] Verified existing sample booking: ${existing.id} (${b.status})`);
      } else {
        await prisma.booking.update({
          where: { id: existing.id },
          data: {
            startTime: b.startTime,
            endTime: b.endTime,
            totalAmount: b.totalAmount,
            status: b.status
          }
        });
        summary.bookingsUpdated++;
        console.log(`[*] Updated sample booking to evaluation date: ${existing.id} (${b.status})`);
      }
    }
  }

  console.log("\n=================================================");
  console.log("   Seeding Completed Successfully");
  console.log("=================================================");
  console.log(`Users:    ${summary.usersCreated} created, ${summary.usersUpdated} updated, ${summary.usersExisting} verified existing`);
  console.log(`Studios:  ${summary.studiosCreated} created, ${summary.studiosUpdated} updated, ${summary.studiosExisting} verified existing, ${summary.studiosSkipped} skipped`);
  console.log(`Bookings: ${summary.bookingsCreated} created, ${summary.bookingsUpdated} updated, ${summary.bookingsExisting} verified existing, ${summary.bookingsSkipped} skipped`);
  console.log("\nDemo Credentials:");
  console.log("  Provider 1 (Delhi/Gurugram): delhi.host@podsphere.demo  / DemoHost123!");
  console.log("  Provider 2 (Noida/Bengaluru): noida.host@podsphere.demo  / DemoHost123!");
  console.log("  Creator:                     creator.demo@podsphere.demo / DemoCreator123!");
  console.log("=================================================\n");
}

seed()
  .catch((err) => {
    console.error("Seeding failed with error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
