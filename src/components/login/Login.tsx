import { Form, Input, Button, Typography } from "antd";
import OneTouchIcon from "../assets/OneTouchIcon.svg";
import "./login.css"; // Import the CSS file

const { Title, Text } = Typography;

const Login = () => {
  const onFinish = (values: any) => {
    console.log("Success:", values);
  }; 

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img src={OneTouchIcon} alt="Icon" className="onetoch-logo" />
        <div className="login-header">
          <Title level={2}>ONE TOUCH</Title>
          <Text>Feel More Connected</Text>
        </div>

        <Form name="login" initialValues={{ remember: true }} onFinish={onFinish} onFinishFailed={onFinishFailed} layout="vertical">
          <Form.Item label="Email" name="username" rules={[{ required: true, message: "Please input your email!" }]}>
            <Input placeholder="abc@mail.com" />
          </Form.Item>

          <Form.Item label="Password" name="password" rules={[{ required: true, message: "Please input your password!" }]}>
            <Input.Password placeholder="Password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block className="login-button">
              Log In
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login;
