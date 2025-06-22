// import css
import "@styles/globals.css";
import BybitNgnToUsdtTable from "../Dashboard";
import NgnCnyRateChart from "../components/NgnCnyRateChart";

function App() {
  return (
    <>
      <NgnCnyRateChart />
      <BybitNgnToUsdtTable />
    </>
  );
}

export default App;
