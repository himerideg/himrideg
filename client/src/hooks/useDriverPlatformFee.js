import { useCallback, useEffect, useState } from "react";
import api from "../api";

export default function useDriverPlatformFee() {
  const [status, setStatus] = useState({
    due: 0,
    threshold: 100,
    blocked: false,
    canAcceptRides: true,
    reminderRequired: false,
    paymentReady: true,
    totalCommissionPaid: 0,
    testMode: false
  });
  const [loading, setLoading] = useState(false);

  const refreshPlatformFee = useCallback(async () => {
    setLoading(true);
    try {
      const [feeResponse, testModeResponse] = await Promise.all([
        api.get("/driver/platform-fee"),
        api.get("/driver/test-mode").catch(() => ({ data: { data: { enabled: false } } }))
      ]);

      const data = feeResponse?.data?.data || feeResponse?.data || {};
      const testData = testModeResponse?.data?.data || testModeResponse?.data || {};
      const due = Math.max(0, Number(data?.due || 0));
      const threshold = Math.max(1, Number(data?.threshold || 100));
      const testMode = Boolean(testData?.enabled);
      const blocked = testMode
        ? false
        : Boolean(data?.blocked ?? due >= threshold);

      const next = {
        due,
        threshold,
        blocked,
        canAcceptRides: testMode
          ? true
          : Boolean(data?.canAcceptRides ?? !blocked),
        reminderRequired: testMode
          ? false
          : Boolean(data?.reminderRequired ?? due > 0),
        paymentReady: Boolean(data?.paymentReady ?? true),
        totalCommissionPaid: Math.max(0, Number(data?.totalCommissionPaid || 0)),
        testMode,
        testModeNote: String(testData?.note || ""),
        lastTestResetAt: testData?.lastResetAt || null,
        lastTestResetAmount: Math.max(0, Number(testData?.lastResetAmount || 0))
      };

      setStatus(next);
      return next;
    } catch (error) {
      console.error("Platform fee status load error:", error?.response?.data?.message || error?.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshPlatformFee().catch(() => {});
  }, [refreshPlatformFee]);

  return {
    ...status,
    loading,
    refreshPlatformFee
  };
}
