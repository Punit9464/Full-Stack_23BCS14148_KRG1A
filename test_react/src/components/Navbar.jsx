import { NavLink } from "react-router";

function Navbar() {
    return(
        <nav className="flex items-center justify-between bg-black text-yellow-300 pr-10">
            <h1 className="py-6 text-2xl font-extrabold pl-10">Full Stack Verse</h1>
            <NavLink to={"/signup"}> Signup </NavLink>
        </nav>
    );
}   

export default Navbar;