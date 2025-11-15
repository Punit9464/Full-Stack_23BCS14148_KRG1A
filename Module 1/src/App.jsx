import { BrowserRouter, Routes, Route } from 'react-router';
import Dashboard from './pages/Dashboard';

function App() {
    return(
        <BrowserRouter>
            <Routes>
                <Route index={true} element={<Dashboard />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;