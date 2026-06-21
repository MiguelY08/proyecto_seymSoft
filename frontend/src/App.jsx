import AppRouter from "./app/router/appRouter";
import GooglePasswordSetupGuard from "./Features/access/components/GooglePasswordSetupGuard.jsx";

function App() {
  return (
    <>
      <GooglePasswordSetupGuard />
      <AppRouter />
    </>
  );
}

export default App;