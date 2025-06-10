import type {FC} from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Main/Layout.tsx";
import Dashboard from "./pages/dashboard.tsx";
import {AuthProvider} from "./context/AuthContext.tsx";
import {Login} from "./pages/Login.tsx";

const App: FC = () => {


  return (
      <AuthProvider>
   <BrowserRouter>
       <Routes>
            <Route path="/" element={<Navigate to="/sections" />}   />
           <Route
               path="/sections"
               element={
                   <Layout>
                       <Dashboard />
                   </Layout>

               }
           />

           <Route
           path="/droplet"
           element={
               <Layout>
                   <Dashboard />
               </Layout>

           }
           />
           <Route
               path="/analytics"
               element={
                   <Layout>
                       <Dashboard />
                   </Layout>

               }
           />
           <Route
               path="/sales"
               element={
                   <Layout>
                       <Dashboard />
                   </Layout>

               }
           />
           <Route
               path="/audience"
               element={
                   <Layout>
                       <Dashboard />
                   </Layout>

               }
           />
           <Route
               path="/mail"
               element={
                   <Layout>
                       <Dashboard />
                   </Layout>

               }
           />
           <Route path="/login" element={<Login />} />

           <Route path="*" element={<Navigate to="/" replace />} />


       </Routes>
   </BrowserRouter>
      </AuthProvider>
  )
}

export default App
