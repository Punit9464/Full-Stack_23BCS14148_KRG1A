import React, { useState, useEffect } from 'react';

function App() {
  const [books, setBooks] = useState([]);
  const [formData, setFormData] = useState({ title: '', author: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [editingBookId, setEditingBookId] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3000/books')
      .then(res => res.json())
      .then(data => setBooks(data));
  }, []);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (editingBookId) {
      fetch(`http://localhost:3000/books/${editingBookId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
        .then(res => res.json())
        .then(updatedBook => {
          setBooks(books.map(book => (book.id === editingBookId ? updatedBook : book)));
          setEditingBookId(null);
          setFormData({ title: '', author: '' });
        });
    } else {
      fetch('http://localhost:3000/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
        .then(res => res.json())
        .then(newBook => {
          setBooks([...books, newBook]);
          setFormData({ title: '', author: '' });
        });
    }
  };

  const handleEdit = book => {
    setEditingBookId(book.id);
    setFormData({ title: book.title, author: book.author });
  };

  const handleDelete = id => {
    fetch(`http://localhost:3000/books/${id}`, {
      method: 'DELETE',
    }).then(() => {
      setBooks(books.filter(book => book.id !== id));
    });
  };

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Library Management</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <div className="flex gap-4">
            <input
              name="title"
              placeholder="Title"
              value={formData.title}
              onChange={handleChange}
              required
              className="flex-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            <input
              name="author"
              placeholder="Author"
              value={formData.author}
              onChange={handleChange}
              required
              className="flex-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {editingBookId ? 'Update' : 'Add'} Book
          </button>
        </form>

        <input
          placeholder="Search by title..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full p-2 mb-6 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />

        <ul className="space-y-3">
          {filteredBooks.map(book => (
            <li key={book.id} className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
              <div>
                <strong className="text-gray-900">{book.title}</strong>
                <span className="text-gray-600 ml-2">by {book.author}</span>
              </div>
              <div className="space-x-2">
                <button 
                  onClick={() => handleEdit(book)}
                  className="bg-yellow-500 text-white py-1 px-3 rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(book.id)}
                  className="bg-red-500 text-white py-1 px-3 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;