import {useEffect, useState} from "react";
import {Alert, Spin} from "antd";
import SyntaxHighlighter from 'react-syntax-highlighter'
import { idea } from 'react-syntax-highlighter/dist/esm/styles/hljs'


export default function Viewer() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [data, setData] = useState<string>("")
  useEffect(() => {
    // FIXME: 临时解决方案
    const key = window.location.href.split('/').at(-1)
    const fetchData = async () => {
      const  res = await fetch(`/r/${key}`)
      if (res.ok) {return res.text()}
      return res.json()
    }
    fetchData()
      .then(data=>{
        if (data.code) setError(JSON.stringify(data))
        setData(data)
        setLoading(false)
      })
  }, []);
  if (loading) return <Spin spinning={loading} />
  if (error) return <Alert message={error} />
  return <div id={"code"}>
    <SyntaxHighlighter style={idea}>
      {data}
    </SyntaxHighlighter>
  </div>
}