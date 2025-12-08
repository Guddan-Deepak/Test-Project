import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom'

// Upstream Components (Auth, Public, etc)
import HomePage from './components/pages/Home/Homepage.jsx'
import Welcome from './components/pages/Welcome/Welcome.jsx'
import Login from './components/pages/Login/Login.jsx'
import Signup from './components/pages/Signup/Signup.jsx'
import VerifyEmail from './components/VerifyEmail.jsx'
import GoogleCallback from './components/GoogleCallback.jsx'
import CompleteProfile from './components/CompleteProfile.jsx'
import { AuthProvider } from './utils/authContext.jsx'
import Contact from './components/pages/contact/Contact.jsx'
import About from './components/pages/About/About.jsx'

// Analyst Dashboard Components
import DashboardLayout from './layouts/DashboardLayout.jsx'
import Overview from './pages/Overview.jsx'
import LiveLogs from './pages/LiveLogs.jsx'
import Incidents from './pages/Incidents.jsx'
import IncidentDetail from './pages/IncidentDetail.jsx'

// Admin Dashboard Components
import AdminLayout from './layouts/AdminLayout.jsx'
import AdminOverview from './pages/admin/AdminOverview.jsx'
import KnowledgeBase from './pages/admin/KnowledgeBase.jsx'
import Blocklist from './pages/admin/Blocklist.jsx'
import Users from './pages/admin/Users.jsx'
import AssignmentRequests from './pages/admin/AssignmentRequests.jsx'

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path='/' element={<App />} errorElement>

            <Route index element={<Welcome />} />
            <Route path='welcome' element={<HomePage />} />
            <Route path='login' element={<Login />} />
            <Route path='signup' element={<Signup />} />
            <Route path='verify-email' element={<VerifyEmail />} />
            <Route path='google/callback' element={<GoogleCallback />} />
            <Route path='complete-profile' element={<CompleteProfile />} />
            <Route path='contact' element={<Contact />} />
            <Route path='about' element={<About />} />

            {/* Analyst Dashboard */}
            <Route path='dashboard' element={<DashboardLayout />}>
                <Route index element={<Overview />} />
                <Route path='logs' element={<LiveLogs />} />
                <Route path='incidents' element={<Incidents />} />
                <Route path='incidents/:id' element={<IncidentDetail />} />
            </Route>

            {/* Admin Dashboard */}
            <Route path='admin' element={<AdminLayout />}>
                <Route index element={<AdminOverview />} />
                <Route path='knowledge' element={<KnowledgeBase />} />
                <Route path='blocklist' element={<Blocklist />} />
                <Route path='users' element={<Users />} />
                <Route path='assignment-requests' element={<AssignmentRequests />} />
                <Route path='incidents' element={<div className="text-white p-8">Incident Management (Coming Soon)</div>} />
                <Route path='playbooks' element={<div className="text-white p-8">SOAR Playbooks (Coming Soon)</div>} />
                <Route path='audit' element={<div className="text-white p-8">Audit Logs (Coming Soon)</div>} />
                <Route path='settings' element={<div className="text-white p-8">System Settings (Coming Soon)</div>} />
            </Route>

        </Route>
    )
)

ReactDOM.createRoot(document.getElementById('root')).render(
    <AuthProvider>
        <RouterProvider router={router} />
    </AuthProvider>
)
