"use strict";

const asyncHandler = require("../../src/utils/asyncHandler");
const AppError = require("../../src/utils/AppError");

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("asyncHandler", () => {
  it("calls the wrapped function with (req, res, next)", async () => {
    const fn = jest.fn().mockResolvedValue(undefined);
    const req = { body: {} };
    const res = mockRes();
    const next = jest.fn();

    await asyncHandler(fn)(req, res, next);

    expect(fn).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next(err) when the wrapped function throws synchronously", async () => {
    const thrownError = new Error("sync error");
    const fn = jest.fn().mockRejectedValue(thrownError);
    const next = jest.fn();

    await asyncHandler(fn)({}, mockRes(), next);

    expect(next).toHaveBeenCalledWith(thrownError);
  });

  it("calls next(err) when the wrapped function returns a rejected promise", async () => {
    const thrownError = AppError.unauthorized("Not logged in");
    const fn = async () => {
      throw thrownError;
    };
    const next = jest.fn();

    await asyncHandler(fn)({}, mockRes(), next);

    expect(next).toHaveBeenCalledWith(thrownError);
    expect(next.mock.calls[0][0]).toBeInstanceOf(AppError);
  });

  it("does NOT call next when the wrapped function resolves successfully", async () => {
    const fn = async (_req, res) => {
      res.status(200).json({ ok: true });
    };
    const res = mockRes();
    const next = jest.fn();

    await asyncHandler(fn)({}, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
