import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom'

import Welcome from './components/Welcome.jsx'
import Login from './components/Login.jsx'
import Signup from './components/Signup.jsx'

const router = createBrowserRouter(
    createRoutesFromElements(

        <Route path='/' element={<App />} errorElement>

            <Route index element={<Welcome />} />
            <Route path='login' element={<Login />} />
            <Route path='signup' element={<Signup />} />


        </Route>

    )
)
ReactDOM.createRoot(document.getElementById('root')).render(

    <RouterProvider router={router} />

)
