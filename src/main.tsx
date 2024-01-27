import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import './index.css'

import Root from './routes/root'
import Viewer from "./routes/viewer";


const router = createBrowserRouter([
  {
    path: '/',
    element: <Root/>
  },
  {
    path: '/s/:key',
    element: <Viewer />
  }
])


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>,
)
