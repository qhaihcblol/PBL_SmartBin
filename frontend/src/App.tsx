import { Route, Routes } from "react-router-dom"
import './App.css'
import Navbar from './components/Navbar'
import Create from './pages/Create'
import Delete from './pages/Delete'
import Edit from './pages/Edit'
import Home from './pages/Home'
function App() {
  return (
    <>
      <Navbar
        content={
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<Create />} />
            <Route path="/delete/:id" element={<Delete />} />
            <Route path="/edit/:id" element={<Edit />} />
          </Routes>
        }
      />
    </>
  )
}

export default App
