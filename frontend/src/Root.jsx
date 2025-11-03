import {Outlet} from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer.jsx";

const Root = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Root;
