import { useEffect, useMemo, useState } from 'react'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

marked.setOptions({
  gfm: true,
  breaks: true,
  highlight(code, lang) {
    if (lang && hljs.getLanguage(lang)) return hljs.highlight(code, { language: lang }).value
    return hljs.highlightAuto(code).value
  }
})

export default function App() {
  const [src, setSrc] = useState(new URLSearchParams(location.search).get('src') || '/data/digest-latest.md')
  const [input, setInput] = useState(src)
  const [html, setHtml] = useState('<p>加载中...</p>')
  const [status, setStatus] = useState('准备加载')
  const [updated, setUpdated] = useState('')

  const fetchMd = async (target) => {
    try {
      setStatus('加载中…')
      const bust = `${target}${target.includes('?') ? '&' : '?'}v=${Date.now()}`
      const res = await fetch(bust, { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const text = await res.text()
      setHtml(marked.parse(text))
      setStatus('加载完成')
      setUpdated(new Date().toLocaleString('zh-CN'))
    } catch (e) {
      setStatus('加载失败')
      setHtml(`<h3>加载失败</h3><p>${e.message}</p><p>请确认路径可访问：${target}</p>`)
    }
  }

  useEffect(() => { fetchMd(src) }, [src])

  const onLoad = () => {
    const s = input.trim()
    const u = new URL(location.href)
    u.searchParams.set('src', s)
    history.replaceState({}, '', u)
    setSrc(s)
  }

  const quick = useMemo(() => [
    { label: '今日 Digest', value: '/data/digest-latest.md' },
    { label: 'GitHub 原始文件', value: 'https://raw.githubusercontent.com/Yeadon8888/digest-news-viewer/main/public/data/digest-latest.md' }
  ], [])

  return (
    <main className="page">
      <header className="hero">
        <h1>Digest Atlas</h1>
        <p>苹果风现代阅读页 · React 渲染 · 适配移动端</p>
      </header>

      <section className="panel">
        <div className="toolbar">
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="/data/digest-latest.md" />
          <button onClick={onLoad}>加载</button>
        </div>

        <div className="quick">
          {quick.map((q) => (
            <button key={q.label} className="ghost" onClick={() => { setInput(q.value); setSrc(q.value) }}>{q.label}</button>
          ))}
        </div>

        <div className="meta">状态：{status} {updated ? `· 更新于 ${updated}` : ''}</div>
        <article className="markdown-body" dangerouslySetInnerHTML={{ __html: html }} />
      </section>
    </main>
  )
}
