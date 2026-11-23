const app = require("../src/app");
const prisma = require("../src/db");

async function runSystemTests() {
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api`;

  console.log(`\n======================================================`);
  console.log(` PodSphere Complete System Test Suite`);
  console.log(` Running against: ${baseUrl}`);
  console.log(`======================================================\n`);

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

  const TEST_EMAILS = [
    "sys_creator1@test.com",
    "sys_creator2@test.com",
    "sys_provider1@test.com",
    "sys_provider2@test.com"
  ];

  let creator1Token = "";
  let creator1Id = "";
  let creator2Token = "";
  let creator2Id = "";
  let provider1Token = "";
  let provider1Id = "";
  let provider2Token = "";
  let provider2Id = "";
  let studio1Id = "";
  let studio2Id = "";
  let booking1Id = "";
  let booking2Id = "";

  try {
    // 0. Clean old test data
    await prisma.booking.deleteMany({
      where: { creator: { email: { in: TEST_EMAILS } } }
    });
    await prisma.studio.deleteMany({
      where: { provider: { email: { in: TEST_EMAILS } } }
    });
    await prisma.user.deleteMany({
      where: { email: { in: TEST_EMAILS } }
    });

    // ==========================================
    // 1. HEALTH CHECK
    // ==========================================
    console.log("1. System Health & Database Connectivity");
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200, "GET /api/health returns 200 OK");
    assert(healthData.status === "ok", "Health status is 'ok'");
    assert(healthData.database === "connected", "PostgreSQL database status is 'connected'");

    // ==========================================
    // 2. AUTHENTICATION & ACCESS CONTROL
    // ==========================================
    console.log("\n2. Authentication & Profile Management");

    // Missing fields on registration
    const regMiss = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "missing@test.com" })
    });
    assert(regMiss.status === 400, "Registration rejects missing fields with 400 Bad Request");

    // Short password
    const regShort = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Alex", email: "short@test.com", password: "123" })
    });
    assert(regShort.status === 400, "Registration rejects password < 6 chars with 400 Bad Request");

    // Valid Creator 1 Registration
    const regC1 = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Creator Alpha",
        email: "sys_creator1@test.com",
        password: "password123",
        role: "USER"
      })
    });
    const regC1Data = await regC1.json();
    assert(regC1.status === 201, "Registration succeeds with 201 Created");
    assert(regC1Data.user.role === "USER", "Default user role is USER");
    assert(regC1Data.user.roles.includes("creator") && !regC1Data.user.roles.includes("provider"), "Creator roles array contains only ['creator']");
    assert(regC1Data.user.passwordHash === undefined, "Security: passwordHash is NEVER exposed in registration response");
    creator1Token = regC1Data.token;
    creator1Id = regC1Data.user.id;

    // Duplicate Email (Case-Insensitive)
    const regDup = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Duplicate",
        email: "SYS_CREATOR1@TEST.COM",
        password: "password123"
      })
    });
    assert(regDup.status === 409, "Duplicate email registration rejected with 409 Conflict");

    // Creator 2 Registration
    const regC2 = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Creator Beta",
        email: "sys_creator2@test.com",
        password: "password123",
        role: "USER"
      })
    });
    const regC2Data = await regC2.json();
    creator2Token = regC2Data.token;
    creator2Id = regC2Data.user.id;

    // Provider 1 Registration
    const regP1 = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Host One",
        email: "sys_provider1@test.com",
        password: "password123",
        role: "PROVIDER"
      })
    });
    const regP1Data = await regP1.json();
    assert(regP1.status === 201, "Provider registration returns 201 Created");
    assert(regP1Data.user.role === "PROVIDER", "Provider user role is PROVIDER");
    assert(regP1Data.user.roles.includes("creator") && regP1Data.user.roles.includes("provider"), "Provider retains creator permissions in roles array");
    provider1Token = regP1Data.token;
    provider1Id = regP1Data.user.id;

    // Provider 2 Registration
    const regP2 = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Host Two",
        email: "sys_provider2@test.com",
        password: "password123",
        role: "PROVIDER"
      })
    });
    const regP2Data = await regP2.json();
    provider2Token = regP2Data.token;
    provider2Id = regP2Data.user.id;

    // Login Edge Cases
    const logMiss = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "sys_creator1@test.com" })
    });
    assert(logMiss.status === 400, "Login rejects missing password with 400 Bad Request");

    const logWrong = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "sys_creator1@test.com", password: "wrong" })
    });
    assert(logWrong.status === 401, "Login with incorrect password returns 401 Unauthorized");

    const logValid = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "sys_creator1@test.com", password: "password123" })
    });
    const logValidData = await logValid.json();
    assert(logValid.status === 200, "Login with valid credentials returns 200 OK");
    assert(typeof logValidData.token === "string" && logValidData.token.length > 20, "Login returns fresh JWT");
    assert(logValidData.user.passwordHash === undefined, "Security: passwordHash is NEVER exposed in login response");

    // Profile Retrieval (/api/auth/me)
    const meNoToken = await fetch(`${baseUrl}/auth/me`);
    assert(meNoToken.status === 401, "GET /api/auth/me without token returns 401 Unauthorized");

    const meBadToken = await fetch(`${baseUrl}/auth/me`, {
      headers: { "Authorization": "Bearer bad.token.here" }
    });
    assert(meBadToken.status === 401, "GET /api/auth/me with invalid token returns 401 Unauthorized");

    const meValid = await fetch(`${baseUrl}/auth/me`, {
      headers: { "Authorization": `Bearer ${creator1Token}` }
    });
    const meValidData = await meValid.json();
    assert(meValid.status === 200, "GET /api/auth/me with valid Bearer token returns 200 OK");
    assert(meValidData.user.id === creator1Id, "Profile user ID matches authenticated token");

    // Role Escalation (/api/auth/activate-provider)
    const actRes = await fetch(`${baseUrl}/auth/activate-provider`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${creator2Token}` }
    });
    const actData = await actRes.json();
    assert(actRes.status === 200, "POST /api/auth/activate-provider returns 200 OK");
    assert(actData.user.role === "PROVIDER", "User role escalated to PROVIDER in database");
    assert(actData.user.roles.includes("creator") && actData.user.roles.includes("provider"), "Escalated user retains dual creator/provider capabilities");
    creator2Token = actData.token; // Update token with new claims

    // ==========================================
    // 3. STUDIO MANAGEMENT CRUD
    // ==========================================
    console.log("\n3. Studio Management CRUD & Permissions");

    // Studio creation without auth -> 401
    const stNoAuth = await fetch(`${baseUrl}/studios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Unauth Studio" })
    });
    assert(stNoAuth.status === 401, "POST /api/studios without token returns 401 Unauthorized");

    // Studio creation by standard creator (role USER) -> 403 Forbidden
    const stCreator = await fetch(`${baseUrl}/studios`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${creator1Token}` },
      body: JSON.stringify({
        name: "Forbidden Studio",
        city: "Delhi",
        address: "Address",
        hourlyRate: 1500,
        description: "Desc"
      })
    });
    assert(stCreator.status === 403, "POST /api/studios by non-provider returns 403 Forbidden");

    // Missing fields
    const stMiss = await fetch(`${baseUrl}/studios`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${provider1Token}` },
      body: JSON.stringify({ name: "Incomplete Studio" })
    });
    assert(stMiss.status === 400, "POST /api/studios rejects missing required fields with 400 Bad Request");

    // Negative hourly rate
    const stNegRate = await fetch(`${baseUrl}/studios`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${provider1Token}` },
      body: JSON.stringify({
        name: "Negative Studio",
        city: "Delhi",
        address: "Address",
        hourlyRate: -500,
        description: "Desc"
      })
    });
    assert(stNegRate.status === 400, "POST /api/studios rejects negative hourlyRate with 400 Bad Request");

    // Provider 1 Creates Studio
    const stCreate1 = await fetch(`${baseUrl}/studios`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${provider1Token}` },
      body: JSON.stringify({
        name: "Metropolis Sound Lab",
        city: "Bengaluru",
        address: "77 Koramangala 4th Block",
        hourlyRate: 2000,
        description: "Acoustically isolated studio with 4K multi-cam",
        gear: ["4x Shure SM7B", "Apollo Twin X"]
      })
    });
    const stCreate1Data = await stCreate1.json();
    assert(stCreate1.status === 201, "POST /api/studios creates studio with 201 Created");
    assert(stCreate1Data.studio.hourlyRate === 2000, "hourlyRate formatted cleanly as number");
    assert(stCreate1Data.studio.providerId === provider1Id, "providerId is derived strictly from JWT");
    studio1Id = stCreate1Data.studio.id;

    // Provider 2 Creates Studio
    const stCreate2 = await fetch(`${baseUrl}/studios`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${provider2Token}` },
      body: JSON.stringify({
        name: "Echo Room Central",
        city: "Delhi",
        address: "Suite 402, Okhla Phase III",
        hourlyRate: 1500,
        description: "Compact podcast recording booth"
      })
    });
    const stCreate2Data = await stCreate2.json();
    studio2Id = stCreate2Data.studio.id;

    // Public Studio Browsing & Filtering
    const listAll = await fetch(`${baseUrl}/studios`);
    const listAllData = await listAll.json();
    assert(listAll.status === 200, "GET /api/studios returns 200 OK");
    assert(Array.isArray(listAllData) && listAllData.length >= 2, "Public listing returns list of studios");

    const filterCity = await fetch(`${baseUrl}/studios?city=Delhi`);
    const filterCityData = await filterCity.json();
    assert(filterCityData.every(s => s.city.toLowerCase() === "delhi"), "Query filter ?city=Delhi matches Delhi studios");

    const filterPrice = await fetch(`${baseUrl}/studios?maxPrice=1600`);
    const filterPriceData = await filterPrice.json();
    assert(filterPriceData.every(s => s.hourlyRate <= 1600), "Query filter ?maxPrice=1600 matches studios <= 1600");

    const filterSearch = await fetch(`${baseUrl}/studios?search=Metropolis`);
    const filterSearchData = await filterSearch.json();
    assert(filterSearchData.some(s => s.id === studio1Id), "Query filter ?search=Metropolis matches studio by name");

    // Single Studio Details
    const stDetails = await fetch(`${baseUrl}/studios/${studio1Id}`);
    const stDetailsData = await stDetails.json();
    assert(stDetails.status === 200, "GET /api/studios/:id returns 200 OK");
    assert(stDetailsData.studio.provider.email === "sys_provider1@test.com", "Studio details include provider relation");

    // Malformed ID
    const stMalformed = await fetch(`${baseUrl}/studios/not-a-valid-uuid`);
    assert(stMalformed.status === 404, "GET /api/studios/:id with malformed UUID returns 404 cleanly (no 500)");

    // Non-existent ID
    const stNotFound = await fetch(`${baseUrl}/studios/00000000-0000-0000-0000-000000000000`);
    assert(stNotFound.status === 404, "GET /api/studios/:id with unknown UUID returns 404 Not Found");

    // Update Studio Ownership Guard
    const stBadUpdate = await fetch(`${baseUrl}/studios/${studio1Id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${provider2Token}` },
      body: JSON.stringify({ name: "Hacked Studio" })
    });
    assert(stBadUpdate.status === 403, "PUT /api/studios/:id by non-owner rejected with 403 Forbidden");

    // Update Studio Valid
    const stGoodUpdate = await fetch(`${baseUrl}/studios/${studio1Id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${provider1Token}` },
      body: JSON.stringify({ name: "Metropolis Sound Lab Pro", hourlyRate: 2500 })
    });
    const stGoodUpdateData = await stGoodUpdate.json();
    assert(stGoodUpdate.status === 200, "PUT /api/studios/:id by owner returns 200 OK");
    assert(stGoodUpdateData.studio.name === "Metropolis Sound Lab Pro", "Studio name updated successfully");
    assert(stGoodUpdateData.studio.hourlyRate === 2500, "Studio rate updated successfully");

    // Delete Studio Ownership Guard
    const stBadDelete = await fetch(`${baseUrl}/studios/${studio1Id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${provider2Token}` }
    });
    assert(stBadDelete.status === 403, "DELETE /api/studios/:id by non-owner rejected with 403 Forbidden");

    // ==========================================
    // 4. BOOKING ENGINE, CONCURRENCY & LIFECYCLE
    // ==========================================
    console.log("\n4. Booking Engine, Concurrency & Lifecycle");

    // Validation
    const bkMiss = await fetch(`${baseUrl}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${creator1Token}` },
      body: JSON.stringify({ studioId: studio1Id })
    });
    assert(bkMiss.status === 400, "POST /api/bookings rejects missing date/time with 400 Bad Request");

    const bkPast = await fetch(`${baseUrl}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${creator1Token}` },
      body: JSON.stringify({ studioId: studio1Id, rawDate: "2020-01-01", time: "10:00 AM - 12:00 PM" })
    });
    assert(bkPast.status === 400, "POST /api/bookings rejects past dates with 400 Bad Request");

    // Valid Booking Creation
    const bkCreate1 = await fetch(`${baseUrl}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${creator1Token}` },
      body: JSON.stringify({
        studioId: studio1Id,
        rawDate: "2027-11-25",
        time: "10:00 AM - 12:00 PM"
      })
    });
    const bkCreate1Data = await bkCreate1.json();
    assert(bkCreate1.status === 201, "POST /api/bookings creates booking with 201 Created");
    assert(bkCreate1Data.booking.status === "PENDING", "Booking is created with PENDING status (never auto-confirmed)");
    assert(bkCreate1Data.booking.totalPrice === 5000, "Total price calculated correctly: 2 hrs * 2500 = 5000");
    assert(bkCreate1Data.booking.time === "10:00 AM - 12:00 PM", "Booking time range normalized in IST");
    booking1Id = bkCreate1Data.booking.id;

    // Exact Duplicate Slot Conflict
    const bkDup = await fetch(`${baseUrl}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${creator2Token}` },
      body: JSON.stringify({
        studioId: studio1Id,
        rawDate: "2027-11-25",
        time: "10:00 AM - 12:00 PM"
      })
    });
    assert(bkDup.status === 409, "Exact duplicate booking rejected with 409 Conflict");

    // Partial Overlap Slot Conflict (11:00 AM - 01:00 PM)
    const bkOverlap = await fetch(`${baseUrl}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${creator2Token}` },
      body: JSON.stringify({
        studioId: studio1Id,
        rawDate: "2027-11-25",
        time: "11:00 AM - 1:00 PM"
      })
    });
    assert(bkOverlap.status === 409, "Overlapping booking rejected with 409 Conflict");

    // Non-overlapping Slot on same day (14:00 - 16:00)
    const bkNonOverlap = await fetch(`${baseUrl}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${creator2Token}` },
      body: JSON.stringify({
        studioId: studio1Id,
        rawDate: "2027-11-25",
        time: "14:00 - 16:00"
      })
    });
    const bkNonOverlapData = await bkNonOverlap.json();
    assert(bkNonOverlap.status === 201, "Non-overlapping time slot on same day succeeds with 201 Created");
    booking2Id = bkNonOverlapData.booking.id;

    // Simultaneous Concurrency Race Condition Test
    console.log("\n  --> Testing Simultaneous Concurrency Race Condition...");
    const [race1, race2] = await Promise.all([
      fetch(`${baseUrl}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${creator1Token}` },
        body: JSON.stringify({ studioId: studio1Id, rawDate: "2027-11-26", time: "10:00 AM - 12:00 PM" })
      }),
      fetch(`${baseUrl}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${creator2Token}` },
        body: JSON.stringify({ studioId: studio1Id, rawDate: "2027-11-26", time: "10:00 AM - 12:00 PM" })
      })
    ]);
    const raceStatuses = [race1.status, race2.status].sort();
    assert(raceStatuses[0] === 201 && raceStatuses[1] === 409, "Pessimistic row lock handles concurrent race: 1 wins (201), 1 rejected (409)");

    // Active Booking Deletion Guard
    const stDeleteBlocked = await fetch(`${baseUrl}/studios/${studio1Id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${provider1Token}` }
    });
    assert(stDeleteBlocked.status === 400, "Studio deletion blocked when active bookings exist (400 Bad Request)");

    // Scoped Queries
    const c1Bookings = await (await fetch(`${baseUrl}/bookings`, {
      headers: { "Authorization": `Bearer ${creator1Token}` }
    })).json();
    assert(c1Bookings.every(b => b.creatorId === creator1Id), "Creator booking list strictly scoped to caller's own ID");

    const p1Bookings = await (await fetch(`${baseUrl}/bookings/provider`, {
      headers: { "Authorization": `Bearer ${provider1Token}` }
    })).json();
    assert(p1Bookings.length >= 2, "Provider endpoint returns incoming bookings for owned studios");

    // Provider Status Updates
    const statusBadUser = await fetch(`${baseUrl}/bookings/${booking1Id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${creator1Token}` },
      body: JSON.stringify({ status: "CONFIRMED" })
    });
    assert(statusBadUser.status === 403, "Non-owner status update attempt rejected with 403 Forbidden");

    const statusConfirm = await fetch(`${baseUrl}/bookings/${booking1Id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${provider1Token}` },
      body: JSON.stringify({ status: "CONFIRMED" })
    });
    const statusConfirmData = await statusConfirm.json();
    assert(statusConfirm.status === 200, "Provider confirms booking with 200 OK");
    assert(statusConfirmData.booking.status === "CONFIRMED", "Booking status successfully transitioned to CONFIRMED");

    const statusComplete = await fetch(`${baseUrl}/bookings/${booking1Id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${provider1Token}` },
      body: JSON.stringify({ status: "COMPLETED" })
    });
    assert(statusComplete.status === 200, "Provider completes booking with 200 OK");

    const statusTerminal = await fetch(`${baseUrl}/bookings/${booking1Id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${provider1Token}` },
      body: JSON.stringify({ status: "REJECTED" })
    });
    assert(statusTerminal.status === 400, "Attempt to alter COMPLETED terminal booking rejected with 400 Bad Request");

    // Creator Cancellation
    const cancelBadUser = await fetch(`${baseUrl}/bookings/${booking2Id}/cancel`, {
      method: "PATCH",
      headers: { "Authorization": `Bearer ${creator1Token}` }
    });
    assert(cancelBadUser.status === 403, "Non-owner cancelling booking rejected with 403 Forbidden");

    const cancelGood = await fetch(`${baseUrl}/bookings/${booking2Id}/cancel`, {
      method: "PATCH",
      headers: { "Authorization": `Bearer ${creator2Token}` }
    });
    const cancelGoodData = await cancelGood.json();
    assert(cancelGood.status === 200, "Owner cancels booking with 200 OK");
    assert(cancelGoodData.booking.status === "CANCELLED", "Booking status successfully transitioned to CANCELLED");

    const cancelReCancel = await fetch(`${baseUrl}/bookings/${booking2Id}/cancel`, {
      method: "PATCH",
      headers: { "Authorization": `Bearer ${creator2Token}` }
    });
    assert(cancelReCancel.status === 400, "Attempt to re-cancel already CANCELLED booking rejected with 400 Bad Request");

    const cancelCompleted = await fetch(`${baseUrl}/bookings/${booking1Id}/cancel`, {
      method: "PATCH",
      headers: { "Authorization": `Bearer ${creator1Token}` }
    });
    assert(cancelCompleted.status === 400, "Attempt to cancel COMPLETED booking rejected with 400 Bad Request");

    // Clean up test data
    await prisma.booking.deleteMany({
      where: { creator: { email: { in: TEST_EMAILS } } }
    });
    await prisma.studio.deleteMany({
      where: { provider: { email: { in: TEST_EMAILS } } }
    });
    await prisma.user.deleteMany({
      where: { email: { in: TEST_EMAILS } }
    });
    console.log("\n  ✓ Test records purged from database.");

  } finally {
    server.close();
    await prisma.$disconnect();
  }

  console.log(`\n======================================================`);
  console.log(` Test Suite Results: ${passed} Passed, ${failed} Failed`);
  console.log(`======================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runSystemTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
