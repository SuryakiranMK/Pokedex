import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import router from './routes'
import { soundService } from './services/sound'
import { ToastContainer } from './components/ui/Toast'
import CustomAlertModal from './components/ui/CustomAlertModal'
import './styles/globals.css'

// Initialize query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

// Initialize Sound Service
soundService.init()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ToastContainer />
      <CustomAlertModal />
    </QueryClientProvider>
  </React.StrictMode>
)
