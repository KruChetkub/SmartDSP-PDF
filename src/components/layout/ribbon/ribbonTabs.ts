// SPDX-License-Identifier: AGPL-3.0-or-later

import { t } from '../../../i18n/translations';
import type { AppLanguage } from '../../../types/settings';
import type { RibbonTabType } from './ribbonTypes';

export const getRibbonTabs = (language: AppLanguage): Array<{
  id: RibbonTabType;
  label: string;
}> => [
  { id: 'home', label: t('tabHome', language) },
  { id: 'edit', label: t('tabEdit', language) },
  { id: 'comment', label: t('tabComment', language) },
  { id: 'view', label: t('tabView', language) },
  { id: 'forms', label: t('tabForms', language) },
  { id: 'security', label: t('tabSecurity', language) },
  { id: 'review', label: t('tabReview', language) },
  { id: 'tools', label: t('tabTools', language) },
];
