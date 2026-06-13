import './app.scss'
import Navbar from "./Componentes/Navbar.jsx";
import SideBar from "./Componentes/sideBar.jsx";
import {BrowserRouter as Router, Route} from "react-router-dom";

function App() {
  return (
    <Router>
      <Navbar />
        <div className="flex">
            <SideBar />
            <div className="content">

            </div>
        </div>
    </Router>
  )
}

export default App
