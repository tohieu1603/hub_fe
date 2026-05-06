"use client";

import { useAuth } from "@/lib/auth-context";
import { Card, Descriptions, Tag, Button, Space, Typography } from "antd";
import { LogoutOutlined, UserOutlined, CloudServerOutlined } from "@ant-design/icons";

const { Title } = Typography;

export default function SettingsPage() {
  const { user, machine, logout } = useAuth();
  if (!user) return null;

  return (
    <div style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
      <Title level={3} style={{ marginBottom: 24 }}>Settings</Title>

      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Card title={<><UserOutlined /> Account</>}>
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="Name">{user.name}</Descriptions.Item>
            <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
            <Descriptions.Item label="Role">
              <Tag color={user.role === "admin" ? "gold" : "default"}>{user.role}</Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title={<><CloudServerOutlined /> Machine</>}>
          {machine ? (
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Name">{machine.name}</Descriptions.Item>
              <Descriptions.Item label="Hub URL">
                <span style={{ wordBreak: "break-all" }}>{machine.hub_url}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={machine.status === "active" ? "success" : "default"}>
                  {machine.status}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          ) : (
            <Typography.Text type="secondary">No machine assigned</Typography.Text>
          )}
        </Card>

        <Button type="primary" danger icon={<LogoutOutlined />} onClick={logout}>
          Sign out
        </Button>
      </Space>
    </div>
  );
}
