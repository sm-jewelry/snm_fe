import React from 'react'

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(err: Error) {
    console.error('ErrorBoundary caught:', err)
  }

  render() {
    if (this.state.hasError) {
      return <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
        Something went wrong.
      </div>
    }
    return this.props.children
  }
}
