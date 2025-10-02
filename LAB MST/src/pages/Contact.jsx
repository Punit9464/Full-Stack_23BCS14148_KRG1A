import { useState } from "react";

function Contact() {
    const [formState, setFormState] = useState({
        name: "",
        email: "",
        course: ""
    });

    const [data, setData] = useState([
        {
            name: "Punit",
            email: "punit@gmail.com",
            course: "CSE"
        }
    ]);

    const handleInputChange = (e) => {
        setFormState((prevState) => {
            return {
                ...prevState,
                [e.target.name]: e.target.value
            };
        });
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        setData((prevData) => {
            return [
                ...prevData,
                formState
            ];
        });

        setFormState({
            name: "",
            email: "",
            course: ""
        });
    }
 
    return(
        <main className="text-white text-center bg-red-500 h-dvh">
            <h1 className="pt-4 text-3xl font-extrabold">Contact Page</h1>
            <div className="contactForm py-10">
                <form onSubmit={handleSubmit}>
                    <label className="label" htmlFor="name">Name:</label>
                    <input className="focus:outline-0 py-2" type="text" name="name" id="name" placeholder="Enter your name" value={formState.name} onChange={handleInputChange} /> <br />
                    <label className="label" htmlFor="email">Email:</label>
                    <input className="focus:outline-0 py-2" type="email" id="email" name="email" value={formState.email} onChange={handleInputChange} placeholder="Enter your mail"/> <br />
                    <label className="label" htmlFor="course">Course:</label>
                    <input className="focus:outline-0 py-2" type="text" name="course" value={formState.course} onChange={handleInputChange} id="course" placeholder="Enter your course" /> <br />
                    <button className="mt-4 bg-white text-red-500 px-4 py-2 rounded-lg" type="submit">Contact</button>
                </form>
            </div>
            <div className="flex flex-wrap justify-center">
                <table className="table border border-white">
                    <thead>
                        <tr>
                            <td>Name</td>
                            <td>Email</td>
                            <td>Course</td>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            data.map((d, i) => {
                                return <tr>
                                    <td>{d.name}</td>
                                    <td>{d.email}</td>
                                    <td>{d.course}</td>
                                </tr>
                            })
                        }
                    </tbody>
                </table>
            </div>
        </main>
    );
}
export default Contact;