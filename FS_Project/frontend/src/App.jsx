import { BrowserRouter, Routes, Route } from 'react-router';
import Dashboard from './pages/Dashboard';
import Debugger from './pages/Debugger';
import NotFound from './pages/NotFound';

function App() {
    return(
        <BrowserRouter>
            <Routes>
                <Route index={true} element={<Dashboard />} />
                <Route path='/debug' element={<Debugger />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;