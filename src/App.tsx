import { MainScreen, SwitchEditorScreen } from "@/screens";

import {
  HashRouter as Router,
  Routes as RoutesPrimitive,
  Route,
} from "react-router-dom";
import TitleBar from "@/components/titlebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

type Route = {
  path: string;
  element: JSX.Element;
};

const routes: Route[] = [
  {
    path: "/",
    element: <MainScreen />,
  },
  {
    path: "/switchEditor",
    element: <SwitchEditorScreen />,
  },
];

function Routes({ routes }: { routes: Route[] }) {
  return (
    <RoutesPrimitive>
      {routes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={<Layout>{route.element}</Layout>}
        />
      ))}
    </RoutesPrimitive>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen">
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}

const queryClient = new QueryClient();

function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <Routes routes={routes} />
      </QueryClientProvider>
    </Router>
  );
}

export default App;
