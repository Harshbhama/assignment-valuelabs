// supertest wraps the app and binds an ephemeral port for each test run,
// so no server needs to be started manually before running the suite.
import request from "supertest";
import app from "../app";

describe("GET /api/health", () => {
  it("returns 200 with status ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});

describe("POST /api/submit", () => {
  it("returns 400 when all fields are missing", async () => {
    const res = await request(app).post("/api/submit");
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    // The error message should name the first missing field so the client
    // knows exactly what to fix, not just that something went wrong.
    expect(res.body.error).toContain("make");
  });

  it("returns 400 when logbook file is missing", async () => {
    const res = await request(app)
      .post("/api/submit")
      .field("make", "tesla")
      .field("model", "Model 3")
      .field("badge", "Performance");
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain("logbook");
  });

  it("returns 400 when a non-.txt file is uploaded", async () => {
    // Verifies that the multer fileFilter rejects disallowed MIME types
    // before the controller logic runs.
    const res = await request(app)
      .post("/api/submit")
      .field("make", "tesla")
      .field("model", "Model 3")
      .field("badge", "Performance")
      .attach("logbook", Buffer.from("data"), {
        filename: "logbook.pdf",
        contentType: "application/pdf",
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("returns 200 with correct shape for a valid submission", async () => {
    // Buffer.from(...) lets supertest attach an in-memory file without
    // touching the filesystem during the test.
    const res = await request(app)
      .post("/api/submit")
      .field("make", "tesla")
      .field("model", "Model 3")
      .field("badge", "Performance")
      .attach("logbook", Buffer.from("Oil change at 50000km"), {
        filename: "logbook.txt",
        contentType: "text/plain",
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.vehicle).toEqual({
      make: "tesla",
      model: "Model 3",
      badge: "Performance",
    });
    expect(res.body.logbookContents).toBe("Oil change at 50000km");
  });

  it("trims whitespace from make, model and badge fields", async () => {
    // Ensures the controller normalises user input rather than storing
    // padded strings that would silently fail downstream comparisons.
    const res = await request(app)
      .post("/api/submit")
      .field("make", "  bmw  ")
      .field("model", "  130d  ")
      .field("badge", "  xDrive 26d  ")
      .attach("logbook", Buffer.from("log entry"), {
        filename: "logbook.txt",
        contentType: "text/plain",
      });
    expect(res.status).toBe(200);
    expect(res.body.vehicle).toEqual({
      make: "bmw",
      model: "130d",
      badge: "xDrive 26d",
    });
  });
});
