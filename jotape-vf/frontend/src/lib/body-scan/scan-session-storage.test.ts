import {
  createEmptyBodyScanSession,
  loadBodyScanSession,
  saveBodyScanSession,
  clearBodyScanSession,
} from "@/lib/body-scan/scan-session-storage";

describe("scan-session-storage", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("creates and persists a session", () => {
    const session = createEmptyBodyScanSession();
    saveBodyScanSession(session);
    expect(loadBodyScanSession()?.id).toBe(session.id);
  });

  it("clears stored session", () => {
    saveBodyScanSession(createEmptyBodyScanSession());
    clearBodyScanSession();
    expect(loadBodyScanSession()).toBeNull();
  });
});
