import { Link, Outlet, useLocation } from "react-router-dom";

const Sidebar = () => {
    const location = useLocation();

    const getLinkClass = (path: string) =>
        location.pathname === path
            ? "bg-green-600 text-white px-3 py-2 rounded-xl"
            : "border border-green-600 text-green-600 px-3 py-2 rounded-xl";

    return (
        <aside className={`h-full transition-all`}>
            <nav className="h-full flex flex-col border-gray-200 border-r shadow-lg text-gray-900">
                <div className="p-4 pb-2 flex justify-center items-center">
                    <Link
                        to="/"
                        className="flex gap-1 items-center text-2xl font-bold"
                    >
                        <img className="w-8 h-8" src="/logo.png" alt="logo" />
                        Fabrications
                    </Link>
                </div>
                <ul className="flex flex-col w-72 text-lg gap-2 px-3">
                    <Link to="/">
                        <div className={getLinkClass("/")}>Dashboard</div>
                    </Link>
                    <Link to="/machines">
                        <div className={getLinkClass("/machines")}>
                            Machine Details
                        </div>
                    </Link>
                </ul>
            </nav>
        </aside>
    );
};

const DashboardLayout = () => {
    return (
        <main className="flex h-screen w-screen overflow-hidden bg-white ">
            <Sidebar />
            <div className="flex h-screen bg-green-50 flex-col w-full overflow-auto">
                <Outlet />
            </div>
        </main>
    );
};

export default DashboardLayout;
