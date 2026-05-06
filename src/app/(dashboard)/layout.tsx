"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Layout, Menu, Spin, Avatar, Dropdown, Typography, Button } from "antd";
import {
  DashboardOutlined,
  ThunderboltOutlined,
  MessageOutlined,
  AppstoreOutlined,
  ReadOutlined,
  FileTextOutlined,
  SettingOutlined,
  SafetyOutlined,
  LogoutOutlined,
  UserOutlined,
  MenuOutlined,
} from "@ant-design/icons";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const navItems = [
  { key: "/dashboard", label: "Dashboard", icon: <DashboardOutlined /> },
  { key: "/skills", label: "Skills", icon: <ThunderboltOutlined /> },
  { key: "/chat", label: "Chat", icon: <MessageOutlined /> },
  { key: "/apps", label: "Apps", icon: <AppstoreOutlined /> },
  { key: "/ai-feed", label: "AI Feed", icon: <ReadOutlined /> },
  { key: "/drafts", label: "Drafts", icon: <FileTextOutlined /> },
  { key: "/settings", label: "Settings", icon: <SettingOutlined /> },
];

const adminItems = [
  { key: "/admin/dashboard", label: "Admin Panel", icon: <SafetyOutlined /> },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!user) return null;

  const isAdmin = user.role === "admin";
  const items = [
    ...navItems.map((it) => ({ ...it })),
    ...(isAdmin
      ? [{ type: "divider" as const }, ...adminItems]
      : []),
  ];

  const selectedKey =
    items.find(
      (it: any) => it.key && (pathname === it.key || pathname.startsWith(it.key + "/"))
    )?.key || "/dashboard";

  return (
    <Layout style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <Sider
        breakpoint="md"
        collapsedWidth="0"
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={240}
        style={{
          background: "#ffffff",
          borderRight: "1px solid #e2e8f0",
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
      >
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            paddingLeft: 24,
            borderBottom: "1px solid #e2e8f0",
            fontSize: 18,
            fontWeight: 700,
            color: "#0f172a",
          }}
        >
          MulApps Hub
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey as string]}
          items={items as any}
          onClick={({ key }) => router.push(key as string)}
          style={{ borderInlineEnd: "none", padding: "8px" }}
        />
      </Sider>

      <Layout style={{ background: "#f8fafc" }}>
        <Header
          style={{
            background: "#ffffff",
            borderBottom: "1px solid #e2e8f0",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />

          <Dropdown
            menu={{
              items: [
                {
                  key: "user",
                  label: (
                    <div style={{ padding: "4px 0" }}>
                      <Text strong>{user.name || user.email}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {user.role}
                      </Text>
                    </div>
                  ),
                  disabled: true,
                },
                { type: "divider" },
                {
                  key: "settings",
                  icon: <SettingOutlined />,
                  label: "Settings",
                  onClick: () => router.push("/settings"),
                },
                {
                  key: "logout",
                  icon: <LogoutOutlined />,
                  label: "Logout",
                  onClick: () => {
                    logout();
                    router.push("/login");
                  },
                  danger: true,
                },
              ],
            }}
            placement="bottomRight"
            trigger={["click"]}
          >
            <Button type="text" style={{ height: 40 }}>
              <Avatar
                size="small"
                icon={<UserOutlined />}
                style={{ background: "#2563eb", marginRight: 8 }}
              />
              <Text style={{ color: "#0f172a" }}>{user.name || user.email}</Text>
            </Button>
          </Dropdown>
        </Header>

        <Content style={{ padding: 0, background: "#f8fafc" }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
