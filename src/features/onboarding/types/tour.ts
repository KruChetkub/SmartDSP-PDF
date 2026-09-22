// SPDX-License-Identifier: AGPL-3.0-or-later

import type { LucideIcon } from 'lucide-react';

export type TourTab =
  | 'home'
  | 'edit'
  | 'comment'
  | 'view'
  | 'forms'
  | 'security'
  | 'review'
  | 'tools';

export interface TourTool {
  id: string;
  targetId: string;
  name: string;
  description: string;
  icon: LucideIcon;
}

export interface TourChapter {
  id: TourTab;
  tab: TourTab;
  title: string;
  summary: string;
  tools: TourTool[];
}

export interface TourTargetRect {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}
