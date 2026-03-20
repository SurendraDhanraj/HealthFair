import { Outlet } from 'react-router-dom';

export function Layout() {
    return (
        <div className="font-body antialiased min-h-screen">
            <Outlet />
        </div>
    );
}
