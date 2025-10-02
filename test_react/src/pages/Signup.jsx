function Signup(){
    return(
        <main className="h-dvh pt-10 bg-amber-300">
            <h1 className="text-center font-extrabold text-3xl">Signup Form</h1>
            <section className="mx-72 my-10" id="signupForm">
                <form className="flex flex-col justify-center items-center border border-black">
                    <input className="input" placeholder="Enter your username" type="text" name="username" id="username" />
                    <input className='input' placeholder="Enter the password" type="password" name="password" id="password" />
                </form>
            </section>
        </main>
    );
}

export default Signup;