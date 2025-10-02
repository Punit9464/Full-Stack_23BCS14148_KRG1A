import { Link } from "react-router";

function Home() {
    return (
        <main className="h-dvh text-center text-white bg-red-500">
            <h1 className="font-extrabold text-3xl pt-4">Home Page</h1>
            <div className="px-10 py-5 flex flex-wrap mix-blend-luminosity justify-center">
                <img src="https://sm.ign.com/ign_in/review/m/marvels-sp/marvels-spider-man-ps4-review_1cpu.jpg" alt="Spider Man Remastered" className="w-sm min-h-fit" />
            </div>
            <p className="mt-10">
                <Link to={"/about"}>
                    Click here to go to About Page
                </Link>
            </p>
            <p className="mt-10">
                <Link to={"/contact"}>
                    Click here to go to Contact Page
                </Link>
            </p>
        </main>
    );
}

export default Home;