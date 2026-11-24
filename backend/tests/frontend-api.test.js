// End-to-end test verifying Frontend API mode
const app = require("../src/app");

async function runFrontendApiModeTests() {
  let server = null;
  let BASE_URL = "http://localhost:5001/api";

  try {
    const res = await fetch(`${BASE_URL}/health`, { signal: AbortSignal.timeout(1000) });
    if (!res.ok) throw new Error("Health check failed");
  } catch {
    server = app.listen(0);
    BASE_URL = `http://127.0.0.1:${server.address().port}/api`;
  }

  console.log("\n======================================================");
  console.log(" Running Frontend API Mode Verification Tests");
  console.log(` Target Server: ${BASE_URL}`);
  console.log("======================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Verify health
    const health = await (await fetch(`${BASE_URL}/health`)).json();
    assert(health.status === "ok", "Backend health endpoint is reachable and ok");

    // 2. Register test provider and creator
    const suffix = Date.now();
    const provRes = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Frontend Test Provider",
        email: `fe_prov_${suffix}@test.com`,
        password: "password123",
        role: "PROVIDER"
      })
    });
    const provData = await provRes.json();
    assert(provRes.status === 201, "Provider registration in API mode returns 201");
    const provToken = provData.token;

    const creatRes = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Frontend Test Creator",
        email: `fe_creat_${suffix}@test.com`,
        password: "password123",
        role: "USER"
      })
    });
    const creatData = await creatRes.json();
    assert(creatRes.status === 201, "Creator registration in API mode returns 201");
    const creatToken = creatData.token;
    const creatId = creatData.user.id;

    // 3. Provider activation flow test: verify escalate creator to provider
    const actRes = await fetch(`${BASE_URL}/auth/activate-provider`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${creatToken}` }
    });
    const actData = await actRes.json();
    assert(actRes.status === 200, "POST /api/auth/activate-provider succeeds in API mode (200 OK)");
    assert(actData.user.role === "PROVIDER", "User role in database updated to PROVIDER");
    assert(actData.user.roles.includes("provider"), "User roles list includes 'provider'");

    // 4. Create Studio
    const stRes = await fetch(`${BASE_URL}/studios`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${provToken}` },
      body: JSON.stringify({
        name: "API Mode Verification Studio",
        description: "Studio for testing frontend API mode",
        city: "Delhi",
        address: "742 Evergreen Terrace",
        hourlyRate: 1500,
        gear: ["Sony C-800G", "Neve Preamp"]
      })
    });
    const stData = await stRes.json();
    assert(stRes.status === 201, "POST /api/studios creates studio with 201 in API mode");
    const studioId = stData.studio.id;

    // 5. Test booking creation with same-day past-time check
    const todayIST = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(new Date());

    const pastSlotRes = await fetch(`${BASE_URL}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${creatToken}` },
      body: JSON.stringify({
        studioId: studioId,
        rawDate: todayIST,
        time: "01:00 - 02:00"
      })
    });
    assert(pastSlotRes.status === 400, "Booking past time slot on today's date rejected in API mode (400)");

    // 6. Create valid future booking
    const bkRes = await fetch(`${BASE_URL}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${creatToken}` },
      body: JSON.stringify({
        studioId: studioId,
        rawDate: "2027-12-15",
        time: "10:00 AM - 12:00 PM"
      })
    });
    const bkData = await bkRes.json();
    assert(bkRes.status === 201, "POST /api/bookings creates booking in API mode with 201");
    assert(bkData.booking.status === "PENDING", "Booking status starts as PENDING");
    assert(bkData.message.includes("pending provider confirmation"), "Server message confirms pending provider confirmation");
    const bookingId = bkData.booking.id;

    // 7. Verify provider incoming bookings retrieval via role=provider
    const provBookingsRes = await fetch(`${BASE_URL}/bookings?role=provider`, {
      headers: { "Authorization": `Bearer ${provToken}` }
    });
    const provBookings = await provBookingsRes.json();
    assert(provBookingsRes.status === 200, "GET /api/bookings?role=provider returns 200");
    assert(Array.isArray(provBookings) && provBookings.some(b => b.id === bookingId), "Provider retrieves incoming booking via role=provider");

    // 8. Provider Reject Booking action
    const rejectRes = await fetch(`${BASE_URL}/bookings/${bookingId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${provToken}` },
      body: JSON.stringify({ status: "REJECTED" })
    });
    const rejectData = await rejectRes.json();
    assert(rejectRes.status === 200, "PATCH /api/bookings/:id/status transitions to REJECTED (200 OK)");
    assert(rejectData.booking.status === "REJECTED", "Booking record status is REJECTED");

    // 9. Studio deletion guard with historical bookings
    const delStRes = await fetch(`${BASE_URL}/studios/${studioId}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${provToken}` }
    });
    assert(delStRes.status === 400, "DELETE /api/studios/:id blocked when historical bookings exist (400 Bad Request)");

    // Historical booking is preserved
    const histBk = await (await fetch(`${BASE_URL}/bookings/${bookingId}`, {
      headers: { "Authorization": `Bearer ${provToken}` }
    })).json();
    assert(histBk.booking && histBk.booking.id === bookingId, "Historical booking record is preserved after studio deletion attempt");

    // Create and delete an unbooked studio cleanly (200 OK)
    const st2Res = await fetch(`${BASE_URL}/studios`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${provToken}` },
      body: JSON.stringify({
        name: "Temporary Studio Without Bookings",
        description: "Studio to test clean deletion",
        city: "Mumbai",
        address: "100 Marine Drive",
        hourlyRate: 2000,
        gear: ["SM7B"]
      })
    });
    const st2Data = await st2Res.json();
    assert(st2Res.status === 201, "Created temporary studio without bookings (201 Created)");

    const delSt2Res = await fetch(`${BASE_URL}/studios/${st2Data.studio.id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${provToken}` }
    });
    assert(delSt2Res.status === 200, "DELETE studio without bookings succeeds with 200 OK");

    // Clean up created test records
    const prisma = require("../src/db");
    await prisma.booking.deleteMany({ where: { creatorId: creatId } });
    await prisma.studio.deleteMany({ where: { providerId: provData.user.id } });
    await prisma.user.deleteMany({ where: { id: { in: [provData.user.id, creatId] } } });
    await prisma.$disconnect();
    console.log("  ✓ Test records purged from database.");

  } catch (err) {
    console.error("Test error:", err);
    failed++;
  } finally {
    if (server) server.close();
  }

  console.log(`\n======================================================`);
  console.log(` Frontend API Mode Results: ${passed} Passed, ${failed} Failed`);
  console.log(`======================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runFrontendApiModeTests();
