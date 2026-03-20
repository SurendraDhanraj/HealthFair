import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Registration } from "./pages/Registration";
import { Vitals } from "./pages/Vitals";
import { BloodPressure } from "./pages/BloodPressure";
import { Labs } from "./pages/Labs";
import { Report } from "./pages/Report";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="registration" element={<Registration />} />
          <Route path="vitals" element={<Vitals />} />
          <Route path="bp" element={<BloodPressure />} />
          <Route path="labs" element={<Labs />} />
          <Route path="report/:id" element={<Report />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
