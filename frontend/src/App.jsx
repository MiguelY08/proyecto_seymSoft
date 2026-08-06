import AppRouter from "./app/router/appRouter";
import GooglePasswordSetupGuard from "./Features/access/components/GooglePasswordSetupGuard.jsx";
import SessionTimeout from "./Features/access/components/SessionTimeout.jsx";

function App() {
  return (
    <>
      <GooglePasswordSetupGuard />
      <SessionTimeout />
      <AppRouter />
    </>
  );
}

export default App;