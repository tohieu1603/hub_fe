"use client";

/**
 * BlockStyleEditor — Collapse panel với full style controls cho 1 block.
 * Map vào field `style` của block (theo api_post.md BlockStyle spec).
 */
import {
  Collapse,
  Form,
  ColorPicker,
  Slider,
  Select,
  Input,
  InputNumber,
  Row,
  Col,
  Space,
  Typography,
} from "antd";
import { BgColorsOutlined } from "@ant-design/icons";

const { Text } = Typography;

export interface BlockStyle {
  // spacing
  marginTop?: number;
  marginBottom?: number;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  // background
  background?: { color?: string; gradient?: string; type?: string };
  backgroundColor?: string;
  // text
  textColor?: string;
  textAlign?: "left" | "center" | "right" | "justify";
  fontSize?: string;
  fontWeight?: number | string;
  lineHeight?: number;
  // border
  borderWidth?: number;
  borderColor?: string;
  borderRadius?: number;
  // shadow
  shadow?: { preset?: string };
  // animation
  animation?: { entrance?: string; entranceDuration?: number; hoverEffect?: string };
  // custom
  tailwindClasses?: string;
  cssOverride?: string;
  className?: string;
}

const ENTRANCE_OPTIONS = [
  "fade", "fade-up", "fade-down", "fade-left", "fade-right",
  "slide-up", "slide-down", "zoom-in", "zoom-out", "flip", "bounce",
];

const HOVER_OPTIONS = ["none", "lift", "glow", "scale", "shake", "pulse", "rotate"];

const SHADOW_OPTIONS = ["none", "sm", "md", "lg", "xl", "2xl", "inner", "glow"];

interface Props {
  value?: BlockStyle;
  onChange: (style: BlockStyle) => void;
  disabled?: boolean;
}

export function BlockStyleEditor({ value, onChange, disabled }: Props) {
  const s = value || {};
  const update = (patch: Partial<BlockStyle>) => onChange({ ...s, ...patch });

  return (
    <Collapse
      ghost
      size="small"
      items={[
        {
          key: "style",
          label: (
            <Text type="secondary">
              <BgColorsOutlined /> Style chi tiết (background, color, spacing, border, animation, Tailwind)
            </Text>
          ),
          children: (
            <Form layout="vertical" size="small" disabled={disabled}>
              {/* Background + Text colors */}
              <Row gutter={12}>
                <Col xs={12} md={6}>
                  <Form.Item label="Background color">
                    <ColorPicker
                      value={s.backgroundColor}
                      onChange={(_, hex) => update({ backgroundColor: hex })}
                      showText
                      allowClear
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Item label="Text color">
                    <ColorPicker
                      value={s.textColor}
                      onChange={(_, hex) => update({ textColor: hex })}
                      showText
                      allowClear
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Item label="Border color">
                    <ColorPicker
                      value={s.borderColor}
                      onChange={(_, hex) => update({ borderColor: hex })}
                      showText
                      allowClear
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Item label="Border radius (px)">
                    <Slider
                      min={0}
                      max={40}
                      value={s.borderRadius || 0}
                      onChange={(v) => update({ borderRadius: v })}
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* Border + Shadow */}
              <Row gutter={12}>
                <Col xs={12} md={6}>
                  <Form.Item label="Border width (px)">
                    <InputNumber
                      min={0}
                      max={10}
                      value={s.borderWidth || 0}
                      onChange={(v) => update({ borderWidth: v ?? 0 })}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Item label="Shadow preset">
                    <Select
                      value={s.shadow?.preset || "none"}
                      onChange={(v) => update({ shadow: { preset: v } })}
                      options={SHADOW_OPTIONS.map((o) => ({ value: o, label: o }))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Item label="Text align">
                    <Select
                      value={s.textAlign || "left"}
                      onChange={(v) => update({ textAlign: v })}
                      options={[
                        { value: "left", label: "Left" },
                        { value: "center", label: "Center" },
                        { value: "right", label: "Right" },
                        { value: "justify", label: "Justify" },
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Item label="Font weight">
                    <Select
                      value={s.fontWeight || 400}
                      onChange={(v) => update({ fontWeight: v })}
                      options={[
                        { value: 300, label: "Light (300)" },
                        { value: 400, label: "Regular (400)" },
                        { value: 500, label: "Medium (500)" },
                        { value: 600, label: "Semibold (600)" },
                        { value: 700, label: "Bold (700)" },
                        { value: 800, label: "Extrabold (800)" },
                        { value: 900, label: "Black (900)" },
                      ]}
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* Spacing */}
              <Row gutter={12}>
                <Col xs={12} md={6}>
                  <Form.Item label="Margin top (px)">
                    <Slider min={0} max={80} value={s.marginTop || 0} onChange={(v) => update({ marginTop: v })} />
                  </Form.Item>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Item label="Margin bottom (px)">
                    <Slider min={0} max={80} value={s.marginBottom || 0} onChange={(v) => update({ marginBottom: v })} />
                  </Form.Item>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Item label="Padding Y (px)">
                    <Slider
                      min={0}
                      max={80}
                      value={s.paddingTop || 0}
                      onChange={(v) => update({ paddingTop: v, paddingBottom: v })}
                    />
                  </Form.Item>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Item label="Padding X (px)">
                    <Slider
                      min={0}
                      max={80}
                      value={s.paddingLeft || 0}
                      onChange={(v) => update({ paddingLeft: v, paddingRight: v })}
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* Animation */}
              <Row gutter={12}>
                <Col xs={12} md={8}>
                  <Form.Item label="Entrance animation">
                    <Select
                      value={s.animation?.entrance}
                      onChange={(v) => update({ animation: { ...(s.animation || {}), entrance: v } })}
                      options={[{ value: "", label: "None" }, ...ENTRANCE_OPTIONS.map((o) => ({ value: o, label: o }))]}
                      allowClear
                    />
                  </Form.Item>
                </Col>
                <Col xs={12} md={8}>
                  <Form.Item label="Hover effect">
                    <Select
                      value={s.animation?.hoverEffect}
                      onChange={(v) => update({ animation: { ...(s.animation || {}), hoverEffect: v } })}
                      options={HOVER_OPTIONS.map((o) => ({ value: o, label: o }))}
                      allowClear
                    />
                  </Form.Item>
                </Col>
                <Col xs={12} md={8}>
                  <Form.Item label="Font size">
                    <Input
                      value={s.fontSize || ""}
                      onChange={(e) => update({ fontSize: e.target.value })}
                      placeholder="1.2rem, 16px..."
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* Custom Tailwind / CSS */}
              <Form.Item label="Tailwind classes (override mọi style trên)">
                <Input
                  value={s.tailwindClasses || ""}
                  onChange={(e) => update({ tailwindClasses: e.target.value })}
                  placeholder="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-2xl shadow-xl"
                />
              </Form.Item>
              <Form.Item label="CSS override (raw)">
                <Input.TextArea
                  rows={2}
                  value={s.cssOverride || ""}
                  onChange={(e) => update({ cssOverride: e.target.value })}
                  placeholder="box-shadow: 0 0 30px rgba(99,102,241,0.3);"
                />
              </Form.Item>
            </Form>
          ),
        },
      ]}
    />
  );
}
