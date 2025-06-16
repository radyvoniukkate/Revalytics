import { Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage/MainPage.jsx";
import AnalyticPage from "./pages/AnalyticPage/AnalyticPage.jsx";
import Layout from "./components/Layout/Layout.jsx";
import NewsPage from "./pages/NewsPage/NewsPage.jsx";
import AuthPage from "./pages/AuthPage/AuthPage.jsx";
import UserPage from "./pages/UserPage/UserPage.jsx";
import { selectIsLoggedIn } from "./redux/real_estate/selector.js";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const App = () => {
  const isLoggedIn = useSelector(selectIsLoggedIn);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<MainPage />} />
        <Route path="/analytics" element={<AnalyticPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/user" element={<UserPage />} />
        <Route
          path="/auth"
          element={isLoggedIn ? <Navigate to="/user" /> : <AuthPage />}
        />
      </Route>
    </Routes>
  );
};

export default App;
