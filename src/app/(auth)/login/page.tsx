"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Card, Form, Input, Button, Typography, message } from "antd";
import { LoginOutlined, MailOutlined, LockOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function LoginPage() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [msg, msgCtx] = message.useMessage();

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const res = await api.auth.login(values);
      await login(res.token);
      window.location.href = "/dashboard";
    } catch (err) {
      msg.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      style={{
        width: "100%",
        maxWidth: 420,
        boxShadow: "0 20px 60px rgba(15, 23, 42, 0.08)",
        border: "1px solid #e2e8f0",
      }}
    >
      {msgCtx}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <Title level={3} style={{ margin: 0 }}>
          Sign in
        </Title>
        <Text type="secondary">Đăng nhập vào MulApps Hub</Text>
      </div>
      <Form layout="vertical" onFinish={onFinish} requiredMark={false} size="large">
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Nhập email" },
            { type: "email", message: "Email không hợp lệ" },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="you@example.com" autoComplete="email" />
        </Form.Item>
        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: "Nhập password" }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="••••••••" autoComplete="current-password" />
        </Form.Item>
        <Form.Item style={{ marginBottom: 12 }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={<LoginOutlined />}
            block
          >
            Sign in
          </Button>
        </Form.Item>
        <div style={{ textAlign: "center" }}>
          <Text type="secondary">Chưa có tài khoản? </Text>
          <Link href="/register">Register</Link>
        </div>
      </Form>
    </Card>
  );
}
