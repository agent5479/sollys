import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { MarketingPage } from "./pages/Marketing";
import { TrackPage } from "./pages/Track";
import { SignInPage } from "./pages/SignIn";
import { DriverPage } from "./pages/Driver";
import { OpsPage } from "./pages/Ops";
import { ClientPage } from "./pages/Client";

export function App() {
  const loc = useLocation();

  useEffect(() => {
    const marketing = loc.pathname === "/" || loc.pathname.startsWith("/track");
    if (marketing) {
      document.documentElement.dataset.seoReady = "true";
    } else {
      delete document.documentElement.dataset.seoReady;
    }
    return () => {
      delete document.documentElement.dataset.seoReady;
    };
  }, [loc.pathname]);

  return (
    <Routes>
      <Route path="/" element={<MarketingPage />} />
      <Route path="/track" element={<TrackPage />} />
      <Route path="/track/" element={<TrackPage />} />
      <Route path="/app/signin" element={<SignInPage />} />
      <Route path="/app/signin/" element={<SignInPage />} />
      <Route path="/app/driver" element={<DriverPage />} />
      <Route path="/app/ops" element={<OpsPage />} />
      <Route path="/app/client" element={<ClientPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
