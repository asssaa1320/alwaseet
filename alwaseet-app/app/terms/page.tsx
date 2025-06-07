import { notFound } from "next/navigation"

const TermsPage = () => {
  notFound()
  return (
    <div>
      {/* This content will never be rendered because notFound() is called. */}
      <h1>Terms and Conditions</h1>
      <p>This page does not exist.</p>
    </div>
  )
}

export default TermsPage
