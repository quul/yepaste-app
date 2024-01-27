import React, {useState} from "react";
import {Alert, Button, DatePicker, Form, Input, Select, Spin, TimeRangePickerProps} from "antd";
import dayjs, {Dayjs} from "dayjs";
import useSWR from "swr";

const LoginForm = () => {
  const [failureMsg, setFailureMsg] = useState("")
  const [loading, setLoading] = useState(false)
  type LoginFormType = {
    username: string,
    password: string,
  }
  const onFinish = (values: LoginFormType) => {
    setLoading(true)
    const options = {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    }
    fetch('/a/login', options)
      .then(res => res.json())
      .then(data => {
        if (data.code !== 200) {
          throw new Error(JSON.stringify(data))
        }
      })
      .catch(e => {
        setFailureMsg(e.message)
        setLoading(false)
      })
    // TODO: 如何让上级重绘，触发SWR
  }

  const onFinishFailed = () => {
  }

  return (
    <Spin spinning={loading}>
      {failureMsg ? <Alert message={failureMsg} type={"warning"}/> : null}
      <Form
        name="login"
        labelCol={{span: 8}}
        wrapperCol={{span: 16}}
        style={{maxWidth: 600}}
        disabled={loading}
        initialValues={{remember: true}}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item<string>
          label="Username"
          name="username"
          rules={[{required: true, message: 'Please input your username!'}]}
        >
          <Input/>
        </Form.Item>

        <Form.Item<string>
          label="Password"
          name="password"
          rules={[{required: true, message: 'Please input your password!'}]}
        >
          <Input.Password/>
        </Form.Item>

        <Form.Item wrapperCol={{offset: 8, span: 16}}>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Spin>
  )
}

const ContentSubmitForm: React.FC = () => {
  type PasteContentFieldType = {
    content: string,
    contentType: string,
    contentLanguage: string,
    password?: string,
    expireTime: Dayjs,
    key?: string,
  }
  const onFormFinish = (values: PasteContentFieldType) => {
    const data = new FormData()
    if (values.expireTime) {
      data.append('expireTime', values.expireTime.toISOString())
    }
    data.append('contentType', values.contentType)
    data.append('contentLanguage', values.contentLanguage)
    const content = new Blob([values.content])
    data.append('c', content, 'main')
    const options = {
      method: 'POST',
      body: data,
    }
    fetch('/a/new', options)
      .then(res => res.json())
      .then(data => {
        if (data.code === 200) {
          // FIXME: 临时措施
          window.location.href = `/s/${data.key}`
        }
      })
  }
  const onFormFinishFailed = () => {

  }

  const datePickerRangePresets: TimeRangePickerProps['presets'] = [
    // Following ts-ignores because what I copied from official demo gives me an error.
    // @ts-expect-error No such type currently
    {label: "1 hour", value: dayjs().add(1, 'hour')},
    // @ts-expect-error No such type currently
    {label: "1 day", value: dayjs().add(1, 'day')},
    // @ts-expect-error No such type currently
    {label: "1 month", value: dayjs().add(1, 'month')}
  ]
  return (<div id={"main"}>
    <Form
      name="pastebin"
      labelCol={{span: 8}}
      wrapperCol={{span: 16}}
      style={{maxWidth: 1000}}
      initialValues={{contentLanguage: "auto", contentType: "text/plaintext"}}
      onFinish={onFormFinish}
      onFinishFailed={onFormFinishFailed}
      autoComplete="off"
    >
      <Form.Item<string>
        label={"content"}
        name={"content"}
        rules={[{required: true, message: "Please input the paste content."}]}
      >
        <Input.TextArea/>
        {/*TODO: Support drag file here*/}
      </Form.Item>

      <Form.Item<string>
        label={"content type"}
        name={"contentType"}
      >
        <Select options={[{value: "text/plaintext"}]}/>
      </Form.Item>

      <Form.Item<string>
        label={"content language"}
        name={"contentLanguage"}
      >
        <Select options={[{value: "auto"}]}/>
      </Form.Item>

      <Form.Item
        label={"expire time"}
        name={"expireTime"}
      >
        {/*@ts-expect-error: No such type currently*/}
        <DatePicker showTime presets={datePickerRangePresets}/>
      </Form.Item>

      <Form.Item wrapperCol={{offset: 8, span: 16}}>
        <Button type={"primary"} htmlType={"submit"}>
          Submit
        </Button>
      </Form.Item>
    </Form>
  </div>)
}

export default function Root() {
  type NewContentInfoType = {
    key: string,
  }
  // @ts-ignore
  const [newContentInfo, setNewContentInfo] = useState<NewContentInfoType>()
  // Fetch user info
  type UserInfoResponseType = {
    code: number,
    username?: string,
  }

  async function fetcher(
    input: RequestInfo,
    init?: RequestInit
  ): Promise<UserInfoResponseType> {
    const res = await fetch(input, init)
    return res.json()
  }

  const {data, error, isLoading} = useSWR('/a/auth/check', fetcher)
  const username = data?.code === 200 ? data.username! : null

  if (error) {
    return <Alert
      message={"Failed to load"}
      description={error.message}
      type={"error"}
    />
  }

  return (<div id={'main'}>
    <Spin spinning={isLoading}>
      {username ?
        <div id={"content"}>
          <Alert message={`Hello, ${username}`}/>
          <ContentSubmitForm />
        </div>
        :
        <div id={"loginRequired"}>
          <LoginForm/>
        </div>
      }
    </Spin>
  </div>)
}
