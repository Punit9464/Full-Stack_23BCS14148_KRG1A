import { Link } from 'react-router';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
      <img
        src="https://i.imgur.com/VAnsyjv.png"
        alt="Coding Meme"
        className="w-96 max-w-full mb-6 rounded-xl shadow-lg"
      />

      <h1 className="text-5xl font-bold mb-4 text-lavender-400">404</h1>
      <p className="text-xl mb-6 text-gray-300 text-center">
        Oops! Looks like this page got lost in the code.
      </p>

      <Link
        to="/"
        className="bg-lavender-400 text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-lavender-300 transition"
      >
        Go Back to Analyzer
      </Link>
    </div>
  );
}