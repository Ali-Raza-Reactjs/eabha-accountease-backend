import { Suspense } from "react";
import FallbackLoader from "./components/FallbackLoader/FallbackLoader";
import Routes from "./routes/Routes";

function App() {
  return (
    <>
      <Suspense fallback={<FallbackLoader />}>
        <Routes />
      </Suspense>
    </>
  );
}

export default App;
