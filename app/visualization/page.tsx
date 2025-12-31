"use client"

import React, { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import CommitHistory from '@/components/CommitHistory'
import TopContributors from '@/components/TopContributors'
import RepoActivity from '@/components/RepoActivity'
import RepoSummary from '@/components/RepoSummary'
import { ArrowLeft } from 'lucide-react'
import { transformRepoToGraph } from '@/utils/graphData'
import ForceGraph from '@/components/ForceGraph'

interface RepoItem {
  type: 'dir' | 'file';
  path: string;
  name: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  children?: RepoItem[];
}

interface RepoData {
  readme: string;
  files: RepoItem[];
  branch: string;
}

const VisualizationContent = () => {
  const searchParams = useSearchParams()
  const [data, setData] = useState<RepoData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stars, setStars] = useState<{ top: number; left: number; size: number; delay: number; opacity: number }[]>([])

  // Get parameters from URL
  const owner = searchParams.get('owner')
  const repo = searchParams.get('repo')
  const branch = searchParams.get('branch')
  const depth = searchParams.get('depth') || '3' // Default to 3 levels deep

  // Generate stars for the background - keeping it subtle and elegant
  useEffect(() => {
    const generateStars = () => {
      const newStars = []
      for (let i = 0; i < 100; i++) {
        newStars.push({
          top: Math.random() * 100,
          left: Math.random() * 100,
          size: Math.random() * 1.5 + 0.2, // Smaller stars
          delay: Math.random() * 5,
          opacity: Math.random() * 0.5 + 0.1 // More subtle opacity
        })
      }
      setStars(newStars)
    }

    generateStars()
  }, [])

  // Fetch repository data
  useEffect(() => {
    const fetchData = async () => {
      if (!owner || !repo) {
        setError('Missing repository information')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const branchParam = branch ? `&branch=${encodeURIComponent(branch)}` : ''
        const depthParam = `&depth=${encodeURIComponent(depth)}`
        const res = await fetch(`/api/fetchRepo?owner=${owner}&repo=${repo}${branchParam}${depthParam}`)

        if (!res.ok) {
          throw new Error(`Failed to fetch repository: ${res.status} ${res.statusText}`)
        }

        const repoData = await res.json()
        setData(repoData)
      } catch (error) {
        console.error('Error fetching repository:', error)
        setError(error instanceof Error ? error.message : 'Failed to fetch repository data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [owner, repo, branch, depth])

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#000510] to-[#001030] text-white relative overflow-hidden">
      {/* Subtle star background */}
      {stars.map((star, index) => (
        <div
          key={index}
          className="absolute rounded-full animate-twinkle"
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: '#ffffff',
            opacity: star.opacity,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}

      {/* Main content */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex justify-between items-center mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="text-slate-300 hover:text-white flex items-center transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-2xl md:text-3xl font-light tracking-wider text-slate-100"
          >
            Astro Repo
          </motion.h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-[70vh]">
            <div className="flex flex-col items-center">
              <div className="relative h-16 w-16">
                <div className="absolute inset-0 rounded-full border-t-2 border-slate-400 animate-spin"></div>
                <div className="absolute inset-3 rounded-full border-t-2 border-slate-200 animate-spin-slow"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-white"></div>
                </div>
              </div>
              <p className="text-lg text-slate-300 mt-4 font-light">Exploring the cosmos...</p>
            </div>
          </div>
        ) : error ? (
          <div className="max-w-2xl mx-auto bg-[rgba(0,10,30,0.5)] backdrop-blur-sm rounded-lg p-8 border border-red-900/30 shadow-lg">
            <h2 className="text-2xl font-light text-red-300 mb-4">Error</h2>
            <p className="text-slate-300 mb-6">{error}</p>
            <Link href="/" className="bg-slate-800 text-white font-light px-6 py-3 rounded-md hover:bg-slate-700 transition-all duration-300">
              Try Again
            </Link>
          </div>
        ) : data && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="max-w-6xl mx-auto"
          >
            <h2 className="text-2xl font-light mb-6 text-center text-slate-200">
              <span className="text-slate-100">
                {owner}/{repo}{branch ? ` (${branch})` : ''}
              </span>
            </h2>

            {/* Components for visualization */}
            <div className="flex flex-col space-y-12">
              {/* 3D Visualization Container */}
              <div className="flex w-full justify-center">
                <ForceGraph
                  graphData={transformRepoToGraph(data)}
                  repoName={`${owner}/${repo}`}
                  owner={owner!}
                  repo={repo!}
                  branch={branch || 'main'}
                />
              </div>

              {/* Repository Summary */}
              <div className="w-full">
                <RepoSummary repoData={data} repoUrl={`https://github.com/${owner}/${repo}`} />
              </div>

              {/* Activity and Contributors Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <CommitHistory
                    owner={owner || ''}
                    repo={repo || ''}
                    branch={branch || 'main'}
                  />
                </div>
                <div className="lg:col-span-1">
                  <TopContributors
                    owner={owner || ''}
                    repo={repo || ''}
                  />
                </div>
                <div className="lg:col-span-1">
                  <RepoActivity
                    owner={owner || ''}
                    repo={repo || ''}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="mt-16 text-center text-sm text-slate-400 opacity-70">
          <p>© {new Date().getFullYear()} Astro Repo | Venture through the digital universe</p>
        </div>
      </div>
    </div>
  )
}

// Main page component with Suspense boundary
const VisualizationPage = () => {
  return (
    <Suspense 
      fallback={
        <div className="flex justify-center items-center h-screen bg-gradient-to-b from-[#000510] to-[#001030]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
        </div>
      }
    >
      <VisualizationContent />
    </Suspense>
  )
}

export default VisualizationPage
