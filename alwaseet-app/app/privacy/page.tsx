import NotFound from "next/navigation"

const PrivacyPage = () => {
  NotFound.notFound()
  return (
    <div>
      {/* This content will never be rendered because of the notFound() call. */}
      <h1>Privacy Policy</h1>
      <p>This page does not exist.</p>
    </div>
  )
}

export default PrivacyPage
