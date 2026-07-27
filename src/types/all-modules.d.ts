declare module "react-native" {
  export * from "react-native/types";
}

declare module "react-native-safe-area-context" {
  import { ComponentType, ReactNode } from "react";
  import { ViewStyle } from "react-native";

  export function useSafeAreaInsets(): {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };

  export const SafeAreaProvider: ComponentType<{ children?: ReactNode }>;
  export const SafeAreaView: ComponentType<{
    children?: ReactNode;
    className?: string;
    style?: any;
  }>;
}

declare module "@expo/vector-icons" {
  import { ComponentType } from "react";
  import { TextProps } from "react-native";

  interface IconProps extends TextProps {
    name: string;
    size?: number;
    color?: string;
  }

  export const Ionicons: ComponentType<IconProps>;
}

declare module "expo-status-bar" {
  import { ComponentType } from "react";

  interface StatusBarProps {
    style?: "light" | "dark" | "auto";
    animated?: boolean;
    hidden?: boolean;
  }

  export const StatusBar: ComponentType<StatusBarProps>;
}

declare module "expo-linear-gradient" {
  import { ComponentType } from "react";
  import { ViewStyle } from "react-native";

  interface LinearGradientProps {
    colors: readonly string[];
    start?: { x: number; y: number };
    end?: { x: number; y: number };
    locations?: readonly number[];
    className?: string;
    style?: any;
    children?: any;
  }

  export const LinearGradient: ComponentType<LinearGradientProps>;
}
