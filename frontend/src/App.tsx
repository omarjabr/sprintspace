import { FullPageLoader } from "@/components/layout/full-page-loader";
import PageNotFound from "@/components/layout/page-not-found";
import LoginPage from "@/pages/auth/Login";
import BoardsPage from "@/pages/Boards";
import ProjectKanban from "@/pages/ProjectKanban";
import Projects from "@/pages/Projects";
import { ProtectedRoute } from "@/utils/auth/ProtectedRoute";
import { UserProvider } from "@/utils/auth/UserProvider";
import { FrappeProvider } from "frappe-react-sdk";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { ErrorBoundary } from "./components/error-boundary";
import { ModalProvider } from "./components/providers/modal-provider";
import { Toaster } from "./components/ui/toast";
import MyTasks from "./pages/MyTasks";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/" element={<ProtectedRoute />}>
        <Route index element={<BoardsPage />} />
        <Route path=":id" element={<Projects />} />
        <Route path="projects" element={<BoardsPage />} />
        <Route path="projects/:id" element={<ProjectKanban />} />
        <Route path="my-tasks" element={<MyTasks />} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </>
  ),
  {
    basename: `/${import.meta.env.VITE_BASE_NAME}`,
  }
);

function App() {
  // We need to pass sitename only if the Frappe version is v15 or above.
  const getSiteName = () => {
    if (
      // @ts-ignore
      window.frappe?.boot?.versions?.frappe &&
      // @ts-ignore
      (window.frappe.boot.versions.frappe.startsWith("15") ||
        // @ts-ignore
        window.frappe.boot.versions.frappe.startsWith("16"))
    ) {
      // @ts-ignore
      return window.frappe?.boot?.sitename ?? import.meta.env.VITE_SITE_NAME;
    }
    return import.meta.env.VITE_SITE_NAME;
  };

  return (
    <FrappeProvider
      url={import.meta.env.VITE_FRAPPE_PATH ?? ""}
      socketPort={
        import.meta.env.VITE_SOCKET_PORT
          ? import.meta.env.VITE_SOCKET_PORT
          : undefined
      }
      siteName={getSiteName()}
    >
      <UserProvider>
        <ErrorBoundary>
          <RouterProvider
            router={router}
            fallbackElement={<FullPageLoader />}
          />
          <ModalProvider />
          <Toaster position="top-right" />
        </ErrorBoundary>
      </UserProvider>
    </FrappeProvider>
  );
}

export default App;
