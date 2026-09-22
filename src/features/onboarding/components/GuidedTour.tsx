// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Sparkles, X } from 'lucide-react';
import type { AppLanguage } from '../../../types/settings';
import { getTourChapters } from '../config/tourSteps';
import type { TourTab, TourTargetRect } from '../types/tour';

interface GuidedTourProps {
  isOpen: boolean;
  language: AppLanguage;
  onClose: () => void;
  onTabChange: (tab: TourTab) => void;
}

const TARGET_PADDING = 6;
const DESKTOP_WIDTH = 820;
const VIEWPORT_GAP = 16;

const clamp = (value: number, min: number, max: number) => (
  Math.min(Math.max(value, min), max)
);

const targetRectsMatch = (current: TourTargetRect | null, next: TourTargetRect) => (
  current !== null
  && current.top === next.top
  && current.left === next.left
  && current.right === next.right
  && current.bottom === next.bottom
  && current.width === next.width
  && current.height === next.height
);

export const GuidedTour: React.FC<GuidedTourProps> = ({
  isOpen,
  language,
  onClose,
  onTabChange,
}) => {
  const chapters = useMemo(() => getTourChapters(language), [language]);
  const [chapterIndex, setChapterIndex] = useState(0);
  const [toolIndex, setToolIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<TourTargetRect | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const toolListRef = useRef<HTMLDivElement>(null);
  const currentChapter = chapters[chapterIndex];
  const currentTool = currentChapter.tools[toolIndex];

  const findTarget = useCallback(() => document.querySelector<HTMLElement>(
    `[data-tour-id="${currentTool.targetId}"]`,
  ), [currentTool.targetId]);

  const measureTarget = useCallback(() => {
    const target = findTarget();

    if (!target || target.offsetParent === null) return;

    const rect = target.getBoundingClientRect();
    const top = Math.max(0, rect.top - TARGET_PADDING);
    const left = Math.max(0, rect.left - TARGET_PADDING);
    const right = Math.min(window.innerWidth, rect.right + TARGET_PADDING);
    const bottom = Math.min(window.innerHeight, rect.bottom + TARGET_PADDING);
    const nextRect = {
      top,
      left,
      right,
      bottom,
      width: right - left,
      height: bottom - top,
    };

    setTargetRect((current) => (targetRectsMatch(current, nextRect) ? current : nextRect));
  }, [findTarget]);

  const scrollTargetIntoView = useCallback(() => {
    const target = findTarget();
    if (!target || target.offsetParent === null) return;
    target.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [findTarget]);

  useEffect(() => {
    if (!isOpen) {
      setTargetRect(null);
      return;
    }
    setChapterIndex(0);
    setToolIndex(0);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    onTabChange(currentChapter.tab);
    let secondFrame = 0;
    const firstFrame = window.requestAnimationFrame(() => {
      scrollTargetIntoView();
      secondFrame = window.requestAnimationFrame(measureTarget);
    });
    const settleTimer = window.setTimeout(measureTarget, 180);

    window.addEventListener('resize', measureTarget);
    window.addEventListener('scroll', measureTarget, true);
    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      window.clearTimeout(settleTimer);
      window.removeEventListener('resize', measureTarget);
      window.removeEventListener('scroll', measureTarget, true);
    };
  }, [
    currentChapter.tab,
    currentTool.id,
    isOpen,
    measureTarget,
    onTabChange,
    scrollTargetIntoView,
  ]);

  useEffect(() => {
    if (!isOpen) return;
    const activeCard = toolListRef.current?.querySelector<HTMLElement>(
      `[data-tour-card="${currentTool.id}"]`,
    );
    activeCard?.scrollIntoView({ block: 'nearest' });
  }, [currentTool.id, isOpen]);

  const goBack = useCallback(() => {
    if (toolIndex > 0) {
      setToolIndex((current) => current - 1);
      return;
    }
    if (chapterIndex > 0) {
      const previousChapter = chapters[chapterIndex - 1];
      setChapterIndex((current) => current - 1);
      setToolIndex(previousChapter.tools.length - 1);
    }
  }, [chapterIndex, chapters, toolIndex]);

  const goNext = useCallback(() => {
    if (toolIndex < currentChapter.tools.length - 1) {
      setToolIndex((current) => current + 1);
      return;
    }
    if (chapterIndex < chapters.length - 1) {
      setChapterIndex((current) => current + 1);
      setToolIndex(0);
      return;
    }
    onClose();
  }, [chapterIndex, chapters.length, currentChapter.tools.length, onClose, toolIndex]);

  const skipChapter = useCallback(() => {
    if (chapterIndex === chapters.length - 1) {
      onClose();
      return;
    }
    setChapterIndex((current) => current + 1);
    setToolIndex(0);
  }, [chapterIndex, chapters.length, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft') goBack();
      if (event.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    dialogRef.current?.focus();
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goBack, goNext, isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const dialogWidth = Math.min(DESKTOP_WIDTH, viewportWidth - VIEWPORT_GAP * 2);
  const dialogLeft = targetRect
    ? clamp(
      targetRect.left + targetRect.width / 2 - dialogWidth / 2,
      VIEWPORT_GAP,
      viewportWidth - dialogWidth - VIEWPORT_GAP,
    )
    : viewportWidth / 2;
  let dialogTop = targetRect ? targetRect.bottom + 14 : 12;
  if (targetRect && viewportHeight - dialogTop < 360) dialogTop = 12;
  const dialogMaxHeight = Math.max(180, viewportHeight - dialogTop - 12);
  const isFirstTool = chapterIndex === 0 && toolIndex === 0;
  const isLastTool = chapterIndex === chapters.length - 1
    && toolIndex === currentChapter.tools.length - 1;
  const ActiveIcon = currentTool.icon;

  const labels = language === 'th'
    ? {
      guide: 'คู่มือการใช้งาน SmartDSP PDF',
      chapter: 'หมวด',
      tool: 'เครื่องมือ',
      skip: 'ข้ามคำแนะนำ',
      skipChapter: 'ข้ามหมวดนี้',
      back: 'ย้อนกลับ',
      next: 'เครื่องมือถัดไป',
      finish: 'เริ่มใช้งาน',
    }
    : {
      guide: 'SmartDSP PDF guide',
      chapter: 'Chapter',
      tool: 'Tool',
      skip: 'Skip tour',
      skipChapter: 'Skip chapter',
      back: 'Back',
      next: 'Next tool',
      finish: 'Start using',
    };

  return createPortal(
    <div className="fixed inset-0 z-[100]">
      {targetRect ? (
        <>
          <div className="fixed bg-slate-950/70 backdrop-blur-[1px]" style={{ top: 0, left: 0, right: 0, height: targetRect.top }} />
          <div className="fixed bg-slate-950/70 backdrop-blur-[1px]" style={{ top: targetRect.top, left: 0, width: targetRect.left, height: targetRect.height }} />
          <div className="fixed bg-slate-950/70 backdrop-blur-[1px]" style={{ top: targetRect.top, left: targetRect.right, right: 0, height: targetRect.height }} />
          <div className="fixed bg-slate-950/70 backdrop-blur-[1px]" style={{ top: targetRect.bottom, left: 0, right: 0, bottom: 0 }} />
          <div
            className="fixed rounded-xl border-2 border-pink-400 bg-pink-400/5 ring-4 ring-pink-400/30 transition-all duration-200"
            style={{
              top: targetRect.top,
              left: targetRect.left,
              width: targetRect.width,
              height: targetRect.height,
            }}
          />
        </>
      ) : (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-[1px]" />
      )}

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="guided-tour-title"
        aria-describedby="guided-tour-summary"
        tabIndex={-1}
        className="fixed flex flex-col overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-2xl outline-none dark:border-pink-900/60 dark:bg-slate-900"
        style={{
          top: dialogTop,
          left: dialogLeft,
          width: dialogWidth,
          maxHeight: dialogMaxHeight,
          transform: targetRect ? undefined : 'translateX(-50%)',
        }}
      >
        <div className="h-1.5 shrink-0 bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-500" />

        <header className="shrink-0 border-b border-slate-100 px-4 py-4 sm:px-6 dark:border-slate-800">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-pink-600 dark:text-pink-400">
                <Sparkles className="h-5 w-5 shrink-0" />
                <span className="text-sm font-bold tracking-wide">{labels.guide}</span>
              </div>
              <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h2 id="guided-tour-title" className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
                  {currentChapter.title}
                </h2>
                <span className="rounded-full bg-pink-50 px-3 py-1 text-sm font-semibold text-pink-700 dark:bg-pink-950/50 dark:text-pink-300">
                  {labels.chapter} {chapterIndex + 1}/{chapters.length}
                </span>
              </div>
              <p id="guided-tour-summary" className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-300">
                {currentChapter.summary}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer"
              aria-label={labels.skip}
              title={labels.skip}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 flex gap-1.5" aria-hidden="true">
            {chapters.map((chapter, index) => (
              <span
                key={chapter.id}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  index === chapterIndex
                    ? 'bg-pink-600'
                    : index < chapterIndex
                      ? 'bg-pink-300 dark:bg-pink-800'
                      : 'bg-slate-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>
        </header>

        <div ref={toolListRef} className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-5">
          <div className="mb-4 rounded-2xl border-2 border-pink-400 bg-pink-50/70 p-4 dark:border-pink-700 dark:bg-pink-950/30">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pink-600 text-white shadow-sm">
                <ActiveIcon className="h-6 w-6" />
              </span>
              <div>
                <p className="text-sm font-semibold text-pink-700 dark:text-pink-300">
                  {labels.tool} {toolIndex + 1}/{currentChapter.tools.length}
                </p>
                <h3 className="mt-0.5 text-xl font-bold text-slate-900 dark:text-white">
                  {currentTool.name}
                </h3>
                <p className="mt-1 text-base leading-7 text-slate-700 dark:text-slate-200">
                  {currentTool.description}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
            {currentChapter.tools.map((item, index) => {
              const ItemIcon = item.icon;
              const isActive = index === toolIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  data-tour-card={item.id}
                  onClick={() => setToolIndex(index)}
                  aria-current={isActive ? 'step' : undefined}
                  className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                    isActive
                      ? 'border-pink-400 bg-pink-50 text-slate-900 shadow-sm dark:border-pink-700 dark:bg-pink-950/30 dark:text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-pink-200 hover:bg-pink-50/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-pink-900 dark:hover:bg-pink-950/20'
                  }`}
                >
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    isActive
                      ? 'bg-pink-600 text-white'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    <ItemIcon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-base font-bold">{item.name}</span>
                    <span className="mt-0.5 block text-sm leading-5 text-slate-500 dark:text-slate-400">
                      {item.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <footer className="shrink-0 border-t border-slate-100 bg-slate-50/90 px-3 py-3 sm:px-5 dark:border-slate-800 dark:bg-slate-950/50">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center justify-between gap-4 sm:justify-start">
              <button
                type="button"
                onClick={onClose}
                className="text-sm font-semibold text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-white cursor-pointer"
              >
                {labels.skip}
              </button>
              {currentChapter.tools.length > 1 && (
                <button
                  type="button"
                  onClick={skipChapter}
                  className="text-sm font-semibold text-pink-600 transition-colors hover:text-pink-800 dark:text-pink-400 dark:hover:text-pink-300 cursor-pointer"
                >
                  {labels.skipChapter}
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goBack}
                disabled={isFirstTool}
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-35 sm:flex-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
                {labels.back}
              </button>
              <button
                type="button"
                onClick={goNext}
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-pink-600 px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-pink-700 active:bg-pink-800 sm:flex-none cursor-pointer"
              >
                {isLastTool ? labels.finish : labels.next}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>,
    document.body,
  );
};
