const app = require("../src/app");
const prisma = require("../src/db");

async function runEquipmentRentalTests() {
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api`;

  console.log(`\n======================================================`);
  console.log(` PodSphere Equipment & Rental System Test Suite`);
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
    "eq_provider1@test.com",
    "eq_provider2@test.com",
    "eq_creator1@test.com",
    "eq_creator2@test.com"
  ];

  let prov1Token = "";
  let prov1Id = "";
  let prov2Token = "";
  let creat1Token = "";
  let creat1Id = "";
  let creat2Token = "";

  let equipment1Id = ""; // Hourly mic, qty 2
  let equipment2Id = ""; // Daily camera, qty 1

  try {
    // 0. Cleanup previous test run data
    await prisma.equipmentRental.deleteMany({
      where: {
        OR: [
          { creator: { email: { in: TEST_EMAILS } } },
          { equipment: { provider: { email: { in: TEST_EMAILS } } } }
        ]
      }
    });
    await prisma.equipment.deleteMany({
      where: { provider: { email: { in: TEST_EMAILS } } }
    });
    await prisma.user.deleteMany({
      where: { email: { in: TEST_EMAILS } }
    });

    // 1. User Registration & Setup
    console.log("--- 1. User Setup & Roles ---");
    const regProv1 = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Equipment Provider 1",
        email: TEST_EMAILS[0],
        password: "password123",
        role: "PROVIDER"
      })
    });
    const p1Data = await regProv1.json();
    assert(regProv1.status === 201, "Provider 1 registration returns 201");
    prov1Token = p1Data.token;
    prov1Id = p1Data.user.id;

    const regProv2 = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Equipment Provider 2",
        email: TEST_EMAILS[1],
        password: "password123",
        role: "PROVIDER"
      })
    });
    const p2Data = await regProv2.json();
    assert(regProv2.status === 201, "Provider 2 registration returns 201");
    prov2Token = p2Data.token;

    const regCreat1 = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Equipment Creator 1",
        email: TEST_EMAILS[2],
        password: "password123",
        role: "USER"
      })
    });
    const c1Data = await regCreat1.json();
    assert(regCreat1.status === 201, "Creator 1 registration returns 201");
    creat1Token = c1Data.token;
    creat1Id = c1Data.user.id;

    const regCreat2 = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Equipment Creator 2",
        email: TEST_EMAILS[3],
        password: "password123",
        role: "USER"
      })
    });
    const c2Data = await regCreat2.json();
    assert(regCreat2.status === 201, "Creator 2 registration returns 201");
    creat2Token = c2Data.token;

    // 2. Equipment Authorization & Creation
    console.log("\n--- 2. Equipment Creation & Permissions ---");
    // Non-provider cannot create equipment
    const creatorCreateRes = await fetch(`${baseUrl}/equipment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${creat1Token}`
      },
      body: JSON.stringify({
        name: "Unauthorized Creator Item",
        category: "Microphones",
        hourlyRate: 100,
        city: "Delhi"
      })
    });
    assert(creatorCreateRes.status === 403, "Non-provider creation rejected with 403 Forbidden");

    // Provider creates equipment with hourly pricing (qty: 2)
    const eq1Res = await fetch(`${baseUrl}/equipment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${prov1Token}`
      },
      body: JSON.stringify({
        name: "Shure SM7B Dynamic Vocal Mic",
        category: "Microphones",
        brand: "Shure",
        model: "SM7B",
        description: "Studio vocal microphone with broadcast arm and windscreen.",
        condition: "LIKE_NEW",
        specifications: ["Cardioid", "XLR", "Built-in Pop Filter"],
        city: "Delhi",
        address: "Connaught Place Studio Hub",
        hourlyRate: 150,
        dailyRate: 900,
        pricingUnit: "HOURLY",
        minimumRentalHours: 2,
        maximumRentalHours: 48,
        totalQuantity: 2,
        imageUrls: ["https://example.com/sm7b.jpg"]
      })
    });
    const eq1Data = await eq1Res.json();
    assert(eq1Res.status === 201, "Provider 1 creates hourly equipment (201 Created)");
    assert(eq1Data.equipment.pricingUnit === "HOURLY", "Equipment pricingUnit set to HOURLY");
    assert(eq1Data.equipment.totalQuantity === 2, "Equipment totalQuantity is 2");
    equipment1Id = eq1Data.equipment.id;

    // Provider creates equipment with daily pricing (qty: 1)
    const eq2Res = await fetch(`${baseUrl}/equipment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${prov1Token}`
      },
      body: JSON.stringify({
        name: "Sony FX3 Cinema Camera Kit",
        category: "Cameras",
        brand: "Sony",
        model: "ILME-FX3",
        description: "Full-frame 4K cinema camera with 24-70mm f/2.8 GM lens.",
        condition: "LIKE_NEW",
        specifications: ["4K 120p", "10-bit 4:2:2", "XLR Handle Unit"],
        city: "Mumbai",
        address: "Andheri West Media Center",
        dailyRate: 3500,
        pricingUnit: "DAILY",
        minimumRentalHours: 24,
        maximumRentalHours: 168,
        totalQuantity: 1,
        imageUrls: ["https://example.com/fx3.jpg"]
      })
    });
    const eq2Data = await eq2Res.json();
    assert(eq2Res.status === 201, "Provider 1 creates daily equipment (201 Created)");
    equipment2Id = eq2Data.equipment.id;

    // 3. Equipment Discovery & Filters
    console.log("\n--- 3. Equipment Discovery & Filtering ---");
    const listRes = await fetch(`${baseUrl}/equipment`);
    const listData = await listRes.json();
    assert(listRes.status === 200, "GET /api/equipment returns 200 OK");
    const foundEq1 = (Array.isArray(listData) ? listData : listData.equipment || []).find(e => e.id === equipment1Id);
    assert(Boolean(foundEq1), "Public catalog contains created equipment");

    const filterCityRes = await fetch(`${baseUrl}/equipment?city=Delhi`);
    const filterCityData = await filterCityRes.json();
    const cityList = Array.isArray(filterCityData) ? filterCityData : filterCityData.equipment || [];
    assert(cityList.every(e => e.city.toLowerCase() === "delhi"), "City filter returns only Delhi equipment");

    const filterCategoryRes = await fetch(`${baseUrl}/equipment?category=Cameras`);
    const filterCategoryData = await filterCategoryRes.json();
    const catList = Array.isArray(filterCategoryData) ? filterCategoryData : filterCategoryData.equipment || [];
    assert(catList.every(e => e.category.toLowerCase() === "cameras"), "Category filter returns only Cameras");

    // Provider gear listing
    const provListRes = await fetch(`${baseUrl}/equipment/provider`, {
      headers: { "Authorization": `Bearer ${prov1Token}` }
    });
    const provListData = await provListRes.json();
    assert(provListRes.status === 200, "GET /api/equipment/provider returns 200 OK");
    const provEqList = Array.isArray(provListData) ? provListData : provListData.equipment || [];
    assert(provEqList.length >= 2, "Provider gets their own equipment listings");

    // Provider router alias check
    const provRouteRes = await fetch(`${baseUrl}/provider/equipment`, {
      headers: { "Authorization": `Bearer ${prov1Token}` }
    });
    assert(provRouteRes.status === 200, "GET /api/provider/equipment alias returns 200 OK");

    // 4. Equipment Ownership & Update Rules
    console.log("\n--- 4. Equipment Ownership & Permissions ---");
    const unauthorizedUpdateRes = await fetch(`${baseUrl}/equipment/${equipment1Id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${prov2Token}`
      },
      body: JSON.stringify({ hourlyRate: 200 })
    });
    assert(unauthorizedUpdateRes.status === 403, "Update by different provider rejected with 403 Forbidden");

    const validUpdateRes = await fetch(`${baseUrl}/equipment/${equipment1Id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${prov1Token}`
      },
      body: JSON.stringify({ hourlyRate: 180, description: "Updated description with boom stand" })
    });
    const validUpdateData = await validUpdateRes.json();
    assert(validUpdateRes.status === 200, "Owner successfully updates equipment (200 OK)");
    assert(validUpdateData.equipment.hourlyRate === 180, "Hourly rate updated to 180");

    // 5. Rental Validation & Pricing Calculations
    console.log("\n--- 5. Rental Validation & Server-Side Pricing ---");
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const startStr = tomorrow.toISOString().split("T")[0] + "T10:00:00.000Z";
    const endStr4Hours = tomorrow.toISOString().split("T")[0] + "T14:00:00.000Z";
    const pastStr = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Past start time rejected
    const pastRentalRes = await fetch(`${baseUrl}/rentals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${creat1Token}`
      },
      body: JSON.stringify({
        equipmentId: equipment1Id,
        startDate: pastStr,
        endDate: endStr4Hours,
        quantity: 1
      })
    });
    assert(pastRentalRes.status === 400, "Past rental start time rejected with 400 Bad Request");

    // Provider cannot rent their own equipment
    const selfRentalRes = await fetch(`${baseUrl}/rentals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${prov1Token}`
      },
      body: JSON.stringify({
        equipmentId: equipment1Id,
        startDate: startStr,
        endDate: endStr4Hours,
        quantity: 1
      })
    });
    assert(selfRentalRes.status === 400, "Provider renting own equipment rejected with 400 Bad Request");

    // Valid Hourly Rental: 4 hours of equipment1 (rate: 180/hr, qty: 1) => 4 * 180 = 720
    const validHourlyRes = await fetch(`${baseUrl}/rentals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${creat1Token}`
      },
      body: JSON.stringify({
        equipmentId: equipment1Id,
        startDate: startStr,
        endDate: endStr4Hours,
        quantity: 1,
        deliveryOption: "PICKUP",
        specialRequests: "Need long XLR cables"
      })
    });
    const validHourlyData = await validHourlyRes.json();
    assert(validHourlyRes.status === 201, "Valid hourly rental created (201 Created)");
    assert(validHourlyData.rental.status === "PENDING", "Initial rental status is PENDING");
    assert(validHourlyData.rental.billableUnits === 4, "Billable units correctly computed as 4 hours");
    assert(validHourlyData.rental.totalPrice === 720, "Total price correctly computed as 720 (4 * 180)");
    const rental1Id = validHourlyData.rental.id;

    // Valid Daily Rental: 2 days (48 hours) of equipment2 (rate: 3500/day, qty: 1) => 2 * 3500 = 7000
    const dayAfterTomorrow = new Date(tomorrow.getTime() + 48 * 60 * 60 * 1000).toISOString();
    const validDailyRes = await fetch(`${baseUrl}/rentals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${creat1Token}`
      },
      body: JSON.stringify({
        equipmentId: equipment2Id,
        startDate: startStr,
        endDate: dayAfterTomorrow,
        quantity: 1,
        deliveryOption: "SHIPPING"
      })
    });
    const validDailyData = await validDailyRes.json();
    assert(validDailyRes.status === 201, "Valid daily rental created (201 Created)");
    assert(validDailyData.rental.billableUnits === 2, "Billable units correctly computed as 2 days");
    assert(validDailyData.rental.totalPrice === 7000, "Total price correctly computed as 7000 (2 * 3500)");
    const rental2Id = validDailyData.rental.id;

    // 6. Inventory Reservation & Overlap Rejection
    console.log("\n--- 6. Multi-Unit Inventory & Overlap Checks ---");
    // Equipment 1 has totalQuantity = 2. Creator 1 booked 1 unit for [startStr, endStr4Hours].
    // Creator 2 requests 1 unit in the same overlapping time window => should SUCCEED (1 + 1 <= 2)
    const overlapAllowedRes = await fetch(`${baseUrl}/rentals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${creat2Token}`
      },
      body: JSON.stringify({
        equipmentId: equipment1Id,
        startDate: startStr,
        endDate: endStr4Hours,
        quantity: 1
      })
    });
    assert(overlapAllowedRes.status === 201, "Second concurrent unit within totalQuantity (2) allowed (201 Created)");
    const rental3Id = (await overlapAllowedRes.json()).rental.id;

    // Now all 2 units of Equipment 1 are reserved for [startStr, endStr4Hours].
    // A 3rd request for 1 unit during this overlapping time must be REJECTED (409 Conflict)
    const overlapExceededRes = await fetch(`${baseUrl}/rentals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${creat1Token}`
      },
      body: JSON.stringify({
        equipmentId: equipment1Id,
        startDate: startStr,
        endDate: endStr4Hours,
        quantity: 1
      })
    });
    assert(overlapExceededRes.status === 409, "Overlapping rental exceeding inventory rejected with 409 Conflict");

    // Equipment 2 only has totalQuantity = 1. Creator 1 already booked it.
    // Creator 2 requests it in the overlapping window => must return 409 Conflict
    const singleUnitExceededRes = await fetch(`${baseUrl}/rentals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${creat2Token}`
      },
      body: JSON.stringify({
        equipmentId: equipment2Id,
        startDate: startStr,
        endDate: dayAfterTomorrow,
        quantity: 1
      })
    });
    assert(singleUnitExceededRes.status === 409, "Single-unit camera overlap rejected with 409 Conflict");

    // Requesting Equipment 2 in a non-overlapping window (e.g. 5 days later) must SUCCEED
    const futureNonOverlapStart = new Date(tomorrow.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString();
    const futureNonOverlapEnd = new Date(tomorrow.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString();
    const futureNonOverlapRes = await fetch(`${baseUrl}/rentals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${creat2Token}`
      },
      body: JSON.stringify({
        equipmentId: equipment2Id,
        startDate: futureNonOverlapStart,
        endDate: futureNonOverlapEnd,
        quantity: 1
      })
    });
    assert(futureNonOverlapRes.status === 201, "Non-overlapping rental period succeeds (201 Created)");

    // 7. Concurrency & Race Condition Simulation
    console.log("\n--- 7. Pessimistic Row Lock & Concurrency Race Test ---");
    // Create an item with totalQuantity = 1
    const raceItemRes = await fetch(`${baseUrl}/equipment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${prov1Token}`
      },
      body: JSON.stringify({
        name: "Rode Wireless PRO Mic Kit",
        category: "Microphones",
        brand: "Rode",
        model: "Wireless PRO",
        description: "Dual-channel wireless microphone system with 32-bit float on-board recording.",
        address: "Connaught Place Studio Hub",
        hourlyRate: 120,
        city: "Delhi",
        totalQuantity: 1
      })
    });
    const raceItemData = await raceItemRes.json();
    const raceItem = raceItemData.equipment;

    const raceStart = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
    const raceEnd = new Date(Date.now() + 76 * 60 * 60 * 1000).toISOString();

    // Fire 2 simultaneous booking requests for the only 1 unit
    const [resA, resB] = await Promise.all([
      fetch(`${baseUrl}/rentals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${creat1Token}`
        },
        body: JSON.stringify({
          equipmentId: raceItem.id,
          startDate: raceStart,
          endDate: raceEnd,
          quantity: 1
        })
      }),
      fetch(`${baseUrl}/rentals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${creat2Token}`
        },
        body: JSON.stringify({
          equipmentId: raceItem.id,
          startDate: raceStart,
          endDate: raceEnd,
          quantity: 1
        })
      })
    ]);

    const statuses = [resA.status, resB.status];
    const successCount = statuses.filter(s => s === 201).length;
    const conflictCount = statuses.filter(s => s === 409).length;

    assert(successCount === 1 && conflictCount === 1, "Concurrent race condition properly serialized: exactly 1 wins (201), 1 conflicts (409)");

    // 8. Rental Lifecycle & Status Transitions
    console.log("\n--- 8. Rental Lifecycle & Status Transitions ---");
    // Provider approves rental1: PENDING -> APPROVED
    const approveRes = await fetch(`${baseUrl}/rentals/${rental1Id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${prov1Token}`
      },
      body: JSON.stringify({ status: "APPROVED", currentStatus: "PENDING" })
    });
    assert(approveRes.status === 200, "Provider approves rental: PENDING -> APPROVED (200 OK)");
    const approvedData = await approveRes.json();
    assert(approvedData.rental.status === "APPROVED", "Rental status is now APPROVED");

    // Provider activates rental: APPROVED -> ACTIVE
    const activeRes = await fetch(`${baseUrl}/rentals/${rental1Id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${prov1Token}`
      },
      body: JSON.stringify({ status: "ACTIVE" })
    });
    assert(activeRes.status === 200, "Provider marks rental as picked up: APPROVED -> ACTIVE (200 OK)");

    // Provider marks returned: ACTIVE -> RETURNED
    const returnedRes = await fetch(`${baseUrl}/rentals/${rental1Id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${prov1Token}`
      },
      body: JSON.stringify({ status: "RETURNED" })
    });
    assert(returnedRes.status === 200, "Provider marks gear returned: ACTIVE -> RETURNED (200 OK)");

    // Provider completes rental: RETURNED -> COMPLETED
    const completedRes = await fetch(`${baseUrl}/rentals/${rental1Id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${prov1Token}`
      },
      body: JSON.stringify({ status: "COMPLETED" })
    });
    assert(completedRes.status === 200, "Provider marks rental completed: RETURNED -> COMPLETED (200 OK)");

    // Illegal transition: Cannot move COMPLETED rental back to PENDING or ACTIVE
    const illegalTransitionRes = await fetch(`${baseUrl}/rentals/${rental1Id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${prov1Token}`
      },
      body: JSON.stringify({ status: "ACTIVE" })
    });
    assert(illegalTransitionRes.status === 400, "Illegal transition from terminal COMPLETED state rejected with 400 Bad Request");

    // Provider rejects rental3: PENDING -> REJECTED
    const rejectRes = await fetch(`${baseUrl}/rentals/${rental3Id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${prov1Token}`
      },
      body: JSON.stringify({ status: "REJECTED", notes: "Item out for emergency maintenance" })
    });
    assert(rejectRes.status === 200, "Provider rejects rental: PENDING -> REJECTED (200 OK)");
    const rejectedData = await rejectRes.json();
    assert(rejectedData.rental.status === "REJECTED", "Rental status is REJECTED");

    // Creator cancels rental2: PENDING -> CANCELLED
    const cancelRes = await fetch(`${baseUrl}/rentals/${rental2Id}/cancel`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${creat1Token}`
      },
      body: JSON.stringify({ reason: "Shoot rescheduled" })
    });
    assert(cancelRes.status === 200, "Creator cancels rental: PENDING -> CANCELLED (200 OK)");
    const cancelledData = await cancelRes.json();
    assert(cancelledData.rental.status === "CANCELLED", "Rental status is CANCELLED");

    // 9. Deletion & Archival Guardrails
    console.log("\n--- 9. Deletion & Data Protection ---");
    // raceItem has a pending rental, so deletion must be blocked
    const deleteActiveBlockedRes = await fetch(`${baseUrl}/equipment/${raceItem.id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${prov1Token}` }
    });
    assert(deleteActiveBlockedRes.status === 400, "Deletion of equipment with active/pending rentals blocked with 400 Bad Request");

    // Equipment 1 has completed/rejected historical rentals, so deletion safely archives it
    const archiveRes = await fetch(`${baseUrl}/equipment/${equipment1Id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${prov1Token}` }
    });
    const archiveData = await archiveRes.json();
    assert(archiveRes.status === 200, "Equipment with historical rentals safely archived (200 OK)");
    assert(archiveData.archived === true, "Response confirms equipment was archived rather than hard deleted");

    // Verify archived equipment no longer appears in public active catalog
    const catalogAfterArchiveRes = await fetch(`${baseUrl}/equipment`);
    const catalogAfterArchiveData = await catalogAfterArchiveRes.json();
    const catalogList = Array.isArray(catalogAfterArchiveData) ? catalogAfterArchiveData : catalogAfterArchiveData.equipment || [];
    assert(!catalogList.some(e => e.id === equipment1Id), "Archived equipment excluded from public active catalog");

    // 10. Rate Validation Regression Tests (Frontend Payloads with null rates)
    console.log("\n--- 10. Rate Validation Regression (Frontend Payloads) ---");
    // Hourly only: hourlyRate = 250, dailyRate = null, pricingUnit = "HOURLY"
    const hourlyOnlyRes = await fetch(`${baseUrl}/equipment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${prov1Token}`
      },
      body: JSON.stringify({
        name: "Electro-Voice RE20 Mic",
        category: "Microphones",
        brand: "Electro-Voice",
        model: "RE20",
        description: "Variable-D dynamic cardioid microphone.",
        condition: "LIKE_NEW",
        city: "Delhi",
        address: "South Extension Part II",
        pricingUnit: "HOURLY",
        hourlyRate: 250,
        dailyRate: null,
        totalQuantity: 3
      })
    });
    assert(hourlyOnlyRes.status === 201, "Frontend payload with hourlyRate and null dailyRate succeeds (201 Created)");
    const hourlyOnlyData = await hourlyOnlyRes.json();
    const hourlyOnlyId = hourlyOnlyData.equipment.id;

    // Daily only: hourlyRate = null, dailyRate = 1800, pricingUnit = "DAILY"
    const dailyOnlyRes = await fetch(`${baseUrl}/equipment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${prov1Token}`
      },
      body: JSON.stringify({
        name: "Blackmagic Pocket Cinema 6K",
        category: "Cameras",
        brand: "Blackmagic",
        model: "BMPCC 6K",
        description: "Super 35 6K digital cinema camera with EF mount.",
        condition: "GOOD",
        city: "Mumbai",
        address: "Bandra Kurla Complex",
        pricingUnit: "DAILY",
        hourlyRate: null,
        dailyRate: 1800,
        totalQuantity: 2
      })
    });
    assert(dailyOnlyRes.status === 201, "Frontend payload with dailyRate and null hourlyRate succeeds (201 Created)");
    const dailyOnlyData = await dailyOnlyRes.json();
    const dailyOnlyId = dailyOnlyData.equipment.id;

    // Both rates null or <= 0: must be rejected with 400
    const bothNullRes = await fetch(`${baseUrl}/equipment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${prov1Token}`
      },
      body: JSON.stringify({
        name: "Broken Pricing Item",
        category: "Lighting",
        brand: "Nanlite",
        model: "Forza 60",
        description: "Compact spotlight.",
        condition: "GOOD",
        city: "Delhi",
        address: "Hauz Khas",
        pricingUnit: "HOURLY",
        hourlyRate: null,
        dailyRate: null,
        totalQuantity: 1
      })
    });
    assert(bothNullRes.status === 400, "Frontend payload with both rates null rejected with 400 Bad Request");

    // Mismatched pricing unit without usable rate: pricingUnit DAILY but only hourlyRate provided
    const mismatchUnitRes = await fetch(`${baseUrl}/equipment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${prov1Token}`
      },
      body: JSON.stringify({
        name: "Mismatch Unit Item",
        category: "Lighting",
        brand: "Godox",
        model: "SL60W",
        description: "Video light.",
        condition: "GOOD",
        city: "Delhi",
        address: "Saket",
        pricingUnit: "DAILY",
        hourlyRate: 100,
        dailyRate: null,
        totalQuantity: 1
      })
    });
    assert(mismatchUnitRes.status === 400, "Selected pricing unit without corresponding rate rejected with 400 Bad Request");

    // 11. Inactive Listing Access & Rental Guardrails
    console.log("\n--- 11. Inactive Listing Access Guardrails ---");
    // Provider deactivates dailyOnlyId (isActive: false)
    const deactivateRes = await fetch(`${baseUrl}/equipment/${dailyOnlyId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${prov1Token}`
      },
      body: JSON.stringify({ isActive: false })
    });
    assert(deactivateRes.status === 200, "Provider deactivates listing: isActive = false (200 OK)");

    // Public unauthenticated request for inactive listing returns 404
    const publicInactiveRes = await fetch(`${baseUrl}/equipment/${dailyOnlyId}`);
    assert(publicInactiveRes.status === 404, "Public unauthenticated GET for inactive listing returns 404 Not Found");

    // Authenticated non-owner creator request for inactive listing returns 404
    const creatorInactiveRes = await fetch(`${baseUrl}/equipment/${dailyOnlyId}`, {
      headers: { "Authorization": `Bearer ${creat1Token}` }
    });
    assert(creatorInactiveRes.status === 404, "Non-owner creator GET for inactive listing returns 404 Not Found");

    // Authenticated owner provider request for inactive listing succeeds (200 OK)
    const ownerInactiveRes = await fetch(`${baseUrl}/equipment/${dailyOnlyId}`, {
      headers: { "Authorization": `Bearer ${prov1Token}` }
    });
    assert(ownerInactiveRes.status === 200, "Owner provider GET for own inactive listing returns 200 OK");
    const ownerInactiveData = await ownerInactiveRes.json();
    assert(ownerInactiveData.equipment.isActive === false, "Owner sees inactive status on their listing");

    // Attempting to rent inactive listing rejected with 400 Bad Request
    const rentInactiveRes = await fetch(`${baseUrl}/rentals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${creat1Token}`
      },
      body: JSON.stringify({
        equipmentId: dailyOnlyId,
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        quantity: 1
      })
    });
    assert(rentInactiveRes.status === 400, "Rental request for inactive listing rejected with 400 Bad Request");

    // Re-activate listing for subsequent tests
    await fetch(`${baseUrl}/equipment/${dailyOnlyId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${prov1Token}`
      },
      body: JSON.stringify({ isActive: true })
    });

    // 12. Price Filter Accuracy & Input Validation
    console.log("\n--- 12. Price Filter Accuracy & Validation ---");
    // Invalid minPrice (< 0) rejected with 400
    const negativeMinRes = await fetch(`${baseUrl}/equipment?minPrice=-10`);
    assert(negativeMinRes.status === 400, "Negative minPrice rejected with 400 Bad Request");

    // minPrice > maxPrice rejected with 400
    const invertedPriceRes = await fetch(`${baseUrl}/equipment?minPrice=5000&maxPrice=500`);
    assert(invertedPriceRes.status === 400, "minPrice > maxPrice rejected with 400 Bad Request");

    // Hourly filter between 200 and 300 should match hourlyOnlyId (rate: 250)
    const hourlyFilterRes = await fetch(`${baseUrl}/equipment?pricingUnit=HOURLY&minPrice=200&maxPrice=300`);
    const hourlyFilterData = await hourlyFilterRes.json();
    const hList = Array.isArray(hourlyFilterData) ? hourlyFilterData : hourlyFilterData.equipment || [];
    assert(hList.some(e => e.id === hourlyOnlyId), "Hourly price filter accurately includes 250/hr item");
    assert(hList.every(e => e.pricingUnit === "HOURLY" && e.hourlyRate >= 200 && e.hourlyRate <= 300), "Hourly filter returns only valid hourly matches");

    // Daily item (rate: 1800) must NOT falsely match an hourly filter range of 1500-2000
    const hourlyMismatchRes = await fetch(`${baseUrl}/equipment?pricingUnit=HOURLY&minPrice=1500&maxPrice=2000`);
    const hourlyMismatchData = await hourlyMismatchRes.json();
    const hmList = Array.isArray(hourlyMismatchData) ? hourlyMismatchData : hourlyMismatchData.equipment || [];
    assert(!hmList.some(e => e.id === dailyOnlyId), "Daily rate of 1800 does NOT falsely match hourly price filter");

    // 13. Availability Endpoint & Multi-Unit Calculation
    console.log("\n--- 13. Equipment Availability Endpoint ---");
    const availStart = new Date(Date.now() + 100 * 60 * 60 * 1000).toISOString();
    const availEnd = new Date(Date.now() + 104 * 60 * 60 * 1000).toISOString();

    // Query availability before any rental: totalQuantity = 3, reserved = 0, available = 3
    const initialAvailRes = await fetch(`${baseUrl}/equipment/${hourlyOnlyId}/availability?startTime=${availStart}&endTime=${availEnd}`);
    assert(initialAvailRes.status === 200, "GET /api/equipment/:id/availability returns 200 OK");
    const initialAvail = await initialAvailRes.json();
    assert(initialAvail.totalQuantity === 3, "Availability reports correct total quantity (3)");
    assert(initialAvail.reservedQuantity === 0, "Initial reserved quantity is 0");
    assert(initialAvail.availableQuantity === 3, "Available quantity is 3");
    assert(initialAvail.isAvailable === true, "isAvailable is true");

    // Creator 1 rents 2 units of hourlyOnlyId during this window
    const rent2Res = await fetch(`${baseUrl}/rentals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${creat1Token}`
      },
      body: JSON.stringify({
        equipmentId: hourlyOnlyId,
        startTime: availStart,
        endTime: availEnd,
        quantity: 2
      })
    });
    assert(rent2Res.status === 201, "Rental of 2 units created (201 Created)");
    const rent2Id = (await rent2Res.json()).rental.id;

    // Check availability again: reserved = 2, available = 1, isAvailable = true
    const updatedAvailRes = await fetch(`${baseUrl}/equipment/${hourlyOnlyId}/availability?startTime=${availStart}&endTime=${availEnd}`);
    const updatedAvail = await updatedAvailRes.json();
    assert(updatedAvail.reservedQuantity === 2, "Reserved quantity updated to 2");
    assert(updatedAvail.availableQuantity === 1, "Remaining available quantity is 1");
    assert(updatedAvail.isAvailable === true, "isAvailable is true (1 remaining)");

    // 14. Inventory Quantity Safety & Transactional Peak Reduction Rejection
    console.log("\n--- 14. Concurrency-Safe Inventory Reduction ---");
    // hourlyOnlyId has 2 active reserved units during [availStart, availEnd].
    // Provider attempts to reduce totalQuantity from 3 down to 1: must be REJECTED (409 Conflict)
    const unsafeReductionRes = await fetch(`${baseUrl}/equipment/${hourlyOnlyId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${prov1Token}`
      },
      body: JSON.stringify({ totalQuantity: 1 })
    });
    assert(unsafeReductionRes.status === 409, "Inventory reduction below peak active reservations rejected with 409 Conflict");

    // Provider reduces totalQuantity to 2: allowed because peak overlap is 2 (200 OK)
    const safeReductionRes = await fetch(`${baseUrl}/equipment/${hourlyOnlyId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${prov1Token}`
      },
      body: JSON.stringify({ totalQuantity: 2 })
    });
    assert(safeReductionRes.status === 200, "Inventory reduction down to peak reservation level (2) succeeds (200 OK)");

    // 15. Server-Side Pagination Metadata
    console.log("\n--- 15. Server-Side Pagination ---");
    const pagedRes = await fetch(`${baseUrl}/equipment?page=1&limit=2`);
    assert(pagedRes.status === 200, "GET /api/equipment with pagination returns 200 OK");
    const pagedData = await pagedRes.json();
    assert(Boolean(pagedData.pagination), "Response includes pagination metadata object");
    assert(pagedData.pagination.page === 1, "Pagination page is 1");
    assert(pagedData.pagination.limit === 2, "Pagination limit is 2");
    assert(pagedData.pagination.total >= 3, "Pagination total reflects total catalog items");
    assert(pagedData.pagination.totalPages >= 2, "Pagination totalPages correctly calculated");
    assert(Array.isArray(pagedData.equipment) && pagedData.equipment.length <= 2, "Returned equipment array is paginated to limit");

    // 16. Complete Rental Lifecycle (Approved -> Active -> Returned -> Completed)
    console.log("\n--- 16. Complete Rental Lifecycle Flow ---");
    // Provider approves rent2: PENDING -> APPROVED
    const appRes = await fetch(`${baseUrl}/rentals/${rent2Id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${prov1Token}`
      },
      body: JSON.stringify({ status: "APPROVED", expectedCurrentStatus: "PENDING" })
    });
    assert(appRes.status === 200, "Provider approves rental: PENDING -> APPROVED (200 OK)");

    // Provider hands over gear: APPROVED -> ACTIVE
    const actRes = await fetch(`${baseUrl}/rentals/${rent2Id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${prov1Token}`
      },
      body: JSON.stringify({ status: "ACTIVE", expectedCurrentStatus: "APPROVED" })
    });
    assert(actRes.status === 200, "Provider hands over gear: APPROVED -> ACTIVE (200 OK)");

    // Provider marks returned: ACTIVE -> RETURNED
    const retRes = await fetch(`${baseUrl}/rentals/${rent2Id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${prov1Token}`
      },
      body: JSON.stringify({ status: "RETURNED", expectedCurrentStatus: "ACTIVE" })
    });
    assert(retRes.status === 200, "Provider marks gear returned: ACTIVE -> RETURNED (200 OK)");

    // Provider marks completed: RETURNED -> COMPLETED
    const compRes = await fetch(`${baseUrl}/rentals/${rent2Id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${prov1Token}`
      },
      body: JSON.stringify({ status: "COMPLETED", expectedCurrentStatus: "RETURNED" })
    });
    assert(compRes.status === 200, "Provider completes rental: RETURNED -> COMPLETED (200 OK)");
    const compData = await compRes.json();
    assert(compData.rental.status === "COMPLETED", "Final rental status is COMPLETED");

    // Blocked invalid transition: cannot change COMPLETED to PENDING or ACTIVE
    const blockedCompRes = await fetch(`${baseUrl}/rentals/${rent2Id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${prov1Token}`
      },
      body: JSON.stringify({ status: "ACTIVE", expectedCurrentStatus: "COMPLETED" })
    });
    assert(blockedCompRes.status === 400, "Transition from COMPLETED terminal state blocked with 400 Bad Request");

    // Clean up test records
    await prisma.equipmentRental.deleteMany({
      where: {
        OR: [
          { creator: { email: { in: TEST_EMAILS } } },
          { equipment: { provider: { email: { in: TEST_EMAILS } } } }
        ]
      }
    });
    await prisma.equipment.deleteMany({
      where: { provider: { email: { in: TEST_EMAILS } } }
    });
    await prisma.user.deleteMany({
      where: { email: { in: TEST_EMAILS } }
    });
    console.log("\n  ✓ Test equipment and rental records purged from database.");

  } catch (err) {
    console.error("Test execution encountered an error:", err);
    failed++;
  } finally {
    server.close();
    await prisma.$disconnect();
  }

  console.log(`\n======================================================`);
  console.log(` Equipment & Rental Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`======================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runEquipmentRentalTests().catch((err) => {
  console.error("Unhandled error running tests:", err);
  process.exit(1);
});
