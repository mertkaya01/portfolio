import { createBrowserRouter } from 'react-router'

import { NotFoundPage, RouteErrorPage } from '@/features/not-found/NotFoundPage'
import { HomePage } from '@/features/portfolio/HomePage'
import { ProjectPage } from '@/features/projects/ProjectPage'

import { RootLayout } from './RootLayout'

// Every URL of the site and the page it shows
export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    ErrorBoundary: RouteErrorPage, // a page crashed → a friendly error instead of a blank screen
    children: [
      { index: true, Component: HomePage }, // "/"
      { path: 'projects/:slug', Component: ProjectPage }, // "/projects/hotel-commerce-service"
      { path: '*', Component: NotFoundPage }, // anything else → 404
    ],
  },
])
