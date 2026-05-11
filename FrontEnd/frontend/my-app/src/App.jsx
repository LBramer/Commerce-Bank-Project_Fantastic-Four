import './App.css'
import Header from './components/Header'
import { Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Url from './pages/URL'
import Analysis from './pages/Analysis'

function App() {
  return (
    <div className="page-container">
      <Header />
      <div className='seperator-bar'></div>
      <div className="content">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/urls" element={<Url />} />
          <Route path="/analysis" element={<Analysis />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
