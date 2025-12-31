"use client"

import * as React from "react"
import { Settings, Sparkles,  Layers,  Info, ChevronRight, ChevronLeft } from "lucide-react"
import { motion } from "framer-motion"
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { LoadingPulse } from './LoadingPulse';


interface SidebarProps {
  defaultOpen?: boolean
  position?: 'left' | 'right'
  summary?: string | null;
  fileName?: string;
  onClose?: () => void;

}


export function GeminiSidebar({ defaultOpen = false, position = "left", summary, fileName, onClose }: SidebarProps) {
  const [activeTab, setActiveTab] = React.useState("apis")
  const [showTooltip, setShowTooltip] = React.useState(false)
  const tooltipRef = React.useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  const sidebarRef = React.useRef<HTMLDivElement>(null)
  // const [isHovering, setIsHovering] = React.useState(false)
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }

    // setIsHovering(true)
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      // setIsHovering(false)
      setIsOpen(true)
    }, 300) // Delay before closing
  }

  // Close tooltip when clicking outside
  // React.useEffect(() => {
  //   const handleClickOutside = (event: MouseEvent) => {
  //     if (tooltipRef.current && !tooltipRef.current.contains(event.target as Noxde)) {
  //       setShowTooltip(false)
  //     }
  //   }

  //   document.addEventListener("mousedown", handleClickOutside)
  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside)
  //   }
  // }, [])

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        isOpen) {
        setIsOpen(false)
        onClose?.();
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  React.useEffect(() => {
    setIsOpen(defaultOpen);
  }, [defaultOpen]);

  // const stopScrollPropagation = (event: React.WheelEvent) => {
  //   event.stopPropagation();
  // };

  const preventScrollPropagation = (e: React.UIEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  return (
    <>
      {/* Hover trigger area */}
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`fixed ${position}-0 top-0   w-15 h-full z-30`}
      />

      <motion.div
        ref={sidebarRef}
        initial={{ x: position === 'right' ? '100%' : '-100%' }}
        animate={{ x: isOpen ? 0 : position === 'right' ? '100%' : '-100%' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`fixed ${position}-0 top-0 h-full w-fit z-20 flex overflow-hidden`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >

        <div className="p-2 ">


          <div className="backdrop-blur-2xl flex h-full w-full max-w-[400px] flex-col bg-slate-600/30 rounded-xl text-white overflow-hidden z-4000">
            {/* Add close button */}
            <button
              onClick={() => {
                setIsOpen(false);
                onClose?.();
              }}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
              aria-label="Close sidebar"
            >
              <div className="w-5 h-5 text-gray-400 hover:text-gray-200" />
            </button>

            {/* Header */}
            <div className="flex flex-col">
              {/* Tabs */}
              {/* <div className="flex w-full">
                <button
                  onClick={() => setActiveTab("apis")}
                  className={`flex flex-1 items-center justify-center gap-2 py-3 transition-all ${activeTab === "apis"
                    ? "border-b-2 border-b-gray-500 font-medium"
                    : "border-b-2 border-transparent text-gray-400 hover:text-gray-300"
                    }`}
                >
                  <Settings className="h-4 w-4 text-slate-400" />
                  <span>APIs</span>
                </button>
                <button
                  onClick={() => setActiveTab("tools")}
                  className={`flex flex-1 items-center justify-center gap-2 py-3 transition-all ${activeTab === "tools"
                    ? "border-b-2 border-gray-500 font-medium"
                    : "border-b-2 border-transparent text-gray-400 hover:text-gray-300"
                    }`}
                >
                  <Layers className="h-4 w-4" />
                  <span>Tools</span>
                </button>
              </div> */}

              {/* Tool buttons */}
              {/* <div className="flex justify-center gap-4 p-4">
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800/70 text-purple-300 transition-all hover:bg-gray-700 hover:text-purple-300">
              <Aperture className="h-5 w-5" />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800/70 transition-all hover:bg-gray-700 hover:text-purple-300">
              <Sparkles className="h-5 w-5" />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800/70 transition-all hover:bg-gray-700 hover:text-purple-300">
              <MonitorSmartphone className="h-5 w-5" />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800/70 transition-all hover:bg-gray-700 hover:text-purple-300">
              <Layers className="h-5 w-5" />
            </button>
          </div> */}
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col items-center justify-between overflow-auto py-8">
              <div className="flex flex-col items-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-700/70 shadow-[0_0_20px_rgba(168,85,247,0.15)]">
                  <Sparkles className="h-10 w-10 text-purple-300" />
                </div>
                {/* <h2 className="mb-1 text-2xl font-medium">Assistant</h2> */}
                <div className="flex items-center gap-1 text-sm text-gray-400">
                  <div className="relative">
                    <button onClick={() => setShowTooltip(!showTooltip)} className="inline-flex items-center justify-center">
                      <Info className="h-4 w-4 cursor-pointer" /> 
                    </button>
                    
                    {showTooltip && (
                      <div
                        ref={tooltipRef}
                        className="absolute top-full left-1/2 mb-2 -translate-x-1/2 rounded-md bg-gray-900/20 backdrop-blur-md px-3 py-1.5 text-xs shadow-lg min-w-fit flex items-center justify-center text-center"  
                      >
                        <p >Cosmic AI Assistant</p>
                        {/* <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-gray-800"></div> */}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Summary */}
              <div className="p-6 overflow-y-auto max-h-screen"
                onScroll={preventScrollPropagation}>
                {fileName && (
                  <h3 className="text-xl font-semibold text-purple-300 mb-4">
                    {fileName} 🗎 
                  </h3>
                )}
                <div className="prose prose-invert max-w-none">
                  {summary === 'Loading summary...' ? (
                    <LoadingPulse />
                  ) : summary ? (
                    // <ReactMarkdown
                    //   remarkPlugins={[remarkGfm]}
                    //   components={{
                    //     h1: ({ ...props }) => <h1 className="text-lg text-green-300 mb-2" {...props} />,
                    //     h2: ({ ...props }) => <h2 className="text-base text-yellow-200 mb-2" {...props} />,
                    //     h3: ({ ...props }) => <h3 className="text-sm text-red-100 mb-2" {...props} />,
                    //     // ul: ({ ...props }) => <ul className="list-disc pl-4 mb-2 text-gray-200" {...props} />,
                    //     // li: ({ ...props }) => <li className="mb-1" {...props} />,
                    //     p: ({ ...props }) => <p className="text-gray-200 mb-2" {...props} />,
                    //     code: (props) => {
                    //       const { inline, className, children, ...rest } = props as { inline?: boolean, className?: string, children?: React.ReactNode }
                    //       return inline
                    //         ? <code className="px-1 py-0.5 bg-gray-500 rounded text-gray-200" {...rest}>{children}</code>
                    //         : <code className="block p-2 bg-gray-700/40 rounded my-2 text-gray-200 w-fit" {...rest}>{children}</code>
                    //     }
                    //   }}
                    // >
                    //   {summary || ''}
                    // </ReactMarkdown>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ ...props }) => <h1 className="text-lg text-green-300 mb-2" {...props} />,
                        h2: ({ ...props }) => <h2 className="text-base text-yellow-200 mb-2" {...props} />,
                        h3: ({ ...props }) => <h3 className="text-sm text-red-100 mb-2" {...props} />,

                        ul: ({ ...props }) => <ul className="list-disc pl-4 mb-2 text-gray-200" {...props} />,
                        li: ({ ...props }) => <li className="mb-1" {...props} />,
                        p: ({ ...props }) => <p className="text-gray-200 mb-2" {...props} />,

                        code({ inline, children, ...props }: React.HTMLAttributes<HTMLElement> & { inline?: boolean }) {
                          return inline ? (
                            <code className="bg-gray-700/60 text-gray-100 px-1 py-0.5 rounded" {...props}>
                              {children}
                            </code>
                          ) : (
                            <code className=" text-purple-300 rounded px-2 py-1 mb-2 inline-block" {...props}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {summary || ''}
                    </ReactMarkdown>
                  ) : null}
                </div>
              </div>


            </div>
            <div className="w-full  px-8">
              <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-6 backdrop-blur-sm">
                <p className="text-center text-sm text-gray-400">
                  Ask me anything or use the tools above to explore different capabilities.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4">
              <div className="flex justify-between text-gray-400">
                {/* <div className="flex gap-2 text-sm opacity-70">
                  <span>/key</span>
                  <span>/model</span>
                  <span>/clear</span>
                </div> */}
              </div>
              <div className="mt-4">
                <input
                  type="text"
                  // placeholder="Message Gemini..."
                  className="w-full rounded-full bg-gray-800/50 px-4 py-2 text-sm outline-none ring-1 ring-gray-700/50 transition-all focus:ring-purple-300/50 focus:ring"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          // onClick={() => setIsOpen(!isOpen)}
          onClick={() => {
            setIsOpen(!isOpen);
            if (isOpen) {
              onClose?.();
            }
          }}
          className={`absolute ${position === 'right' ? '-left-8' : '-right-8'} top-1/2 transform -translate-y-1/2 bg-black p-2 ${position === 'right' ? 'rounded-l-xl' : 'rounded-r-xl'}`}
        >
          {isOpen ? (
            position === 'right' ? <ChevronRight className="w-4 h-4 text-gray-400" /> : <ChevronLeft className="w-4 h-4 text-gray-400" />
          ) : (
            position === 'right' ? <ChevronLeft className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </button>

      </motion.div>
    </>
  )
}
