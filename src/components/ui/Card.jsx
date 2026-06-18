export function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/80 shadow-md shadow-slate-200/60 hover:shadow-lg hover:shadow-indigo-500/10 transition-shadow duration-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }) {
  return <div className={`px-5 py-4 border-b border-slate-100 ${className}`}>{children}</div>
}

export function CardBody({ children, className = '' }) {
  return <div className={`px-5 py-4 ${className}`}>{children}</div>
}
