export default function MagicLinkPage() {
  return (
    <div className="flex h-full flex-col">
      <h1>Magic Link</h1>
      <p>This page is for magic link authentication.</p>

      <iframe title="connect embed" src="/connect-v1" className="flex-1" />
    </div>
  )
}
